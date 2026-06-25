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
        success: false,
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
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL INVOICES (Tenant-wise)
 */
export const getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { tenantId: req.tenantId };
    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .populate("customerId", "name email phone")
      .populate("orderId", "orderNo")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET INVOICE BY ORDER ID
 */
export const getInvoiceByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const invoice = await Invoice.findOne({
      orderId,
      tenantId: req.tenantId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this order",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    next(error);
  }
};
