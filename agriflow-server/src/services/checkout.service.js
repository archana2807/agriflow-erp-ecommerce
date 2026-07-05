import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";
import { OrderService } from "./order.service.js";

export class CheckoutService {
  static async processCheckout({ customerId, tenantId, addressId, paymentMethod = "CASH" }) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await Cart.findOne({
        customerId,
        tenantId,
      }).session(session);

      if (!cart || cart.items.length === 0) {
        await session.abortTransaction();
        session.endSession();
        throw new Error("Cart is empty");
      }

      const items = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { order, totalAmount, orderItems } = await OrderService.createOrder({
        tenantId,
        customerId,
        items,
        createdBy: null,
        session,
      });

      order.paymentMethod = paymentMethod === "COD" ? "CASH" : paymentMethod === "RAZORPAY" ? "RAZORPAY" : "CARD";
      if (paymentMethod === "COD") {
        order.status = "CONFIRMED";
      }

      if (addressId) {
        order.addressId = addressId;
        await order.save({ session });
      }

      const { invoice } = await OrderService.createInvoice({
        tenantId,
        order,
        orderItems,
        totalAmount: cart.grandTotal,
        createdBy: null,
        session,
      });

      await OrderService.createPayment({
        tenantId,
        invoice,
        amountPaid: 0,
        paymentMethod,
        createdBy: null,
        session,
      });

      if (paymentMethod !== "RAZORPAY") {
        cart.items = [];
        cart.subtotal = 0;
        cart.gstAmount = 0;
        cart.discount = 0;
        cart.grandTotal = 0;
        await cart.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return { order, invoice, cart };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async clearCartAfterPayment(customerId, tenantId) {
    const cart = await Cart.findOne({ customerId, tenantId });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.gstAmount = 0;
      cart.discount = 0;
      cart.grandTotal = 0;
      await cart.save();
    }
  }
}
