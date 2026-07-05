import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";

/**
 * CREATE COUPON
 */
export const createCoupon = async (req, res, next) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      expiryDate,
      usageLimit,
    } = req.validatedBody;

    const existing = await Coupon.findOne({
      code: code.toUpperCase(),
      tenantId: req.tenantId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Coupon already exists with this code",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      expiryDate,
      usageLimit,
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET COUPONS
 */
export const getCoupons = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { tenantId: req.tenantId };

    const skip = (page - 1) * limit;

    const coupons = await Coupon.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Coupon.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE COUPON
 */
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      minimumOrder,
      maximumDiscount,
      expiryDate,
      usageLimit,
      isActive,
    } = req.validatedBody;

    const coupon = await Coupon.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.code = code ? code.toUpperCase() : coupon.code;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue ?? coupon.discountValue;
    coupon.minimumOrder = minimumOrder ?? coupon.minimumOrder;
    coupon.maximumDiscount = maximumDiscount ?? coupon.maximumDiscount;
    coupon.expiryDate = expiryDate || coupon.expiryDate;
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.isActive = isActive ?? coupon.isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE COUPON
 */
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * VALIDATE COUPON
 */
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount, tenantId } = req.body;
    const resolvedTenantId = tenantId || req.tenantId || new mongoose.Types.ObjectId("6a2da032a1988ba7bb7e9820");

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      tenantId: resolvedTenantId,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    if (orderAmount < coupon.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${coupon.minimumOrder}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maximumDiscount > 0) {
        discount = Math.min(discount, coupon.maximumDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discount,
      },
    });
  } catch (error) {
    next(error);
  }
};
