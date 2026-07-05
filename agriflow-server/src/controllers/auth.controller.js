import mongoose from "mongoose";
import User from "../models/user.model.js";
import generateToken, { setTokenCookie } from "../utils/generateToken.js";

/**
 * REGISTER USER
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.validatedBody;

    const tenantId = new mongoose.Types.ObjectId("6a2da032a1988ba7bb7e9820");

    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "CUSTOMER",
      tenantId,
    });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGIN USER
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.validatedBody;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Contact administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * LOGOUT
 */
export const logoutUser = async (req, res) => {
  const { clearTokenCookie } = await import("../utils/generateToken.js");
  clearTokenCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

/**
 * UPDATE PROFILE
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.validatedBody;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      const existing = await User.findOne({
        email,
        tenantId: req.user.tenantId,
        _id: { $ne: req.user.id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user",
        });
      }
      updates.email = email;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CHANGE PASSWORD
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;

    const user = await User.findById(req.user.id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
