import express from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import { CheckoutService } from "../services/checkout.service.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  verifyPaymentSchema,
} from "../validations/razorpay.validation.js";

const router = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Verify payment
router.post("/verify", protectCustomer, validate(verifyPaymentSchema), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.validatedBody;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "CONFIRMED";
    order.paymentId = razorpay_payment_id;
    order.paymentMethod = "RAZORPAY";
    order.paymentStatus = "PAID";
    await order.save();

    await Invoice.findOneAndUpdate(
      { orderId: order._id },
      { status: "PAID" }
    );

    await Payment.findOneAndUpdate(
      { invoiceId: (await Invoice.findOne({ orderId: order._id }))._id },
      { amountPaid: order.totalAmount, remainingAmount: 0, status: "FULL" }
    );

    await CheckoutService.clearCartAfterPayment(req.customer.id, req.customer.tenantId);

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

export default router;
