import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../validations/brand.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(createBrandSchema),
  createBrand
);

router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getBrands);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(updateBrandSchema),
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
