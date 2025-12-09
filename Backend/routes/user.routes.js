const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middlewares/auth");

router.use(auth);

// User lihat profile sendiri
router.get("/", userController.getAllUser);

// GET user by ID (opsional)
router.get("/:id", userController.getUserById);

// Update user (hanya diri sendiri)
router.put("/:id", userController.updateUser);

// Hapus user (hanya diri sendiri)
router.delete("/:id", userController.deleteUser);

module.exports = router;
