// Backend/controllers/category.controller.js
const Category = require("../models/Category");
const { Product } = require("../models");

// GET all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['id', 'ASC']]
    });
    
    res.json({
      code: 200,
      status: "success",
      data: categories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};

// GET category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Category not found",
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};

// GET category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug }
    });

    if (!category) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Category not found",
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};

// CREATE category (optional - untuk admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;
    
    const category = await Category.create({ name, slug });
    
    res.status(201).json({
      code: 201,
      status: "success",
      message: "Category created",
      data: category,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};