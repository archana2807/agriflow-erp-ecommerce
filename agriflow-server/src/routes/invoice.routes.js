import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createInvoice } from "../controllers/invoice.controller.js";
import { createInvoiceSchema } from "../validations/invoice.validation.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN", "ACCOUNTANT"),
  tenantMiddleware,
  validate(createInvoiceSchema),
  createInvoice
);

export default router;
