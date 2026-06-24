import { z } from "zod";

const razorpayItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const shippingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(6, "PIN code must be 6 digits").max(6, "PIN code must be 6 digits"),
});

export const createRazorpayOrderSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer (in paise)"),
  items: z.array(razorpayItemSchema).min(1, "At least one item is required"),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
  shipping: shippingSchema,
  items: z.array(razorpayItemSchema).min(1, "At least one item is required"),
});
