const Cart = require("../models/Cart");

// GET semua carts
exports.getAllCart = async (req, res) => {
  try {
    const carts = await Cart.findAll();
    res.json({
      code: 200,
      status: "success",
      data: carts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET carts by ID
exports.getCartById = async (req, res) => {
  try {
    const cart = await Cart.findByPk(req.params.id);
    if (!cart)
      return res.status(404).json({ status: "error", message: "Cart not found" });

    res.json({ 
       code: 200,
       status: "success",
       data: cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE cart
exports.createCart = async (req, res) => {
  try {
    const cart = await Cart.create(req.body);
    res.status(201).json({
      code: 201,
      status: "success",
      message: "Cart created",
      data: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// UPDATE cart
exports.updateCart = async (req, res) => {
  try {
    const cart = await Cart.findByPk(req.params.id);
    if (!cart) return res.status(404).json({ error: "Cart tidak ditemukan" });

    await cart.update(req.body);

    res.json({
      code: 200,
      status: "success",
      message: "Cart berhasil di-update",
      data: cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE cart
exports.deleteCart = async (req, res) => {
  try {
    const deleted = await Cart.destroy({ where: { id: req.params.id } });

    if (!deleted) return res.status(404).json({ error: "Cart tidak ditemukan" });

    res.json({
      code: 200,
      status: "success",
      message: `Cart id ${req.params.id} berhasil dihapus`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

