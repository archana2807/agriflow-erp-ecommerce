import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

/**
 * GET WISHLIST
 */
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.find({
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    })
      .populate("productId", "name slug images sellingPrice price stock isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ADD TO WISHLIST
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findOne({
      _id: productId,
      tenantId: req.customer.tenantId,
      isDeleted: false,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existing = await Wishlist.findOne({
      customerId: req.customer.id,
      productId,
      tenantId: req.customer.tenantId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlistItem = await Wishlist.create({
      customerId: req.customer.id,
      productId,
      tenantId: req.customer.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlistItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * REMOVE FROM WISHLIST
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      customerId: req.customer.id,
      productId,
      tenantId: req.customer.tenantId,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    next(error);
  }
};
