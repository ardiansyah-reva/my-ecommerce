const { Cart, CartItem, Product, ProductMedia } = require("../models");
const sequelize = require("../db");

class CartService {
  // --------------------------------------------------------
  // GET / CREATE CART
  // --------------------------------------------------------
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              include: [{ model: ProductMedia, as: "media" }],
            },
          ],
        },
      ],
    });

    // Jika tidak ada, buat cart baru
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
      cart.items = [];
    }

    return cart;
  }

  // --------------------------------------------------------
  // ADD ITEM
  // --------------------------------------------------------
  async addItem(userId, productId, quantity = 1) {
    const cart = await this.getOrCreateCart(userId);
    const product = await Product.findByPk(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // ✅ Cek stok sebelum tambah ke cart
    if (product.stock < quantity) {
      throw new Error(`Stock not enough. Available: ${product.stock}`);
    }

    let item = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (item) {
      // ✅ Cek stok untuk quantity baru
      const newQuantity = item.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error(`Stock not enough. Available: ${product.stock}`);
      }
      item.quantity = newQuantity;
      await item.save();
    } else {
      item = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity,
      });
    }

    return { 
      message: "Item added to cart", 
      item 
    };
  }

  // --------------------------------------------------------
  // UPDATE ITEM
  // --------------------------------------------------------
  async updateItem(userId, productId, quantity) {
    const cart = await this.getOrCreateCart(userId);

    const item = await CartItem.findOne({
      where: { cart_id: cart.id, product_id: productId },
      include: [{ model: Product, as: "product" }]
    });

    if (!item) {
      throw new Error("Item not found in cart");
    }

    if (quantity <= 0) {
      await item.destroy();
      return { message: "Item removed from cart" };
    }

    // ✅ Cek stok sebelum update
    if (item.product.stock < quantity) {
      throw new Error(`Stock not enough. Available: ${item.product.stock}`);
    }

    item.quantity = quantity;
    await item.save();

    return { 
      message: "Cart item updated", 
      item 
    };
  }

  // --------------------------------------------------------
  // REMOVE ITEM
  // --------------------------------------------------------
  async removeItem(userId, productId) {
    const cart = await this.getOrCreateCart(userId);

    const deleted = await CartItem.destroy({
      where: { cart_id: cart.id, product_id: productId },
    });

    if (!deleted) {
      throw new Error("Item not found in cart");
    }

    return { message: "Item removed from cart" };
  }

  // --------------------------------------------------------
  // GET CART TOTAL
  // --------------------------------------------------------
  async getCartTotal(userId) {
    const cart = await this.getOrCreateCart(userId);

    const total = cart.items.reduce(
      (sum, item) => sum + (item.quantity * item.product.price),
      0
    );

    return {
      subtotal: total,
      items: cart.items.length,
      cart: cart
    };
  }

  // --------------------------------------------------------
  // CHECKOUT WITH TRANSACTION (AMAN!)
  // --------------------------------------------------------
  async checkout(userId) {
    const transaction = await sequelize.transaction();

    try {
      const cart = await Cart.findOne({
        where: { user_id: userId },
        include: [
          {
            model: CartItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
        ],
        transaction
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // ✅ Cek stok semua item dulu sebelum kurangi
      for (const item of cart.items) {
        const product = await Product.findByPk(item.product_id, { 
          transaction,
          lock: true // ✅ Lock row untuk prevent race condition
        });

        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Stock not enough for: ${product.name}. Available: ${product.stock}`);
        }
      }

      // ✅ Kurangi stok setelah semua dicek
      for (const item of cart.items) {
        const product = await Product.findByPk(item.product_id, { transaction });
        product.stock -= item.quantity;
        await product.save({ transaction });
      }

      // ✅ Hapus cart items
      await CartItem.destroy({ 
        where: { cart_id: cart.id },
        transaction 
      });

      await transaction.commit();

      return { 
        message: "Checkout success! Stock updated.",
        items: cart.items.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        }))
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // --------------------------------------------------------
  // CLEAR CART
  // --------------------------------------------------------
  async clearCart(userId) {
    const cart = await this.getOrCreateCart(userId);

    await CartItem.destroy({ 
      where: { cart_id: cart.id } 
    });

    return { message: "Cart cleared" };
  }
}

module.exports = new CartService();