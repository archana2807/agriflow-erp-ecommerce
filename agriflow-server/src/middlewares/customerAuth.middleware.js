import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "agriflow_jwt_secret_2026";

/**
 * PROTECT CUSTOMER ROUTE - Verify JWT token from cookie or Authorization header
 */
export const protectCustomer = async (req, res, next) => {
  try {

    
    let token;

    // 1. Try to get token from httpOnly cookie
    if (req.cookies && req.cookies.customerToken) {
      token = req.cookies.customerToken;
    }

    // 2. Fallback to Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const customer = await Customer.findById(decoded.customerId).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer no longer exists",
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    req.customer = {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tenantId: customer.tenantId instanceof mongoose.Types.ObjectId ? customer.tenantId : new mongoose.Types.ObjectId(String(customer.tenantId)),
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

/**
 * OPTIONAL CUSTOMER AUTH - Attach customer if token exists, but don't require it
 */
export const optionalCustomerAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.customerToken) {
      token = req.cookies.customerToken;
    }

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.customer = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const customer = await Customer.findById(decoded.customerId).select("-password");

    if (customer && customer.isActive) {
      req.customer = {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tenantId: customer.tenantId instanceof mongoose.Types.ObjectId ? customer.tenantId : new mongoose.Types.ObjectId(String(customer.tenantId)),
      };
    } else {
      req.customer = null;
    }

    next();
  } catch {
    req.customer = null;
    next();
  }
};

export { JWT_SECRET };
