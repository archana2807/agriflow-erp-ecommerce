import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import connectTestDB from "./config/connectTestDB.js";

// for testing  start
import TestService from "./services/testService.js";


connectTestDB();

// const result = await TestService.createUser();
// const result = await TestService.getAllUsers();

// const result = await TestService.createOrder();

const result = await TestService.getOrdersWithUser();


console.log("testing result",result);


//for testing end



connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`TEST Server running on port ${PORT}`);
});