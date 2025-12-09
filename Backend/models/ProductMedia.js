const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ProductMedia = sequelize.define("ProductMedia", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  media_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: "product_media",
  timestamps: false,
});

module.exports = ProductMedia;
