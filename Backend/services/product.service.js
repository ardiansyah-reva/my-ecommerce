const { Product, Category, Brand, ProductMedia } = require('../models');
const { Op } = require('sequelize');

class ProductService {
  /**
   * Get all products dengan filter & pagination
   */
  async getAllProducts(filters = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      category_id,
      brand_id,
      min_price,
      max_price,
      sort = "latest" // NEW
    } = filters;

    const offset = (page - 1) * limit;
    const where = {};

    // Filter search
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Filter category
    if (category_id) {
      where.category_id = category_id;
    }

    // Filter brand
    if (brand_id) {
      where.brand_id = brand_id;
    }

    // Filter price
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }

    // Sorting logic — NEW
    let order = [];
    switch (sort) {
      case "price_asc":
        order = [["price", "ASC"]];
        break;
      case "price_desc":
        order = [["price", "DESC"]];
        break;
      case "name":
        order = [["name", "ASC"]];
        break;
      default:
        order = [["created_at", "DESC"]];
    }

    // Query
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" },
      ],
      limit,
      offset,
      order,
    });

    return {
      products: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" },
      ],
    });

    if (!product) throw new Error("Product not found");

    return product;
  }

  /**
   * Get related products by same category
   */
  async getRelatedProducts(productId, limit = 6) {
    const product = await Product.findByPk(productId);

    if (!product) throw new Error("Product not found");

    return Product.findAll({
      where: {
        category_id: product.category_id,
        id: { [Op.ne]: productId },
      },
      include: [{ model: ProductMedia, as: "media" }],
      limit,
      order: sequelize.random(), // random order
    });
  }

  /**
   * Get random products — useful for homepage
   */
  async getRandomProducts(limit = 10) {
    return Product.findAll({
      include: [{ model: ProductMedia, as: "media" }],
      limit,
      order: sequelize.random(),
    });
  }

  /**
   * Helper untuk update stok (dipakai checkout)
   */
  async reduceStock(productId, qty) {
    const product = await Product.findByPk(productId);
    if (!product) throw new Error("Product not found");

    if (product.stock < qty) {
      throw new Error("Insufficient stock");
    }

    product.stock -= qty;
    await product.save();

    return product;
  }
}

module.exports = new ProductService();
