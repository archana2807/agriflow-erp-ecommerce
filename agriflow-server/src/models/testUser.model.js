import mongoose from "mongoose";
import { minLength, string } from "zod";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false
    },
    age: {
        type: Number,
        min: 18
    },
    isActive: {
        type: Boolean,
        default: true
    },
    },
     {
    timestamps: true,
    }
)

userSchema.pre("save", async function () {
      // only hash if password is new or changed

    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
})

export default mongoose.model("TestUser", userSchema);