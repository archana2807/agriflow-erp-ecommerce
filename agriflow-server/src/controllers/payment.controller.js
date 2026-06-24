import Payment from "../models/payment.model.js";
import Invoice from "../models/invoice.model.js";

/**
 * CREATE PAYMENT
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
        message: "Invoice not found",
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
      paymentMethod,
      remainingAmount: remainingAmount < 0 ? 0 : remainingAmount,
      status,
      createdBy: req.user.user,
    });

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    next(error);
  }
};
