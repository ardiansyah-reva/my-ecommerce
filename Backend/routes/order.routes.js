// Backend/routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth");

// Semua route order harus ter-autentikasi
router.use(auth);

// GET - Lihat semua order user
router.get("/", orderController.getAllOrder);

// POST - Buat order baru (checkout)
router.post("/", orderController.createOrder);

// GET - Lihat detail order milik user
router.get("/:id", orderController.getOrderById);

// PUT - Update order (status, dll)
router.put("/:id", orderController.updateOrder);

// DELETE - Cancel order
router.delete("/:id", orderController.deleteOrder);

module.exports = router;