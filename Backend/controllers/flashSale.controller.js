// Backend/controllers/flashSale.controller.js

// Temporary empty controller
exports.getActiveFlashSales = async (req, res) => {
  res.json({
    code: 200,
    status: "success",
    data: [],
    message: "Flash sale feature coming soon"
  });
};

exports.getUpcomingFlashSales = async (req, res) => {
  res.json({
    code: 200,
    status: "success",
    data: [],
    message: "Flash sale feature coming soon"
  });
};

exports.getFlashSaleById = async (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Flash sale not found"
  });
};

exports.createFlashSale = async (req, res) => {
  res.status(501).json({
    status: "error",
    message: "Flash sale feature coming soon"
  });
};

exports.updateFlashSale = async (req, res) => {
  res.status(501).json({
    status: "error",
    message: "Flash sale feature coming soon"
  });
};

exports.deleteFlashSale = async (req, res) => {
  res.status(501).json({
    status: "error",
    message: "Flash sale feature coming soon"
  });
};