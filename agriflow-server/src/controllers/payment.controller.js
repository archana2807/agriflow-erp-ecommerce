import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";
import Order from "../models/order.model.js";

/**
 * CREATE PAYMENT (Additional payment on existing invoice)
 */
export const createPayment = async (req, res, next) => {
  try {
    const { invoiceId, amountPaid, paymentMethod } = req.validatedBody;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      tenantId: req.tenantId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (invoice.status === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Invoice is already fully paid",
      });
    }

    const previousPayments = await Payment.find({ invoiceId });
    const totalPaidSoFar = previousPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const newTotalPaid = totalPaidSoFar + amountPaid;
    const remainingAmount = invoice.totalAmount - newTotalPaid;

    let status = "PARTIAL";
    if (remainingAmount <= 0) {
      status = "FULL";
    }

    const payment = await Payment.create({
      tenantId: req.tenantId,
      invoiceId,
      customerId: invoice.customerId,
      amountPaid,
      paymentMethod: paymentMethod || "CASH",
      remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
      status,
      createdBy: req.user.user,
    });

    // Update invoice status
    invoice.status = status === "FULL" ? "PAID" : "PARTIAL";
    await invoice.save();

    // Update order payment status
    const order = await Order.findById(invoice.orderId);
    if (order) {
      order.paymentStatus = status === "FULL" ? "PAID" : "PARTIAL";
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: status === "FULL" ? "Payment complete. Invoice fully paid." : "Partial payment recorded.",
      payment,
      invoiceStatus: invoice.status,
      orderPaymentStatus: order?.paymentStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL PAYMENTS (Tenant-wise)
 */
export const getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = { tenantId: req.tenantId };
    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate("customerId", "name email phone")
      .populate("invoiceId", "invoiceNo totalAmount")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PAYMENTS BY INVOICE
 */
export const getPaymentsByInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      tenantId: req.tenantId,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const payments = await Payment.find({ invoiceId, tenantId: req.tenantId })
      .sort({ createdAt: -1 });

    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const remainingAmount = invoice.totalAmount - totalPaid;

    res.status(200).json({
      success: true,
      payments,
      invoice: {
        _id: invoice._id,
        invoiceNo: invoice.invoiceNo,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
      },
      totalPaid,
      remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
    });
  } catch (error) {
    next(error);
  }
};
