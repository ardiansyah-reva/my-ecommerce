// Backend/controllers/admin.controller.js
const { User, Product, Order, OrderItem } = require("../models");
const { Op } = require("sequelize");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status) where.seller_status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
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

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan"
      });
    }

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

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'seller', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Role tidak valid"
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan"
      });
    }

    await user.update({ role });

    res.json({
      code: 200,
      status: "success",
      message: "Role berhasil diupdate",
      data: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve seller status
exports.approveSellerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['approved', 'rejected', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status tidak valid"
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan"
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        status: "error",
        message: "User bukan seller"
      });
    }

    await user.update({ seller_status: status });

    res.json({
      code: 200,
      status: "success",
      message: `Status seller ${status}`,
      data: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        seller_status: user.seller_status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id == req.user.id) {
      return res.status(400).json({
        status: "error",
        message: "Tidak dapat menghapus akun sendiri"
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User tidak ditemukan"
      });
    }

    await user.destroy();

    res.json({
      code: 200,
      status: "success",
      message: "User berhasil dihapus"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
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

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status.toUpperCase();

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: "items"
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "email"]
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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELED"];
    
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        status: "error",
        message: `Status tidak valid`
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order tidak ditemukan"
      });
    }

    await order.update({ status: status.toUpperCase() });

    res.json({
      code: 200,
      status: "success",
      message: "Status order berhasil diupdate",
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
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const pendingSellers = await User.count({ 
      where: { 
        role: 'seller', 
        seller_status: 'pending' 
      } 
    });

    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const orders = await Order.findAll({
      where: { status: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "nickname", "email"]
        }
      ]
    });

    res.json({
      code: 200,
      status: "success",
      data: {
        users: {
          total: totalUsers,
          sellers: totalSellers,
          pendingSellers
        },
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};