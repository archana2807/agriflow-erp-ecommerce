import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    orderNo: {
      type: String,
      unique: true,
      sparse: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,
        quantity: Number,
        price: Number,
        gstPercent: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PACKED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },

    orderType: {
      type: String,
      enum: ["WALKIN", "ONLINE"],
      default: "ONLINE",
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI", "BANK_TRANSFER", "RAZORPAY", "NONE"],
      default: "NONE",
    },

    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIAL", "PAID"],
      default: "UNPAID",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    paymentId: {
      type: String,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, orderNo: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model("Order", orderSchema);