import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProduct,
  getProducts,
  getPublicProducts,
  getPublicProductById,
} from "../controllers/product.controller.js";
import { createProductSchema } from "../validations/product.validation.js";

const router = express.Router();

// PUBLIC ROUTES - No auth required (storefront)
router.get("/", getPublicProducts);
router.get("/public", getPublicProducts);
router.get("/public/:id", getPublicProductById);

// PROTECTED ROUTES - Admin/ERP
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(createProductSchema),
  createProduct
);

export default router;
