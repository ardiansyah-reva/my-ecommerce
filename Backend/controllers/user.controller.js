// controllers/user.controller.js
const User = require("../models/User");

// GET all users
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // ✅ Jangan return password
    });
    
    res.json({
      code: 200,
      status: "success",
      data: users,
    });
   
  } catch (err) { 
    console.error(err);
    res.status(500).json({ 
      code: 500,
      status: "error",
      message: err.message 
    });
  }
};

// GET user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ 
        code: 404,
        status: "error",
        message: "User not found"
      });
    }

    res.json({
      code: 200,
      status: "success",
      data: user,
    });

  } catch (err) { //  FIXED: err bukan error
    console.error(err);
    res.status(500).json({ 
      code: 500,
      status: "error",
      message: err.message 
    });
  }
};

// UPDATE user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User tidak ditemukan" 
      });
    }

    //  Don't allow password update through this endpoint
    const { password, ...updateData } = req.body;

    await user.update(updateData);

    res.json({
      code: 200,
      status: "success",
      message: "User berhasil di-update",
      data: {
        ...user.toJSON(),
        password: undefined // Remove password from response
      },
    });

  } catch (err) { 
    console.error(err);
    res.status(500).json({ 
      code: 500,
      status: "error",
      message: err.message 
    });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({
        code: 404,
        status: "error",
        message: "User tidak ditemukan" 
      });
    }

    res.json({
      code: 200,
      status: "success",
      message: `User id ${id} berhasil dihapus`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      code: 500,
      status: "error",
      message: err.message 
    });
  }
};