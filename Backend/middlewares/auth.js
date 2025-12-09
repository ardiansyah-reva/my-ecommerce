
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Unauthorized: Token tidak ada" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "nickname", "email"],
    });

    if (!user)
      return res.status(404).json({ message: "User tidak ditemukan" });

    req.user = user;
    next();

  } catch (error) {
    // ✅ GANTI BAGIAN INI (dari 1 baris jadi 5 baris)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token sudah kadaluarsa, silakan login lagi" });
    }
    return res.status(401).json({ message: "Token tidak valid" });
    // ✅ SAMPAI SINI
  }
};