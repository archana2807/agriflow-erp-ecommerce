import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  gstPercent: z.number().min(0, "GST cannot be negative").max(100, "GST cannot exceed 100%"),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
});
