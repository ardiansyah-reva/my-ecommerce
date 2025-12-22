// Backend/models/FlashSale.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const FlashSale = sequelize.define(
  "FlashSale",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    original_price: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    flash_price: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    discount_percentage: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    max_per_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'active', 'ended'),
      allowNull: false,
      defaultValue: 'scheduled',
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
    tableName: "flash_sales",
    timestamps: false,
  }
);

module.exports = FlashSale;