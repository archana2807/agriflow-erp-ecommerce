import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { tenantRateLimiterMiddleware } from "../middlewares/tenantRateLimiter.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
} from "../controllers/customer.controller.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../validations/customer.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN", "SALES"),
  tenantMiddleware,
  tenantRateLimiterMiddleware,
  validate(createCustomerSchema),
  createCustomer
);

router.get("/", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getCustomers);

router.put(
  "/:id",
  protect,
  authorize("ADMIN", "SALES"),
  tenantMiddleware,
  validate(updateCustomerSchema),
  updateCustomer
);

router.delete("/:id", protect, authorize("ADMIN", "SALES"), tenantMiddleware, deleteCustomer);
router.get("/:id", protect, authorize("ADMIN", "SALES"), tenantMiddleware, getCustomerById);

export default router;
