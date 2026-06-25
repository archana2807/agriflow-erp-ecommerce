import express from "express";
import {
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
} from "../controllers/customerOrder.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";

const router = express.Router();

router.get("/", protectCustomer, getMyOrders);
router.get("/:id", protectCustomer, getMyOrderById);
router.put("/:id/cancel", protectCustomer, cancelMyOrder);

export default router;
