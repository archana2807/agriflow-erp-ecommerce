import { CheckoutService } from "../services/checkout.service.js";

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

    res.status(201).json({
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
    });
  } catch (error) {
    if (error.message === "Cart is empty") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
