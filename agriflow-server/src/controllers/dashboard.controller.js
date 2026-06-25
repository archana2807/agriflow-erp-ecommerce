import Order from "../models/order.model.js";
import Invoice from "../models/invoice.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";

/**
 * GET DASHBOARD DATA
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const totalOrders = await Order.countDocuments({ tenantId });

    const totalCustomers = await Customer.countDocuments({
      tenantId,
      isDeleted: false,
    });

    const totalInvoices = await Invoice.countDocuments({ tenantId });

    const revenueData = await Payment.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amountPaid" },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const totalProducts = await Product.countDocuments({
      tenantId,
      isDeleted: false,
    });

    const pendingInvoices = await Invoice.countDocuments({
      tenantId,
      status: { $ne: "PAID" },
    });

    res.status(200).json({
      success: true,
      totalOrders,
      totalCustomers,
      totalInvoices,
      totalProducts,
      totalRevenue,
      pendingInvoices,
    });
  } catch (error) {
    next(error);
  }
};
