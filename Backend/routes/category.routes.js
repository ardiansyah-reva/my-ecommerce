// Backend/routes/category.routes.js
const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id", categoryController.getCategoryById);

// Protected routes (jika diperlukan)
// router.post("/", auth, categoryController.createCategory);

module.exports = router;