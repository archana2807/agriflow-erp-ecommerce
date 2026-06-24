/**
 * ROLE-BASED ACCESS CONTROL MIDDLEWARE
 * Usage: authorize("ADMIN", "SALES")
 */

// All valid roles in the system
const VALID_ROLES = ["ADMIN", "SALES", "ACCOUNTANT", "TECHNICIAN"];

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = {
  ADMIN: 4,
  ACCOUNTANT: 3,
  SALES: 2,
  TECHNICIAN: 1,
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // Check if user is attached by protect middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please login",
        });
      }

      const userRole = req.user.role;

      // Check if role is valid
      if (!userRole || !VALID_ROLES.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Invalid user role. Contact administrator",
        });
      }

      // Check if role is authorized
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${userRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

/**
 * CHECK ROLE LEVEL - Requires user to have role equal or higher than specified
 */
export const requireRoleLevel = (minRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Minimum role required: ${minRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

export { VALID_ROLES, ROLE_HIERARCHY };
