import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().positive("Price must be positive"),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  orderType: z.enum(["WALKIN", "ONLINE"]).optional().default("ONLINE"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER", "NONE"]).optional().default("NONE"),
  paymentAmount: z.number().min(0).optional().default(0),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});
