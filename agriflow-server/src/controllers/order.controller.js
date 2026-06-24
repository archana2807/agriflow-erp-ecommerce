import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

/**
 * CREATE ORDER
 */
export const createOrder = async (req, res, next) => {
  try {
    const { customerId, items } = req.validatedBody;

    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId: req.tenantId,
        isDeleted: false,
      });

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      totalAmount += item.quantity * item.price;
    }

    const order = await Order.create({
      tenantId: req.tenantId,
      customerId,
      items,
      totalAmount,
      createdBy: req.user.user,
    });

    for (const item of items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, tenantId: req.tenantId },
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL ORDERS (Tenant-wise)
 */
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ tenantId: req.tenantId })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ orders });
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
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
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
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
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
      return res.status(404).json({ message: "Order not found" });
    }

    for (const item of order.items) {
      await Product.findOneAndUpdate(
        { _id: item.productId, tenantId: req.tenantId },
        { $inc: { stock: item.quantity } }
      );
    }

    await Order.deleteOne({ _id: order._id });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    next(error);
  }
};
