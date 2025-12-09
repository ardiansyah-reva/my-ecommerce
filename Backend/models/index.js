const sequelize = require('../db');

// Import semua models
const User = require('./User');
const UserAddress = require('./UserAddress');
const Product = require('./Product');
const ProductMedia = require('./ProductMedia');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Shipment = require('./Shipment');
const Category = require('./Category');
const Brand = require('./Brand');

// =================== RELASI ===================

// ---------- USER ----------
User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses' });
UserAddress.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ---------- PRODUCT ----------
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });

Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' }); 

Product.hasMany(ProductMedia, { foreignKey: 'product_id', as: 'media' });
ProductMedia.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ---------- CART ----------
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });

// ---------- ORDER ----------
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(Shipment, { foreignKey: 'order_id', as: 'shipment' });
Shipment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Export semua models (opsional)
module.exports = {
  User,
  UserAddress,
  Product,
  ProductMedia,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Category,
  Brand,
  sequelize,
};
