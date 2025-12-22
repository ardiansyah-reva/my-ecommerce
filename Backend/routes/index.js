// Backend/routes/index.js - UPDATED
const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

// Import route modules
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const cartRoutes = require("./cart.routes");
const paymentRoutes = require("./payment.routes");
const shipmentRoutes = require("./shipment.routes");
const categoryRoutes = require("./category.routes");
const sellerRoutes = require("./seller.routes");
const adminRoutes = require("./admin.routes");
const flashSaleRoutes = require("./flashSale.routes");

// Root route
router.get("/", (req, res) => {
  res.json({ 
    message: "API Route Connected",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      cart: "/api/cart",
      orders: "/api/orders",
      seller: "/api/seller",
      admin: "/api/admin",
      flashSales: "/api/flash-sales"
    }
  });
});

// Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/logout", authController.logout);

// Public routes
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/flash-sales", flashSaleRoutes);

// Protected routes (require auth)
router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);
router.use("/payment", paymentRoutes);
router.use("/shipment", shipmentRoutes);
router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);

module.exports = router;