import mongoose from "mongoose"

const connectTestDB = async () => {
  try {
    // 🔍 debug once (remove later)
    console.log("MONGO_PRACTICE_URI:", process.env.MONGO_PRACTICE_URI);

    await mongoose.connect(process.env.MONGO_PRACTICE_URI)
    console.log("mongodb connected");


     

  } catch (err) {
    console.log(err);
    process.exit(1);

  }
}


export default connectTestDB;

