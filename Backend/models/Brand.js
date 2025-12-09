const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Brand = sequelize.define("Brand", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
}, {
  tableName: "brands",
  timestamps: false,
});

module.exports = Brand;
