import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
        trim: true,
        
    },
    price: {
        type: Number,
        required:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestUser",
        required: true
    }
},
    {
        timestamps: true
    }
)

export default mongoose.model("TestOrder",orderSchema)