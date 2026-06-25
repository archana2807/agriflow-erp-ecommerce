import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getPublicProductById,
} from "../controllers/product.controller.js";
import { createProductSchema } from "../validations/product.validation.js";

const router = express.Router();

// PUBLIC ROUTES - No auth required (storefront)
router.get("/public", getPublicProducts);
router.get("/public/:id", getPublicProductById);

// PROTECTED ROUTES - Admin/ERP
router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getProducts);
router.get("/:id", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getProductById);
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  validate(createProductSchema),
  createProduct
);
router.put("/:id", protect, authorize("ADMIN"), tenantMiddleware, updateProduct);
router.delete("/:id", protect, authorize("ADMIN"), tenantMiddleware, deleteProduct);

export default router;
