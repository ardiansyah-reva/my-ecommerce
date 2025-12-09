// models/Payment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Payment = sequelize.define(
  "Payment",
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

    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    paid_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "payments", 
    timestamps: false,   
  }
);

module.exports = Payment;
