import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "agriflow_jwt_secret_2026";
const TOKEN_EXPIRY = "7d";

const generateToken = (user) => {
  return jwt.sign(
    {
      user: user._id,
      role: user.role,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

/**
 * Set JWT token in httpOnly cookie
 */
export const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear token cookie
 */
export const clearTokenCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 0,
    path: "/",
  });
};

export default generateToken;
