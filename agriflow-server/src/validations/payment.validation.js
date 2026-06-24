import { z } from "zod";

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amountPaid: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER"]).optional(),
});
