const Order = require("../models/Order");

// GET semua order
exports.getAllOrder = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json({
      code: 200,
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET orders by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order)
      return res.status(404).json({ status: "error", message: "order not found" });

    res.json({
       code: 200,
       status: "success",
       data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// CREATE orders
exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({
      code: 201,
      status: "success",
      message: "order created",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// UPDATE orders
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "order tidak ditemukan" });

    await order.update(req.body);

    res.json({
      code: 200,
      status: "success",
      message: "order berhasil di-update",
      data: order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE orders
exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.id } });

    if (!deleted) return res.status(404).json({ error: "order tidak ditemukan" });

    res.json({
      code: 200,
      status: "success",
      message: `order id ${req.params.id} berhasil dihapus`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
