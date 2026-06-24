import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

/**
 * DASHBOARD (ADMIN / SALES / ACCOUNTANT)
 */
router.get(
  "/",
  protect,
  authorize("ADMIN", "SALES", "ACCOUNTANT"),
  tenantMiddleware,
  getDashboardStats
);

export default router;