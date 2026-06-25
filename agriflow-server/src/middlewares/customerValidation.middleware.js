export const customerValidation = (req, res, next) => {
  if (!req.customer) {
    return res.status(401).json({
      success: false,
      message: "Customer authentication required",
    });
  }

  if (!req.customer.tenantId) {
    return res.status(403).json({
      success: false,
      message: "Tenant not associated with this account",
    });
  }

  next();
};
