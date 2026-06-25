import Product from "../models/product.model.js";

export class ProductService {
  static async createProduct(tenantId, data) {
    const existingProduct = await Product.findOne({
      sku: data.sku,
      tenantId,
      isDeleted: false,
    });

    if (existingProduct) {
      throw new Error("Product already exists with this SKU");
    }

    return Product.create({ ...data, tenantId });
  }

  static async getProducts(tenantId, { page = 1, limit = 10, search = "" }) {
    const query = {
      tenantId,
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .populate("brandId", "name logo")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments(query),
    ]);

    return { products, total, page, limit };
  }

  static async getProductById(tenantId, productId) {
    const query = { _id: productId, isDeleted: false };
    if (tenantId) query.tenantId = tenantId;

    const product = await Product.findOne(query)
      .populate("categoryId", "name slug")
      .populate("brandId", "name logo");

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }

  static async updateProduct(tenantId, productId, updates) {
    const product = await Product.findOne({
      _id: productId,
      tenantId,
      isDeleted: false,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (updates.sku && updates.sku !== product.sku) {
      const existing = await Product.findOne({
        sku: updates.sku,
        tenantId,
        isDeleted: false,
        _id: { $ne: productId },
      });
      if (existing) {
        throw new Error("SKU already in use");
      }
    }

    Object.assign(product, updates);
    await product.save();

    return product;
  }

  static async deleteProduct(tenantId, productId) {
    const product = await Product.findOne({
      _id: productId,
      tenantId,
      isDeleted: false,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    product.isDeleted = true;
    await product.save();

    return product;
  }

  static async getPublicProducts({
    page = 1,
    limit = 12,
    search = "",
    sort = "newest",
    category,
    brand,
    minPrice,
    maxPrice,
    inStock,
  }) {
    const query = { isDeleted: false, isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.categoryId = category;
    if (brand) query.brandId = brand;

    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortObj = { createdAt: -1 };
    if (sort === "price-low") sortObj = { sellingPrice: 1 };
    else if (sort === "price-high") sortObj = { sellingPrice: -1 };
    else if (sort === "name") sortObj = { name: 1 };
    else if (sort === "popular") sortObj = { bestSeller: -1, createdAt: -1 };

    const [products, total, priceRange] = await Promise.all([
      Product.find(query)
        .populate("categoryId", "name slug")
        .populate("brandId", "name logo")
        .skip(skip)
        .limit(Number(limit))
        .sort(sortObj),
      Product.countDocuments(query),
      Product.aggregate([
        { $match: { isDeleted: false, isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$sellingPrice" },
            maxPrice: { $max: "$sellingPrice" },
          },
        },
      ]),
    ]);

    return {
      products,
      total,
      page: Number(page),
      limit: Number(limit),
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    };
  }

  static async getProductBySlug(slug) {
    const product = await Product.findOne({
      slug,
      isDeleted: false,
      isActive: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name logo");

    if (!product) {
      throw new Error("Product not found");
    }

    return product;
  }
}
