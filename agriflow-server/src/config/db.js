


import mongoose from "mongoose"


const connectDB = async () => {
    try {
          // 🔍 debug once (remove later)
        console.log("MONGO_URI:", process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI)
        console.log("mongodb connected");

    } catch (err) {
        console.log(err);
    process.exit(1);

    }
}

export default connectDB;