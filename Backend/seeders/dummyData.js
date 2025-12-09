const bcrypt = require('bcryptjs');
const sequelize = require('../db');
const {
  User,
  UserAddress,
  Product,
  ProductMedia,
  Order,
  OrderItem,
  Payment,
  Shipment,
  Category,
  Brand
} = require('../models');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    logger.info('Starting data seeding...');

    // ========== 1. Categories ==========
    logger.info('Seeding categories...');
    const categories = await Category.bulkCreate([
      { name: 'Laptop', slug: 'laptop' },
      { name: 'Smartphone', slug: 'smartphone' },
      { name: 'Gaming Gear', slug: 'gaming-gear' },
      { name: 'Smart Home', slug: 'smart-home' },
      { name: 'Wearable Tech', slug: 'wearable-tech' },
    ]);

    // ========== 2. Brands ==========
    logger.info('Seeding brands...');
    const brands = await Brand.bulkCreate([
      { name: 'Acer', slug: 'acer' },
      { name: 'Lenovo', slug: 'lenovo' },
      { name: 'Sony', slug: 'sony' },
      { name: 'Xiaomi', slug: 'xiaomi' },
      { name: 'Logitech', slug: 'logitech' },
    ]);

    // ========== 3. Users ==========
    logger.info('Seeding users...');
    const users = await User.bulkCreate([
      {
        nickname: 'udinJet',
        email: 'udin@example.com',
        password: await bcrypt.hash('password123', 10),
      },
      {
        nickname: 'bakwanMaster',
        email: 'bakwan@example.com',
        password: await bcrypt.hash('password456', 10),
      }
    ]);

    // ========== 4. User Addresses ==========
    logger.info('Seeding user addresses...');
    await UserAddress.bulkCreate([
      {
        user_id: users[0].id,
        address: 'Jl. Mawar No. 21, Jakarta',
        postal_code: '11440',
      },
      {
        user_id: users[1].id,
        address: 'Jl. Melati No. 7, Bandung',
        postal_code: '40415',
      }
    ]);

    // ========== 5. Products ==========
    logger.info('Seeding products...');
    const products = await Product.bulkCreate([
      {
        name: 'Acer Nitro 5 Gaming Laptop',
        slug: 'acer-nitro-5',
        brand_id: brands[0].id,
        category_id: categories[0].id,
        price: 11500000,
        stock: 12,
      },
      {
        name: 'Xiaomi Mi Band 8 Pro',
        slug: 'xiaomi-mi-band-8-pro',
        brand_id: brands[3].id,
        category_id: categories[4].id,
        price: 899000,
        stock: 30,
      },
      {
        name: 'Sony WH-CH720N Headphones',
        slug: 'sony-wh-ch720n',
        brand_id: brands[2].id,
        category_id: categories[2].id,
        price: 1799000,
        stock: 18,
      }
    ]);

    // ========== 6. Product Media ==========
    logger.info('Seeding product media...');
    await ProductMedia.bulkCreate([
      { product_id: products[0].id, url: '/images/acer-nitro.jpg' },
      { product_id: products[1].id, url: '/images/mi-band-8.jpg' },
      { product_id: products[2].id, url: '/images/sony-720.jpeg' },
    ]);

    // ========== 7. Orders ==========
    logger.info('Seeding orders...');
    const orders = await Order.bulkCreate([
      {
        user_id: users[0].id,
        total_price: 11500000,
        status: 'paid',
      },
      {
        user_id: users[1].id,
        total_price: 1799000,
        status: 'pending',
      }
    ]);

    // ========== 8. Order Items ==========
    logger.info('Seeding order items...');
    await OrderItem.bulkCreate([
      {
        order_id: orders[0].id,
        product_id: products[0].id,
        quantity: 1,
        price: 11500000,
      },
      {
        order_id: orders[1].id,
        product_id: products[2].id,
        quantity: 1,
        price: 1799000,
      }
    ]);

    // ========== 9. Payments ==========
    logger.info('Seeding payments...');
    await Payment.bulkCreate([
      {
        order_id: orders[0].id,
        method: 'bank_transfer',
        status: 'success',
      },
      {
        order_id: orders[1].id,
        method: 'ewallet',
        status: 'pending',
      }
    ]);

    // ========== 10. Shipments ==========
    logger.info('Seeding shipments...');
    await Shipment.bulkCreate([
      {
        order_id: orders[0].id,
        tracking_number: 'ACER1234567',
        status: 'delivered',
      },
      {
        order_id: orders[1].id,
        tracking_number: 'SONY998877',
        status: 'on-delivery',
      }
    ]);

    logger.info('Seeding completed!');
    await sequelize.close();
  } catch (error) {
    logger.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
