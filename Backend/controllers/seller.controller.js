// Backend/controllers/seller.controller.js
const { Product, ProductMedia, Category, Brand, Order, OrderItem } = require("../models");
const User = require("../models/User");

// Get seller profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      code: 200,
      status: "success",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update seller profile
exports.updateProfile = async (req, res) => {
  try {
    const { shop_name, shop_description, phone } = req.body;
    
    const user = await User.findByPk(req.user.id);
    
    await user.update({
      shop_name,
      shop_description,
      phone
    });

    res.json({
      code: 200,
      status: "success",
      message: "Profile berhasil diupdate",
      data: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        shop_name: user.shop_name,
        shop_description: user.shop_description,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seller products
exports.getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" }
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id, brand_id, media } = req.body;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Name, price, dan stock wajib diisi"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      brand_id
    });

    if (media && Array.isArray(media) && media.length > 0) {
      for (const m of media) {
        await ProductMedia.create({
          product_id: product.id,
          media_type: m.type || "image",
          url: m.url
        });
      }
    }

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" }
      ]
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Produk berhasil dibuat",
      data: fullProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category_id, brand_id } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan"
      });
    }

    await product.update({
      name,
      description,
      price,
      stock,
      category_id,
      brand_id
    });

    const updated = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" }
      ]
    });

    res.json({
      code: 200,
      status: "success",
      message: "Produk berhasil diupdate",
      data: updated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Produk tidak ditemukan"
      });
    }

    await product.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "Produk berhasil dihapus"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seller orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "email", "phone"]
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
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "email", "phone"]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order tidak ditemukan"
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const orders = await Order.findAll({
      where: { status: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    res.json({
      code: 200,
      status: "success",
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        seller: {
          name: req.user.shop_name || req.user.nickname,
          status: req.user.seller_status
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};