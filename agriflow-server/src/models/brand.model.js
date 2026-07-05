import mongoose from "mongoose";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const brandSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      default: null,
    },

    logo: {
      type: String,
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

brandSchema.index({ tenantId: 1, name: 1 }, { unique: true });
brandSchema.index({ tenantId: 1, slug: 1 }, { sparse: true });

brandSchema.pre("save", function () {
  if (this.isModified("name") && !this.slug) {
    this.slug = slugify(this.name);
  }
});

export default mongoose.model("Brand", brandSchema);
