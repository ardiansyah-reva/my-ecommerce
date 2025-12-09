// product.controller.js
const { Product, Category, Brand, ProductMedia } = require("../models");
const { Op } = require("sequelize"); // ✅ ADDED - PENTING!

/**
 * GET all products + search + filter + pagination
 */
exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      category_id,
      brand_id,
      min_price,
      max_price,
      sort = "latest"
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Filter category
    if (category_id) where.category_id = category_id;

    // Filter brand
    if (brand_id) where.brand_id = brand_id;

    // Price range
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }

    // Sorting
    const sortOption = {
      latest: ["created_at", "DESC"],
      oldest: ["created_at", "ASC"],
      expensive: ["price", "DESC"],
      cheap: ["price", "ASC"],
    };

    const order = [sortOption[sort] || sortOption.latest];

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" },
      ],
    });

    return res.json({
      code: 200,
      status: "success",
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Server error",
    });
  }
};

/**
 * GET product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" },
      ]
    });

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Product not found",
      });
    }

    return res.json({
      code: 200,
      status: "success",
      data: product,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Server error",
    });
  }
};

// CREATE product
exports.createProduct = async (req, res) => {
  try {
    const { media, ...productData } = req.body;

    // 1. Buat product
    const product = await Product.create(productData);

    // 2. Simpan media kalau ada
    if (media && Array.isArray(media) && media.length > 0) {
      for (const m of media) {
        await ProductMedia.create({
          product_id: product.id,
          media_type: m.type || "image",
          url: m.url
        });
      }
    }

    // 3. Ambil ulang product + media
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: ProductMedia, as: "media" }]
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Product created",
      data: fullProduct
    });

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      code: 500,
      status: "error",
      message: "Server error"
    });
  }
};



// UPDATE product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Product not found",
      });
    }

    await product.update(req.body);

    res.json({
      code: 200,
      status: "success",
      message: "Product updated",
      data: product,
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

// DELETE product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "Product not found",
      });
    }

    await product.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "Product deleted",
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
