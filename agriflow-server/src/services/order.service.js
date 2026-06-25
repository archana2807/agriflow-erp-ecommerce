import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Invoice from "../models/invoice.model.js";
import Payment from "../models/payment.model.js";

export class OrderService {
  static async createOrder({ tenantId, customerId, items, createdBy, session }) {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const query = Product.findOne({
        _id: item.productId,
        tenantId,
        isDeleted: false,
      });
      if (session) query.session(session);

      const product = await query;

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      totalAmount += item.quantity * item.price;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        gstPercent: product.gstPercent,
      });

      product.stock -= item.quantity;
      if (session) {
        await product.save({ session });
      } else {
        await product.save();
      }
    }

    const orderNo = `ORD-${Date.now()}`;
    const order = new Order({
      tenantId,
      customerId,
      orderNo,
      items: orderItems,
      totalAmount,
      status: "PENDING",
      createdBy,
    });
    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }

    return { order, totalAmount, orderItems };
  }

  static async createInvoice({ tenantId, order, orderItems, totalAmount, createdBy, session }) {
    const invoiceNo = `INV-${Date.now()}`;
    let subtotal = 0;
    let gstAmount = 0;

    orderItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      gstAmount += (itemTotal * (item.gstPercent || 0)) / 100;
    });

    const invoice = new Invoice({
      tenantId,
      invoiceNo,
      orderId: order._id,
      customerId: order.customerId,
      items: orderItems,
      subtotal,
      gstAmount,
      totalAmount,
      status: "UNPAID",
      createdBy,
    });
    if (session) {
      await invoice.save({ session });
    } else {
      await invoice.save();
    }

    return { invoice, subtotal, gstAmount };
  }

  static async createPayment({ tenantId, invoice, amountPaid, paymentMethod, createdBy, session }) {
    const remainingAmount = invoice.totalAmount - amountPaid;
    let status = "PARTIAL";
    if (remainingAmount <= 0) {
      status = "FULL";
    }

    const payment = new Payment({
      tenantId,
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amountPaid,
      paymentMethod,
      remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
      status,
      createdBy,
    });
    if (session) {
      await payment.save({ session });
    } else {
      await payment.save();
    }

    return payment;
  }

  static async restoreStock({ tenantId, order, session }) {
    for (const item of order.items) {
      const update = { $inc: { stock: item.quantity } };
      if (session) {
        await Product.findOneAndUpdate(
          { _id: item.productId, tenantId },
          update,
          { session }
        );
      } else {
        await Product.findOneAndUpdate(
          { _id: item.productId, tenantId },
          update
        );
      }
    }
  }
}
