const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(150),
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    profile_image: {
      type: DataTypes.TEXT,
    },
    birthday: {
      type: DataTypes.DATE,
    },
    // ✅ TAMBAH ROLE FIELD
    role: {
      type: DataTypes.ENUM('customer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    // ✅ TAMBAH STATUS UNTUK SELLER
    seller_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      allowNull: true,
      defaultValue: null
    },
    // ✅ TAMBAH INFO SELLER
    shop_name: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    shop_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;