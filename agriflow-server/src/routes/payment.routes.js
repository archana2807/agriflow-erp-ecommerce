import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPayment, getPayments, getPaymentsByInvoice } from "../controllers/payment.controller.js";
import { createPaymentSchema } from "../validations/payment.validation.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT", "SALES"),
  tenantMiddleware,
  getPayments
);

router.get(
  "/invoice/:invoiceId",
  protect,
  authorize("ADMIN", "ACCOUNTANT", "SALES"),
  tenantMiddleware,
  getPaymentsByInvoice
);

router.post(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  tenantMiddleware,
  validate(createPaymentSchema),
  createPayment
);

export default router;
