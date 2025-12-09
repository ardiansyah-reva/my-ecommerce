const { Order, OrderItem, Product, User, Payment, Shipment } = require("../models");
const sequelize = require("../db");

class OrderService {
  /**
   * Get all orders dengan pagination
   */
  async getAllOrders(userId = null, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const where = userId ? { user_id: userId } : {};

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { 
          model: User, 
          as: "user", 
          attributes: ["id", "full_name", "email", "nickname"] 
        },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: Payment, as: "payment" },
        { model: Shipment, as: "shipment" },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    return {
      orders: rows,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    const order = await Order.findByPk(orderId, {
      include: [
        { 
          model: User, 
          as: "user",
          attributes: { exclude: ['password'] } // ✅ Jangan return password
        },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
        { model: Payment, as: "payment" },
        { model: Shipment, as: "shipment" },
      ],
    });

    if (!order) {
      throw new Error("Order not found");
    }
    
    return order;
  }

  /**
   * Create order + auto cut stock + create shipment + create payment
   */
  async createOrder(userId, items = [], paymentData = {}, shipmentData = {}) {
    const t = await sequelize.transaction();

    try {
      // ✅ 1. Validasi input
      if (!items || items.length === 0) {
        throw new Error("Order must have at least one item");
      }

      if (!paymentData.method) {
        throw new Error("Payment method is required");
      }

      if (!shipmentData.courier) {
        throw new Error("Courier is required");
      }

      // ✅ 2. Hitung total price & validasi stok dengan LOCK
      let totalAmount = 0;
      const productDetails = [];

      for (const item of items) {
        // ✅ Lock row untuk prevent race condition
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
          lock: true // PENTING: Lock biar tidak conflict
        });

        if (!product) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }

        const itemTotal = Number(product.price) * item.quantity;
        totalAmount += itemTotal;

        productDetails.push({
          product,
          quantity: item.quantity,
          price: product.price,
          itemTotal
        });
      }

      // ✅ 3. Hitung shipping cost (bisa dikasih logic sendiri)
      const shippingCost = shipmentData.shipping_cost || 0;
      const grandTotal = totalAmount + shippingCost;

      // ✅ 4. Buat order
      const order = await Order.create(
        {
          user_id: userId,
          total_amount: grandTotal,
          shipping_cost: shippingCost,
          payment_method: paymentData.method,
          status: "PENDING", // Sesuai ENUM di model
        },
        { transaction: t }
      );

      // ✅ 5. Create order items + kurangi stock
      for (const detail of productDetails) {
        // Simpan snapshot harga dan nama produk
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: detail.product.id,
            product_name_snapshot: detail.product.name, // Snapshot nama
            price_snapshot: detail.price, // Snapshot harga
            quantity: detail.quantity,
          },
          { transaction: t }
        );

        // Kurangi stok
        detail.product.stock -= detail.quantity;
        await detail.product.save({ transaction: t });
      }

      // ✅ 6. Create shipment (tanpa field 'address' yang tidak ada)
      const shipment = await Shipment.create(
        {
          order_id: order.id,
          courier: shipmentData.courier,
          tracking_number: shipmentData.tracking_number || `TRK-${Date.now()}`, // Generate tracking number
          status: "waiting_pickup",
        },
        { transaction: t }
      );

      // ✅ 7. Create payment
      const payment = await Payment.create(
        {
          order_id: order.id,
          provider: paymentData.provider || paymentData.method, // e.g: "midtrans", "manual"
          status: "pending",
          transaction_id: `TXN-${Date.now()}-${order.id}`, // Generate transaction ID
          amount: grandTotal,
        },
        { transaction: t }
      );

      await t.commit();

      // ✅ Return dengan full data
      return { 
        order: {
          ...order.toJSON(),
          items: productDetails.map(d => ({
            product_id: d.product.id,
            product_name: d.product.name,
            quantity: d.quantity,
            price: d.price,
            subtotal: d.itemTotal
          }))
        }, 
        payment, 
        shipment 
      };

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    const validStatuses = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
      "CANCELED" // ✅ Sesuaikan dengan ENUM di model
    ];

    const normalizedStatus = status.toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const order = await Order.findByPk(orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // ✅ Validasi status transition
    if (order.status === "CANCELED" || order.status === "COMPLETED") {
      throw new Error(`Cannot update order with status: ${order.status}`);
    }

    await order.update({ status: normalizedStatus });
    
    return order;
  }

  /**
   * Cancel order + restore stock
   */
  async cancelOrder(orderId) {
    const t = await sequelize.transaction();

    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: OrderItem, as: "items" }],
        transaction: t
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // ✅ Cek apakah order bisa dibatalkan
      if (order.status === "CANCELED") {
        throw new Error("Order already cancelled");
      }

      if (order.status === "SHIPPED" || order.status === "DELIVERED" || order.status === "COMPLETED") {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
      }

      // ✅ Restore stok dengan lock
      for (const item of order.items) {
        const product = await Product.findByPk(item.product_id, {
          transaction: t,
          lock: true
        });

        if (!product) {
          console.warn(`Product ${item.product_id} not found, skipping stock restore`);
          continue;
        }

        product.stock += item.quantity;
        await product.save({ transaction: t });
      }

      // ✅ Update order status
      await order.update({ status: "CANCELED" }, { transaction: t });

      // ✅ Update payment status jika ada
      const payment = await Payment.findOne({
        where: { order_id: orderId },
        transaction: t
      });

      if (payment && payment.status === "pending") {
        await payment.update({ status: "canceled" }, { transaction: t });
      }

      await t.commit();
      
      return order;

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * ✅ BONUS: Get order summary for user
   */
  async getOrderSummary(orderId) {
    const order = await this.getOrderById(orderId);

    const itemsTotal = order.items.reduce(
      (sum, item) => sum + (item.price_snapshot * item.quantity),
      0
    );

    return {
      order_id: order.id,
      status: order.status,
      items_count: order.items.length,
      subtotal: itemsTotal,
      shipping_cost: order.shipping_cost,
      total: order.total_amount,
      payment: {
        method: order.payment_method,
        status: order.payment?.status || 'pending'
      },
      shipment: {
        courier: order.shipment?.courier,
        tracking_number: order.shipment?.tracking_number,
        status: order.shipment?.status
      },
      created_at: order.created_at
    };
  }
}

module.exports = new OrderService();