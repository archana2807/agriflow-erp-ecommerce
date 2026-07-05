import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
});

export const customerLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerRegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  gstPercent: z.coerce.number().min(0, "GST must be 0 or more"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  description: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional().or(z.literal("")),
  slug: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  slug: z.string().optional().or(z.literal("")),
  logo: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export const addressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().min(6, "Pincode must be 6 digits"),
  country: z.string().min(1, "Country is required").default("India"),
});

export const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  discountType: z.enum(["PERCENTAGE", "FLAT"], { required_error: "Discount type is required" }),
  discountValue: z.coerce.number().positive("Discount value must be positive"),
  minimumOrder: z.coerce.number().min(0, "Minimum order must be 0 or more").optional(),
  maximumDiscount: z.coerce.number().min(0).optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  usageLimit: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().or(z.literal("")),
  image: z.string().min(1, "Image URL is required"),
  buttonText: z.string().optional().or(z.literal("")),
  buttonLink: z.string().optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
});

export const adminProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
