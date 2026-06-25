import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  createCategory
);

router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getCategories);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  tenantMiddleware,
  deleteCategory
);

export default router;
