import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    gstPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 28,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * 🚀 Important:
 * SKU must be unique per tenant
 */
productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });

export default mongoose.model("Product", productSchema);

