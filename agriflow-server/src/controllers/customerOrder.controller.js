import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/**
 * GET MY ORDERS
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    };

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("items.productId", "name slug images")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET MY ORDER BY ID
 */
export const getMyOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    }).populate("items.productId", "name slug images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CANCEL MY ORDER
 */
export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled",
      });
    }

    order.status = "CANCELLED";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId },
        { $inc: { stock: item.quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};
