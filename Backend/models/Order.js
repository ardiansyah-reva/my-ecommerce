// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "PAID",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "CANCELED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    total_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    shipping_cost: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: "orders",
    timestamps: false,
  }
);

module.exports = Order;
