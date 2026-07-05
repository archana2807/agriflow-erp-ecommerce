import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.JWT_SECRET || "agriflow_jwt_secret_2026";

/**
 * PROTECT ROUTE - Verify JWT token from cookie or Authorization header
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Try to get token from httpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
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

    const user = await User.findById(decoded.user).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Contact administrator",
      });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId instanceof mongoose.Types.ObjectId ? user.tenantId : new mongoose.Types.ObjectId(String(user.tenantId)),
      isActive: user.isActive,
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
 * OPTIONAL AUTH - Attach user if token exists, but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.user).select("-password");

    if (user && user.isActive) {
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId instanceof mongoose.Types.ObjectId ? user.tenantId : new mongoose.Types.ObjectId(String(user.tenantId)),
      };
    } else {
      req.user = null;
    }

    next();
  } catch {
    req.user = null;
    next();
  }
};

export { JWT_SECRET };
