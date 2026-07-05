import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { errorHandler } from "./middlewares/error.middleware.js";
import { tenantRateLimiterMiddleware } from "./middlewares/tenantRateLimiter.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import orderRoutes from "./routes/order.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import routerDashboard from "./routes/dashboard.routes.js";
import productRouters from "./routes/product.routes.js";
import razorpayRoutes from "./routes/razorpay.routes.js";
import userRoutes from "./routes/user.routes.js";

// Customer Shop Routes
import customerAuthRoutes from "./routes/customerAuth.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import customerOrderRoutes from "./routes/customerOrder.routes.js";

// Admin Management Routes
import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

const app = express();

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

// CORS & Parsing
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Rate Limiting
app.use("/api/", tenantRateLimiterMiddleware);

// Error Handler (must be last)
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
app.use("/api/admin/categories", categoryRoutes);
app.use("/api/admin/brands", brandRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/coupons", couponRoutes);

// Customer Shop Routes
app.use("/api/customer", customerAuthRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/my-orders", customerOrderRoutes);

export default app;
