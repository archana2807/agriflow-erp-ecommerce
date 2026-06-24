/**
 * TENANT MIDDLEWARE
 * Extracts tenantId from authenticated user and attaches to request
 */
export const tenantMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Tenant not associated with this account",
      });
    }

    req.tenantId = req.user.tenantId;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Tenant verification failed",
    });
  }
};

/**
 * OWN DATA ONLY - Ensures user can only access their own tenant data
 */
export const ownTenantOnly = (req, res, next) => {
  try {
    const requestedTenantId = req.params.tenantId || req.body.tenantId;

    if (requestedTenantId && requestedTenantId !== req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: "Access denied to other tenant's data",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Tenant validation failed",
    });
  }
};
