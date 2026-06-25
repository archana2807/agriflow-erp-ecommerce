import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().positive("Price must be positive"),
  gstPercent: z.number().min(0, "GST cannot be negative").max(100, "GST cannot exceed 100%"),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  unit: z.string().optional(),
  weight: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newArrival: z.boolean().optional(),
});
