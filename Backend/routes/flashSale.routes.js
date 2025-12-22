// Backend/routes/flashSale.routes.js
const express = require("express");
const router = express.Router();
const flashSaleController = require("../controllers/flashSale.controller");
const auth = require("../middlewares/auth");
const { adminOnly, sellerApproved } = require("../middlewares/roleCheck");

// Public routes
router.get("/active", flashSaleController.getActiveFlashSales);
router.get("/upcoming", flashSaleController.getUpcomingFlashSales);
router.get("/:id", flashSaleController.getFlashSaleById);

// Protected routes (Admin/Seller)
router.use(auth);

// Admin only routes
router.get("/", adminOnly, flashSaleController.getAllFlashSales);
router.post("/", adminOnly, flashSaleController.createFlashSale);
router.put("/:id", adminOnly, flashSaleController.updateFlashSale);
router.delete("/:id", adminOnly, flashSaleController.deleteFlashSale);

module.exports = router;