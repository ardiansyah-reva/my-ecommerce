const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth");

router.use(auth);

// Lihat semua order user
router.get("/", orderController.getAllOrder);

// Buat order
router.post("/", orderController.createOrder);

// Lihat detail order milik user
router.get("/:id", orderController.getOrderById);

// Update order (kalau perlu)
router.put("/:id", orderController.updateOrder);

// Hapus order (opsional)
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
