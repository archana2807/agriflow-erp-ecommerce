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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },

    shortDescription: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    unit: {
      type: String,
      default: "kg",
    },

    weight: {
      type: Number,
      default: 0,
    },

    mrp: {
      type: Number,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    bestSeller: {
      type: Boolean,
      default: false,
    },

    newArrival: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ sku: 1, tenantId: 1 }, { unique: true });
productSchema.index({ tenantId: 1, slug: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });

export default mongoose.model("Product", productSchema);

