import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createInvoice, getInvoices, getInvoiceByOrder } from "../controllers/invoice.controller.js";
import { createInvoiceSchema } from "../validations/invoice.validation.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT", "SALES"),
  tenantMiddleware,
  getInvoices
);

router.get(
  "/order/:orderId",
  protect,
  authorize("ADMIN", "ACCOUNTANT", "SALES"),
  tenantMiddleware,
  getInvoiceByOrder
);

router.post(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  tenantMiddleware,
  validate(createInvoiceSchema),
  createInvoice
);

export default router;
