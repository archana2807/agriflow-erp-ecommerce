import express from "express";
import crypto from "crypto";
import Order from "../models/order.model.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRazorpayOrderSchema,
  verifyPaymentSchema,
} from "../validations/razorpay.validation.js";

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_yourkey";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "your_secret";

// Create Razorpay order
router.post("/create-order", validate(createRazorpayOrderSchema), async (req, res) => {
  try {
    const { amount, items } = req.validatedBody;

    const razorpay = new (await import("razorpay")).default({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    const totalAmount = amount / 100;
    const dbOrder = await Order.create({
      tenantId: req.user?.tenantId || "default",
      customerId: req.user?.id || "guest",
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount,
      status: "PENDING",
      razorpayOrderId: order.id,
    });

    res.json({ order, dbOrderId: dbOrder._id });
  } catch (error) {
    console.error("Razorpay order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

// Verify payment
router.post("/verify", validate(verifyPaymentSchema), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping, items } =
      req.validatedBody;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "CONFIRMED",
        paymentId: razorpay_payment_id,
        paymentMethod: "RAZORPAY",
        shipping,
      }
    );

    res.json({ message: "Payment verified successfully", success: true });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

export default router;
