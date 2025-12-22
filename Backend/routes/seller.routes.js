// Backend/routes/seller.routes.js
const express = require("express");
const router = express.Router();
const sellerController = require("../controllers/seller.controller");
const auth = require("../middlewares/auth");
const { sellerApproved } = require("../middlewares/roleCheck");

// ✅ Semua route seller harus authenticated dan approved
router.use(auth);
router.use(sellerApproved);

// Profile
router.get("/profile", sellerController.getProfile);
router.put("/profile", sellerController.updateProfile);

// Products
router.get("/products", sellerController.getMyProducts);
router.post("/products", sellerController.createProduct);
router.put("/products/:id", sellerController.updateProduct);
router.delete("/products/:id", sellerController.deleteProduct);

// Orders
router.get("/orders", sellerController.getMyOrders);
router.get("/orders/:id", sellerController.getOrderById);

// Dashboard
router.get("/dashboard/stats", sellerController.getDashboardStats);

module.exports = router;