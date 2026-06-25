import { ProductService } from "../services/product.service.js";
import { ReviewService } from "../services/review.service.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Brand from "../models/brand.model.js";

/**
 * GET SHOP PRODUCTS (Public API with filters, pagination, sorting)
 */
export const getShopProducts = async (req, res, next) => {
  try {
    const result = await ProductService.getPublicProducts(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE SHOP PRODUCT BY SLUG
 */
export const getShopProductBySlug = async (req, res, next) => {
  try {
    const product = await ProductService.getProductBySlug(req.params.slug);

    const reviewData = await ReviewService.getReviewsByProduct(product._id, {
      approvedOnly: true,
    });

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        reviews: reviewData.reviews,
        avgRating: reviewData.avgRating,
        reviewCount: reviewData.reviewCount,
      },
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET SHOP CATEGORIES
 */
export const getShopCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SHOP BRANDS
 */
export const getShopBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      brands,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * SEARCH PRODUCTS
 */
export const searchProducts = async (req, res, next) => {
  try {
    const result = await ProductService.getPublicProducts({
      ...req.query,
      search: req.query.q || "",
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET FEATURED PRODUCTS
 */
export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isDeleted: false,
      isActive: true,
      featured: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name logo")
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET NEW ARRIVALS
 */
export const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({
      isDeleted: false,
      isActive: true,
      newArrival: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name logo")
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BEST SELLERS
 */
export const getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({
      isDeleted: false,
      isActive: true,
      bestSeller: true,
    })
      .populate("categoryId", "name slug")
      .populate("brandId", "name logo")
      .limit(10)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};
