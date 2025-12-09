// auth.controller.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  const { nickname, email, password } = req.body;

  try {
    // ✅ TAMBAH 3 BARIS INI (VALIDASI PASSWORD)
    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password minimal 8 karakter" });
    }
    // ✅ SAMPAI SINI

    if (!email || !password)
      return res.status(400).json({ message: "Email & password wajib diisi" });

    const exist = await User.findOne({ where: { email } });
    if (exist)
      return res.status(409).json({ message: "Email sudah terdaftar" });

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      nickname,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      code: 201,
      status: "success",
      message: "Register berhasil",
      data: user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {                     
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    const validPass = bcrypt.compareSync(password, user.password);
    if (!validPass)
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // ✅ GANTI "1h" JADI "7d"
    );

    res.json({
      code: 200,
      status: "success",
      message: "Login berhasil",
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          email: user.email,
        },
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// ME
exports.me = async (req, res) => {
  try {
    const user = req.user; // ini diambil dari middleware auth

    res.json({
      status: "success",
      message: "Data user ter-autentikasi",
      data: user,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// LOGOUT
exports.logout = async (req, res) => {
  res.json({
    status: "success",
    message: "Logout berhasil — hapus token di client",
  });
};