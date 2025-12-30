// Backend/controllers/product.controller.js
const productService = require("../services/product.service");

/**
 * GET all products + search + filter + pagination
 */
exports.getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);

    return res.json({
      code: 200,
      status: "success",
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
      data: result.products,
    });
  } catch (err) {
    console.error("GET ALL PRODUCTS ERROR:", err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: err.message || "Server error",
    });
  }
};

/**
 * GET product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    return res.json({
      code: 200,
      status: "success",
      data: product,
    });
  } catch (err) {
    console.error("GET PRODUCT BY ID ERROR:", err);
    
    if (err.message === "Product not found") {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: err.message,
      });
    }

    res.status(500).json({
      code: 500,
      status: "error",
      message: "Server error",
    });
  }
};

/**
 * CREATE product
 */
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Product created",
      data: product
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: error.message || "Server error"
    });
  }
};

/**
 * UPDATE product
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);

    res.json({
      code: 200,
      status: "success",
      message: "Product updated",
      data: product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    
    if (error.message === "Product not found") {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};

/**
 * DELETE product
 */
exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.json({
      code: 200,
      status: "success",
      message: "Product deleted",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    
    if (error.message === "Product not found") {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({ 
      code: 500,
      status: "error", 
      message: "Server error" 
    });
  }
};