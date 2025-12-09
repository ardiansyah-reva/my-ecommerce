
// payment.controller.js
const Payment = require("../models/Payment");

// get all payment
exports.getAllPayment = async (req, res) => {
  try {
    const payment = await Payment.findAll();
    res.json({
      code: 200,
      status: "success",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// get payment byid
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "payment not found",
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// create payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "payment created",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// update payment id
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "payment not found",
      });
    }

    await payment.update(req.body);

    res.json({
      code: 200,
      status: "success",
      message: "payment updated",
      data: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) {
      return res.status(404).json({
        status: "error",
        message: "payment not found",
      });
    }

    await payment.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "payment deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
