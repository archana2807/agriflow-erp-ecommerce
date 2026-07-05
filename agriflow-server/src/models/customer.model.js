import mongoose from "mongoose";
import bcrypt from "bcrypt";
import normalizePhone from "../utils/normalizePhone.js";

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: false,
      lowercase: true,
      trim: true,
      sparse: true,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },

    isWalkIn: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      required: true,
      set: normalizePhone,
    },

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

customerSchema.index({ tenantId: 1, phone: 1 }, { unique: true });
customerSchema.index({ tenantId: 1, email: 1 });

customerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Customer", customerSchema);