import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.string().optional(),
  description: z.string().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
