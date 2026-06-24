import Invoice from "../models/invoice.model.js";
import Order from "../models/order.model.js";

/**
 * CREATE INVOICE FROM ORDER
 */
export const createInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.validatedBody;

    const order = await Order.findOne({
      _id: orderId,
      tenantId: req.tenantId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const invoiceNo = `INV-${Date.now()}`;

    let subtotal = 0;
    let gstAmount = 0;

    order.items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      subtotal += itemTotal;
      gstAmount += (itemTotal * (item.gstPercent || 0)) / 100;
    });

    const totalAmount = subtotal + gstAmount;

    const invoice = await Invoice.create({
      tenantId: req.tenantId,
      invoiceNo,
      orderId: order._id,
      customerId: order.customerId,
      items: order.items,
      subtotal,
      gstAmount,
      totalAmount,
      createdBy: req.user.user,
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};
