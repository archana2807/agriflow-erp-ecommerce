import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discountType: z.enum(["PERCENTAGE", "FLAT"], { required_error: "Discount type is required" }),
  discountValue: z.number().positive("Discount value must be positive"),
  minimumOrder: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  usageLimit: z.number().int().min(0).optional(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(1).optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]).optional(),
  discountValue: z.number().positive().optional(),
  minimumOrder: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  expiryDate: z.string().optional(),
  usageLimit: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
