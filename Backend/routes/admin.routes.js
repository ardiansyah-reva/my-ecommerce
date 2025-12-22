// Backend/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/roleCheck");

// All admin routes require authentication and admin role
router.use(auth);
router.use(adminOnly);

// Dashboard
router.get("/dashboard/stats", adminController.getDashboardStats);

// Users Management
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/seller-status", adminController.approveSellerStatus);
router.delete("/users/:id", adminController.deleteUser);

// Products Management
router.get("/products", adminController.getAllProducts);
router.delete("/products/:id", adminController.deleteProduct);

// Orders Management
router.get("/orders", adminController.getAllOrders);
router.put("/orders/:id/status", adminController.updateOrderStatus);

module.exports = router;