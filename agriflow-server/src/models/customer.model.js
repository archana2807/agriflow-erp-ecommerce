import mongoose from "mongoose";
import normalizePhone from "../utils/normalizePhone.js";

const customerSchema = new mongoose.Schema(
    {
    name: String,
    phone: {
            type: String,
            require: true,
            set:normalizePhone 
    },   
    tenantId: {
        type: String,
        require: true,
        index: true
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
     {timestamps:true},
)
customerSchema.index(
    { tenantId: 1, phone: 1 },
    {unique: true}
)

export default mongoose.model('Customer', customerSchema);