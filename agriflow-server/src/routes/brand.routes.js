import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  createBrand
);

router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getBrands);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  updateBrand
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  deleteBrand
);

export default router;
