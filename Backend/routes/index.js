// backend/routes/index.js

const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

// Import route lain
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const orderRoutes = require("./order.routes");
const cartRoutes = require("./cart.routes");
const paymentRoutes = require("./payment.routes");
const shipmentRoutes = require("./shipment.routes");

// Route utama
router.get("/", (req, res) => {
  res.json({ message: "API Route Connected" });
});


router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);
router.post("/auth/logout", authController.logout);

// Sub-routes lain
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/cart", cartRoutes);
router.use("/payment", paymentRoutes);
router.use("/shipment", shipmentRoutes);

module.exports = router;
