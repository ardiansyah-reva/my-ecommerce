// Backend/controllers/flashSale.controller.js
const { FlashSale, Product, ProductMedia, Category, Brand } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../db");

// Get active flash sales
exports.getActiveFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.findAll({
      where: {
        start_at: { [Op.lte]: now },
        end_at: { [Op.gte]: now },
        status: 'active',
        stock: { [Op.gt]: 0 }
      },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ],
      order: [["end_at", "ASC"]]
    });

    res.json({
      code: 200,
      status: "success",
      data: flashSales
    });
  } catch (error) {
    console.error("GET ACTIVE FLASH SALES ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Get upcoming flash sales
exports.getUpcomingFlashSales = async (req, res) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.findAll({
      where: {
        start_at: { [Op.gt]: now },
        status: 'scheduled'
      },
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ],
      order: [["start_at", "ASC"]],
      limit: 10
    });

    res.json({
      code: 200,
      status: "success",
      data: flashSales
    });
  } catch (error) {
    console.error("GET UPCOMING FLASH SALES ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Get flash sale by ID
exports.getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ]
    });

    if (!flashSale) {
      return res.status(404).json({
        status: "error",
        message: "Flash sale not found"
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: flashSale
    });
  } catch (error) {
    console.error("GET FLASH SALE BY ID ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Create flash sale (Admin/Seller)
exports.createFlashSale = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      name,
      product_id,
      flash_price,
      discount_percentage,
      stock,
      max_per_user,
      start_at,
      end_at
    } = req.body;

    // Validate product exists
    const product = await Product.findByPk(product_id, { transaction: t });
    
    if (!product) {
      await t.rollback();
      return res.status(404).json({
        status: "error",
        message: "Product not found"
      });
    }

    // Validate dates
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);
    
    if (endDate <= startDate) {
      await t.rollback();
      return res.status(400).json({
        status: "error",
        message: "End date must be after start date"
      });
    }

    // Create flash sale
    const flashSale = await FlashSale.create({
      name,
      product_id,
      original_price: product.price,
      flash_price,
      discount_percentage,
      stock,
      max_per_user: max_per_user || 1,
      start_at: startDate,
      end_at: endDate,
      status: new Date() >= startDate ? 'active' : 'scheduled'
    }, { transaction: t });

    await t.commit();

    // Fetch full flash sale data
    const fullFlashSale = await FlashSale.findByPk(flashSale.id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ]
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Flash sale created successfully",
      data: fullFlashSale
    });
  } catch (error) {
    await t.rollback();
    console.error("CREATE FLASH SALE ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Update flash sale
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const flashSale = await FlashSale.findByPk(id);

    if (!flashSale) {
      return res.status(404).json({
        status: "error",
        message: "Flash sale not found"
      });
    }

    // Don't allow updating ended flash sales
    if (flashSale.status === 'ended') {
      return res.status(400).json({
        status: "error",
        message: "Cannot update ended flash sale"
      });
    }

    await flashSale.update(updateData);

    const updatedFlashSale = await FlashSale.findByPk(id, {
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ]
    });

    res.json({
      code: 200,
      status: "success",
      message: "Flash sale updated successfully",
      data: updatedFlashSale
    });
  } catch (error) {
    console.error("UPDATE FLASH SALE ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Delete flash sale
exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id);

    if (!flashSale) {
      return res.status(404).json({
        status: "error",
        message: "Flash sale not found"
      });
    }

    await flashSale.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "Flash sale deleted successfully"
    });
  } catch (error) {
    console.error("DELETE FLASH SALE ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

// Get all flash sales (Admin)
exports.getAllFlashSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await FlashSale.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: "product",
          include: [
            { model: ProductMedia, as: "media" },
            { model: Category, as: "category" },
            { model: Brand, as: "brand" }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]]
    });

    res.json({
      code: 200,
      status: "success",
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: rows
    });
  } catch (error) {
    console.error("GET ALL FLASH SALES ERROR:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};