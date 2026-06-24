import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must be at most 15 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must be at most 15 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().length(6, "PIN code must be 6 digits"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(10, "Phone must be at least 10 digits").max(15, "Phone must be at most 15 digits"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().positive("Price must be positive"),
  gstPercent: z.coerce.number().min(0, "GST cannot be negative").max(100, "GST cannot exceed 100%"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
});

const orderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  price: z.coerce.number().positive("Price must be positive"),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

export const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amountPaid: z.coerce.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CASH", "CARD", "UPI", "BANK_TRANSFER"]),
});

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["ADMIN", "SALES", "ACCOUNTANT", "TECHNICIAN"]).optional(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
