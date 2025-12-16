// Backend/routes/cart.routes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const auth = require("../middlewares/auth");

// Semua route cart harus ter-autentikasi
router.use(auth);

// GET cart user yang sedang login
router.get("/", cartController.getCart);

// POST - Tambah item ke cart
router.post("/items", cartController.addItemToCart);

// PUT - Update quantity item di cart
router.put("/items/:id", cartController.updateCartItem);

// DELETE - Hapus item dari cart
router.delete("/items/:id", cartController.deleteCartItem);

// DELETE - Kosongkan seluruh cart
router.delete("/clear", cartController.clearCart);

module.exports = router;