import { z } from "zod";

export const createInvoiceSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});
