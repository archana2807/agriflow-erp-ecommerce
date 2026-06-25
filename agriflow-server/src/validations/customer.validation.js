import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must be at most 15 digits"),
  email: z.string().email("Invalid email").optional(),
  isWalkIn: z.boolean().optional().default(false),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).max(15).optional(),
});
