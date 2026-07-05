import Order from "../models/order.model.js";
import { OrderService } from "../services/order.service.js";

/**
 * CREATE ORDER
 */
export const createOrder = async (req, res, next) => {
  try {
    const { customerId, items, orderType, paymentMethod, paymentAmount } = req.validatedBody;

    const { order, totalAmount, orderItems } = await OrderService.createOrder({
      tenantId: req.tenantId,
      customerId,
      items,
      createdBy: req.user.id,
      session: null,
    });

    if (orderType === "WALKIN") {
      order.orderType = "WALKIN";
      order.paymentMethod = paymentMethod || "CASH";

      const { invoice, subtotal, gstAmount } = await OrderService.createInvoice({
        tenantId: req.tenantId,
        order,
        orderItems,
        totalAmount,
        createdBy: req.user.id,
        session: null,
      });

      const paidAmount = paymentAmount || totalAmount;
      if (paidAmount > 0) {
        await OrderService.createPayment({
          tenantId: req.tenantId,
          invoice,
          amountPaid: paidAmount,
          paymentMethod: paymentMethod || "CASH",
          createdBy: req.user.id,
          session: null,
        });

        invoice.status = paidAmount >= totalAmount ? "PAID" : "PARTIAL";
        await invoice.save();

        order.paymentStatus = paidAmount >= totalAmount ? "PAID" : "PARTIAL";
        order.status = "CONFIRMED";
      }

      await order.save();
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (error.message.startsWith("Product not found") || error.message.startsWith("Insufficient stock")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET ALL ORDERS (Tenant-wise)
 */
export const getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    const query = { tenantId: req.tenantId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("customerId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.json({ success: true, orders, total, page, limit, totalPages: Math.ceil(total / limit), totalCount: total });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ORDER BY ID
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    }).populate("customerId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ORDER STATUS
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedBody;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ORDER (ADMIN ONLY)
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await OrderService.restoreStock({ tenantId: req.tenantId, order, session: null });

    await Order.deleteOne({ _id: order._id });

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};
