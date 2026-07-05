import { z } from "zod";

export const createBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  displayOrder: z.number().int().optional(),
});

export const updateBannerSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1).optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});
