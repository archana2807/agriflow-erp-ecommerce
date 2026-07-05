import mongoose from "mongoose";
import { CheckoutService } from "../services/checkout.service.js";
import Order from "../models/order.model.js";
import Invoice from "../models/invoice.model.js";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/**
 * CHECKOUT - Create order from cart
 */
export const checkout = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;

    const result = await CheckoutService.processCheckout({
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
      addressId,
      paymentMethod,
    });

    const response = {
      success: true,
      message: "Order placed successfully",
      order: {
        id: result.order._id,
        orderNo: result.order.orderNo,
        totalAmount: result.order.totalAmount,
        status: result.order.status,
      },
      invoice: {
        id: result.invoice._id,
        invoiceNo: result.invoice.invoiceNo,
        totalAmount: result.invoice.totalAmount,
      },
    };

    if (paymentMethod === "RAZORPAY") {
      try {
        const razorpay = new (await import("razorpay")).default({
          key_id: RAZORPAY_KEY_ID,
          key_secret: RAZORPAY_KEY_SECRET,
        });

        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(result.order.totalAmount * 100),
          currency: "INR",
          receipt: `rcpt_${result.order.orderNo}`,
        });

        result.order.razorpayOrderId = razorpayOrder.id;
        await result.order.save();

        response.razorpayOrderId = razorpayOrder.id;
        response.amount = result.order.totalAmount;
        response.customerName = req.customer.name;
        response.email = req.customer.email;
        response.phone = req.customer.phone;
      } catch (razorpayError) {
        await Order.deleteOne({ _id: result.order._id });
        await Invoice.deleteOne({ _id: result.invoice._id });
        return res.status(500).json({
          success: false,
          message: "Failed to initialize payment. Order not placed.",
        });
      }
    }

    res.status(201).json(response);
  } catch (error) {
    if (error.message === "Cart is empty") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
