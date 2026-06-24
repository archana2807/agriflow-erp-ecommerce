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

    // 📦 Total Orders
    const totalOrders = await Order.countDocuments({ tenantId });

    // 👥 Total Customers
    const totalCustomers = await Customer.countDocuments({
      tenantId,
      isDeleted: false,
    });

    // 📄 Total Invoices
    const totalInvoices = await Invoice.countDocuments({ tenantId });

    // 💰 Total Revenue (from payments)
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

    // 📦 Total Products
    const totalProducts = await Product.countDocuments({
      tenantId,
      isDeleted: false,
    });

    // 📄 Pending Invoices
    const pendingInvoices = await Invoice.countDocuments({
      tenantId,
      status: { $ne: "PAID" },
    });

    res.status(200).json({
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