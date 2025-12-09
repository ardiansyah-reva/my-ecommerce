
// shipment.controller.js
const Shipment = require("../models/Shipment");

// get all shipment
exports.getAllShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findAll();
    res.json({
      code: 200,
      status: "success",
      data: shipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// get shipment byid
exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "shipment not found",
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: shipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

// create shipment
exports.createShipment = async (req, res) => {
  try {
    const shipment = await Shipment.create(req.body);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "shipment created",
      data: shipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// update shipment id
exports.updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "shipment not found",
      });
    }

    await shipment.update(req.body);

    res.json({
      code: 200,
      status: "success",
      message: "shipment updated",
      data: shipment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


// delete shipment
exports.deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "shipment not found",
      });
    }

    await shipment.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "shipment deleted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};
