// models/Shipment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Shipment = sequelize.define(
  "Shipment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    courier: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "waiting_pickup",
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "shipments",
    timestamps: false, // karena tabel tidak punya created_at, updated_at
  }
);

module.exports = Shipment;
