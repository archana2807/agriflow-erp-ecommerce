import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agriflow_jwt_secret_2026";
const TOKEN_EXPIRY = "7d";

/**
 * Generate JWT token for customer
 */
export const generateCustomerToken = (customer) => {
  return jwt.sign(
    {
      customerId: customer._id,
      tenantId: customer.tenantId,
      email: customer.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Set customer JWT token in httpOnly cookie
 */
export const setCustomerTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("customerToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear customer token cookie
 */
export const clearCustomerTokenCookie = (res) => {
  res.cookie("customerToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 0,
    path: "/",
  });
};
