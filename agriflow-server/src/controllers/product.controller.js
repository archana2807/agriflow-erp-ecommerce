import Product from "../models/product.model.js";

/**
 * CREATE PRODUCT (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, sku, price, gstPercent, stock } = req.validatedBody;

    const existingProduct = await Product.findOne({
      sku,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product already exists with this SKU",
      });
    }

    const product = await Product.create({
      name,
      sku,
      price,
      gstPercent,
      stock,
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PRODUCTS (Protected - Admin panel)
 */
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      tenantId: req.tenantId,
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PUBLIC PRODUCTS (No auth required - storefront)
 */
export const getPublicProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";
    const sort = req.query.sort || "name";
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    const inStock = req.query.inStock === "true";

    const query = { isDeleted: false };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (minPrice > 0 || maxPrice < Infinity) {
      query.price = {};
      if (minPrice > 0) query.price.$gte = minPrice;
      if (maxPrice < Infinity) query.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort === "price-low") sortObj = { price: 1 };
    else if (sort === "price-high") sortObj = { price: -1 };
    else if (sort === "name") sortObj = { name: 1 };
    else if (sort === "popular") sortObj = { createdAt: -1 };

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortObj)
      .select("name sku price gstPercent stock createdAt");

    const total = await Product.countDocuments(query);

    const priceRange = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      products,
      priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE PUBLIC PRODUCT
 */
export const getPublicProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).select("name sku price gstPercent stock createdAt");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};
