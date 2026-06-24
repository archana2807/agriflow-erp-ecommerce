import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import orderRoutes from "./routes/order.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import routerDashboard from "./routes/dashboard.routes.js";
import productRouters from "./routes/product.routes.js";
import razorpayRoutes from "./routes/razorpay.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (all require JWT)
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/dashboard", routerDashboard);
app.use("/api/products", productRouters);
app.use("/api/razorpay", razorpayRoutes);

// Admin Routes
app.use("/api/users", userRoutes);

export default app;
