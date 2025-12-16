// Backend/controllers/order.controller.js
const { Order, OrderItem, Product, User, Payment, Shipment, ProductMedia, Category, Brand } = require("../models");
const sequelize = require("../db");

// GET semua order (dengan filter user jika perlu)
exports.getAllOrder = async (req, res) => {
  try {
    const userId = req.user.id; // Hanya ambil order user yang login
    
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                { model: ProductMedia, as: "media" },
                { model: Category, as: "category" },
                { model: Brand, as: "brand" }
              ]
            }
          ]
        },
        { model: Payment, as: "payment" },
        { model: Shipment, as: "shipment" }
      ],
      order: [["created_at", "DESC"]]
    });

    res.json({
      code: 200,
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.error("GET ALL ORDER ERROR:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// GET order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { 
        id: id,
        user_id: userId // Hanya bisa akses order sendiri
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                { model: ProductMedia, as: "media" },
                { model: Category, as: "category" },
                { model: Brand, as: "brand" }
              ]
            }
          ]
        },
        { model: Payment, as: "payment" },
        { model: Shipment, as: "shipment" }
      ]
    });

    if (!order) {
      return res.status(404).json({ 
        status: "error", 
        message: "Order not found" 
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: order
    });
  } catch (err) {
    console.error("GET ORDER BY ID ERROR:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// CREATE order (checkout dari cart)
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { items, paymentData, shipmentData } = req.body;

    console.log("CREATE ORDER REQUEST:", {
      userId,
      items,
      paymentData,
      shipmentData
    });

    // ✅ 1. Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Items are required and must be an array"
      });
    }

    if (!paymentData || !paymentData.method) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Payment method is required"
      });
    }

    if (!shipmentData || !shipmentData.courier) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "Courier is required"
      });
    }

    // ✅ 2. Hitung total & validasi stok dengan LOCK
    let totalAmount = 0;
    const productDetails = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        await t.rollback();
        return res.status(400).json({
          status: "error",
          message: "Each item must have product_id and quantity"
        });
      }

      // Lock row untuk prevent race condition
      const product = await Product.findByPk(item.product_id, {
        transaction: t,
        lock: true
      });

      if (!product) {
        await t.rollback();
        return res.status(404).json({
          status: "error",
          message: `Product with ID ${item.product_id} not found`
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      totalAmount += itemTotal;

      productDetails.push({
        product,
        quantity: item.quantity,
        price: product.price,
        itemTotal
      });
    }

    // ✅ 3. Hitung shipping cost
    const shippingCost = Number(shipmentData.shipping_cost) || 0;
    const grandTotal = totalAmount + shippingCost;

    console.log("ORDER CALCULATION:", {
      totalAmount,
      shippingCost,
      grandTotal
    });

    // ✅ 4. Buat order
    const order = await Order.create(
      {
        user_id: userId,
        total_amount: grandTotal,
        shipping_cost: shippingCost,
        payment_method: paymentData.method,
        status: "PENDING"
      },
      { transaction: t }
    );

    console.log("ORDER CREATED:", order.id);

    // ✅ 5. Create order items + kurangi stock
    for (const detail of productDetails) {
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: detail.product.id,
          product_name_snapshot: detail.product.name,
          price_snapshot: detail.price,
          quantity: detail.quantity
        },
        { transaction: t }
      );

      // Kurangi stok
      detail.product.stock -= detail.quantity;
      await detail.product.save({ transaction: t });
    }

    console.log("ORDER ITEMS CREATED");

    // ✅ 6. Create shipment
    const shipment = await Shipment.create(
      {
        order_id: order.id,
        courier: shipmentData.courier,
        tracking_number: shipmentData.tracking_number || `TRK-${Date.now()}-${order.id}`,
        status: "waiting_pickup"
      },
      { transaction: t }
    );

    console.log("SHIPMENT CREATED:", shipment.id);

    // ✅ 7. Create payment
    const payment = await Payment.create(
      {
        order_id: order.id,
        provider: paymentData.provider || paymentData.method,
        status: "pending",
        transaction_id: `TXN-${Date.now()}-${order.id}`,
        amount: grandTotal
      },
      { transaction: t }
    );

    console.log("PAYMENT CREATED:", payment.id);

    // ✅ 8. Commit transaction
    await t.commit();

    console.log("TRANSACTION COMMITTED");

    // ✅ 9. Fetch full order data
    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [
                { model: ProductMedia, as: "media" }
              ]
            }
          ]
        },
        { model: Payment, as: "payment" },
        { model: Shipment, as: "shipment" }
      ]
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Order created successfully",
      data: {
        order: fullOrder,
        payment,
        shipment
      }
    });

  } catch (err) {
    await t.rollback();
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to create order"
    });
  }
};

// UPDATE order status
exports.updateOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      where: { 
        id: id,
        user_id: userId 
      }
    });

    if (!order) {
      return res.status(404).json({ 
        status: "error", 
        message: "Order not found" 
      });
    }

    // Validasi status
    const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELED"];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        status: "error",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    await order.update({ status: status.toUpperCase() });

    res.json({
      code: 200,
      status: "success",
      message: "Order updated successfully",
      data: order
    });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// DELETE order (cancel order)
exports.deleteOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { 
        id: id,
        user_id: userId 
      },
      include: [{ model: OrderItem, as: "items" }],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ 
        status: "error", 
        message: "Order not found" 
      });
    }

    // Cek apakah order bisa dibatalkan
    if (["SHIPPED", "DELIVERED", "COMPLETED", "CANCELED"].includes(order.status)) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore stok
    for (const item of order.items) {
      const product = await Product.findByPk(item.product_id, {
        transaction: t,
        lock: true
      });

      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
    }

    // Update status jadi CANCELED
    await order.update({ status: "CANCELED" }, { transaction: t });

    // Update payment status
    await Payment.update(
      { status: "canceled" },
      { 
        where: { order_id: order.id },
        transaction: t 
      }
    );

    await t.commit();

    res.json({
      code: 200,
      status: "success",
      message: "Order canceled successfully"
    });
  } catch (err) {
    await t.rollback();
    console.error("DELETE ORDER ERROR:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};