import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validations/order.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN", "SALES"),
  tenantMiddleware,
  validate(createOrderSchema),
  createOrder
);

router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getOrders);

router.get("/:id", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getOrderById);

router.put(
  "/:id/status",
  protect,
  authorize("ADMIN", "SALES"),
  tenantMiddleware,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

router.delete("/:id", protect, authorize("ADMIN"), tenantMiddleware, deleteOrder);

export default router;
