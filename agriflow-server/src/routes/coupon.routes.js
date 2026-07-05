import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../validations/coupon.validation.js";

const router = express.Router();

// Public route for validating coupon
router.post("/validate", validateCoupon);

// Admin routes
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(createCouponSchema),
  createCoupon
);

router.get("/", protect, authorize("ADMIN"), tenantMiddleware, getCoupons);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(updateCouponSchema),
  updateCoupon
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  deleteCoupon
);

export default router;
