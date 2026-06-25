import Customer from "../models/customer.model.js";
import { generateCustomerToken, setCustomerTokenCookie, clearCustomerTokenCookie } from "../utils/generateCustomerToken.js";

/**
 * REGISTER CUSTOMER
 */
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.validatedBody;

    const tenantId = req.query.tenantId || "default";

    const existingCustomer = await Customer.findOne({
      email,
      tenantId,
      isDeleted: false,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists with this email",
      });
    }

    const customer = await Customer.create({
      name,
      email,
      password,
      phone,
      tenantId,
    });

    const token = generateCustomerToken(customer);
    setCustomerTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tenantId: customer.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN CUSTOMER
 */
export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const tenantId = req.query.tenantId || "default";

    const customer = await Customer.findOne({
      email,
      tenantId,
      isDeleted: false,
    }).select("+password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!customer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    const isMatch = await customer.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateCustomerToken(customer);
    setCustomerTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tenantId: customer.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT CUSTOMER
 */
export const logoutCustomer = async (req, res) => {
  clearCustomerTokenCookie(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/**
 * GET CUSTOMER PROFILE
 */
export const getCustomerProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer.id).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tenantId: customer.tenantId,
        createdAt: customer.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE CUSTOMER PROFILE
 */
export const updateCustomerProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.validatedBody;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (email) {
      const existing = await Customer.findOne({
        email,
        tenantId: req.customer.tenantId,
        _id: { $ne: req.customer.id },
        isDeleted: false,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another customer",
        });
      }
      updates.email = email;
    }

    const customer = await Customer.findByIdAndUpdate(req.customer.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        tenantId: customer.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CHANGE CUSTOMER PASSWORD
 */
export const changeCustomerPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;

    const customer = await Customer.findById(req.customer.id).select("+password");

    const isMatch = await customer.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    customer.password = newPassword;
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
