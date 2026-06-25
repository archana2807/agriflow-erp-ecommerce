import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  getActiveBanners,
} from "../controllers/banner.controller.js";

const router = express.Router();

// Public route
router.get("/active", getActiveBanners);

// Admin routes
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  createBanner
);

router.get("/", protect, authorize("ADMIN"), tenantMiddleware, getBanners);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
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
