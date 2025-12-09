// backend/db/index.js

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Membuat instance Sequelize dengan konfigurasi database dari file .env
const sequelize = new Sequelize(
  process.env.DB_NAME, // Nama database
  process.env.DB_USER, // Username database
  process.env.DB_PASS, // Password database
  {
    host: process.env.DB_HOST, // Host database, biasanya 'localhost'
    dialect: "postgres", // Jenis database yang digunakan
    logging: false, // ubah ke true kalau ingin melihat log query SQL di console
  }
);

// Fungsi untuk mengetes koneksi ke database (opsional tapi berguna)
async function testConnection() {
  try {
    await sequelize.authenticate(); // Mengecek apakah bisa terhubung ke DB
    console.log("✅ PostgreSQL berhasil terhubung!");
  } catch (error) {
    console.error("❌ Tidak dapat terhubung ke database:", error);
  }
}

testConnection(); // Menjalankan tes koneksi

module.exports = sequelize; // Export instance sequelize untuk digunakan di file lain
