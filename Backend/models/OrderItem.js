const { DataTypes } = require('sequelize');
const sequelize = require("../db");
const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  product_name_snapshot: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price_snapshot: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false // sesuaikan kalau tabelmu ada createdAt/updatedAt
});

module.exports = OrderItem;
