// Backend/controllers/cart.controller.js
const { Cart, CartItem, Product, ProductMedia } = require("../models");

// GET cart user yang sedang login
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

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
              include: [
                { 
                  model: ProductMedia, 
                  as: "media" 
                }
              ],
            },
          ],
        },
      ],
    });

    // Jika belum ada cart, buat cart baru
    if (!cart) {
      cart = await Cart.create({ user_id: userId });
      cart.items = [];
    }

    res.json({
      code: 200,
      status: "success",
      data: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// ADD item to cart
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    // Validasi input
    if (!product_id) {
      return res.status(400).json({
        status: "error",
        message: "product_id is required"
      });
    }

    // Cek apakah produk ada
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found"
      });
    }

    // Cek stok
    if (product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: `Stock not enough. Available: ${product.stock}`
      });
    }

    // Cari atau buat cart
    let cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      cart = await Cart.create({ user_id: userId });
    }

    // Cek apakah item sudah ada di cart
    let cartItem = await CartItem.findOne({
      where: { 
        cart_id: cart.id, 
        product_id: product_id 
      }
    });

    if (cartItem) {
      // Update quantity jika sudah ada
      const newQuantity = cartItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          status: "error",
          message: `Stock not enough. Available: ${product.stock}`
        });
      }

      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      // Tambah item baru
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: product_id,
        quantity: quantity
      });
    }

    // Ambil cart lengkap dengan items
    const updatedCart = await Cart.findOne({
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

    res.json({
      code: 200,
      status: "success",
      message: "Item added to cart",
      data: updatedCart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// UPDATE cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart_item_id
    const { quantity } = req.body;

    // Validasi quantity
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid quantity"
      });
    }

    // Cari cart item
    const cartItem = await CartItem.findOne({
      where: { id },
      include: [
        {
          model: Cart,
          as: "cart",
          where: { user_id: userId }
        },
        {
          model: Product,
          as: "product"
        }
      ]
    });

    if (!cartItem) {
      return res.status(404).json({ 
        status: "error", 
        message: "Cart item not found" 
      });
    }

    // Jika quantity 0, hapus item
    if (quantity === 0) {
      await cartItem.destroy();
      return res.json({
        code: 200,
        status: "success",
        message: "Item removed from cart",
      });
    }

    // Cek stok
    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        status: "error",
        message: `Stock not enough. Available: ${cartItem.product.stock}`
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      code: 200,
      status: "success",
      message: "Cart item updated",
      data: cartItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// DELETE cart item
exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // cart_item_id

    const deleted = await CartItem.destroy({
      where: { id },
      include: [{
        model: Cart,
        as: "cart",
        where: { user_id: userId }
      }]
    });

    if (!deleted) {
      return res.status(404).json({ 
        status: "error", 
        message: "Cart item not found" 
      });
    }

    res.json({
      code: 200,
      status: "success",
      message: "Item removed from cart",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};

// CLEAR cart (hapus semua items)
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Cart not found"
      });
    }

    await CartItem.destroy({
      where: { cart_id: cart.id }
    });

    res.json({
      code: 200,
      status: "success",
      message: "Cart cleared",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
};