import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  getActiveBanners,
} from "../controllers/banner.controller.js";
import {
  createBannerSchema,
  updateBannerSchema,
} from "../validations/banner.validation.js";

const router = express.Router();

// Public route
router.get("/active", getActiveBanners);

// Admin routes
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(createBannerSchema),
  createBanner
);

router.get("/", protect, authorize("ADMIN"), tenantMiddleware, getBanners);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(updateBannerSchema),
  updateBanner
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  deleteBanner
);

export default router;
