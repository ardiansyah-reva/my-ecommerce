const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/auth");

router.use(auth);

// Ambil cart user aktif
router.get("/", cartController.getAllCart);

// Tambah item
router.post("/items", cartController.createCart);

// Update item
router.put("/items/:id", cartController.updateCart);

// Hapus item
router.delete("/items/:id", cartController.deleteCart);

// Kosongkan cart
// router.delete("/clear", cartController.clearCart);

module.exports = router;
