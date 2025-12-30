const {
  Product,
  Category,
  Brand,
  ProductMedia,
  sequelize
} = require('../models');

const { Op } = require('sequelize');

class ProductService {

  /**
   * Get all products with filter, sorting & pagination
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
      sort = "latest",
    } = filters;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    // Search
    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Category filter
    if (category_id) {
      where.category_id = category_id;
    }

    // Brand filter
    if (brand_id) {
      where.brand_id = brand_id;
    }

    // Price filter
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }

    // Sorting
    let order;
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

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category" },
        { model: Brand, as: "brand" },
        { model: ProductMedia, as: "media" },
      ],
      limit: limitNum,
      offset,
      order,
    });

    return {
      products: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
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

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  /**
   * Get related products by category
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
      order: sequelize.random(),
    });
  }

  /**
   * Get random products (homepage)
   */
  async getRandomProducts(limit = 10) {
    return Product.findAll({
      include: [{ model: ProductMedia, as: "media" }],
      limit,
      order: sequelize.random(),
    });
  }

  /**
   * Reduce stock (checkout helper)
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

  /**
   * CREATE product
   */
  async createProduct(data) {
    const { media, ...productData } = data;

    return sequelize.transaction(async (t) => {
      const product = await Product.create(productData, { transaction: t });

      if (media && Array.isArray(media)) {
        for (const m of media) {
          if (!m.url) throw new Error("Media url is required");

          await ProductMedia.create(
            {
              product_id: product.id,
              media_type: m.type || "image",
              url: m.url.startsWith("/") ? m.url : `/${m.url}`,
            },
            { transaction: t }
          );
        }
      }

      return Product.findByPk(product.id, {
        include: [
          { model: ProductMedia, as: "media" },
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
        transaction: t,
      });
    });
  }

  /**
   * UPDATE product
   */
  async updateProduct(id, data) {
    const { media, ...productData } = data;

    return sequelize.transaction(async (t) => {
      const product = await Product.findByPk(id, { transaction: t });
      if (!product) throw new Error("Product not found");

      await product.update(productData, { transaction: t });

      if (media && Array.isArray(media)) {
        await ProductMedia.destroy({
          where: { product_id: id },
          transaction: t,
        });

        for (const m of media) {
          if (!m.url) throw new Error("Media url is required");

          await ProductMedia.create(
            {
              product_id: id,
              media_type: m.type || "image",
              url: m.url.startsWith("/") ? m.url : `/${m.url}`,
            },
            { transaction: t }
          );
        }
      }

      return Product.findByPk(id, {
        include: [
          { model: ProductMedia, as: "media" },
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
        transaction: t,
      });
    });
  }

  /**
   * DELETE product
   */
  async deleteProduct(id) {
    return sequelize.transaction(async (t) => {
      const product = await Product.findByPk(id, { transaction: t });
      if (!product) throw new Error("Product not found");

      await ProductMedia.destroy({
        where: { product_id: id },
        transaction: t,
      });

      await product.destroy({ transaction: t });
      return true;
    });
  }
}

module.exports = new ProductService();
