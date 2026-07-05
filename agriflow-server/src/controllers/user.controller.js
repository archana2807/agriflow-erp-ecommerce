import User from "../models/user.model.js";

/**
 * GET ALL USERS (ADMIN only, tenant-scoped)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    const query = { tenantId: req.tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET USER BY ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE USER (ADMIN only)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.validatedBody;

    const existing = await User.findOne({ email, tenantId: req.tenantId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists in this tenant",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "SALES",
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
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
 * UPDATE USER (ADMIN only)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, isActive } = req.validatedBody;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      const existing = await User.findOne({
        email,
        tenantId: req.tenantId,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }
      updates.email = email;
    }
    if (role) updates.role = role;
    if (typeof isActive === "boolean") updates.isActive = isActive;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, message: "User updated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE USER (ADMIN only, soft delete by deactivating)
 */
export const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({ success: true, message: "User deactivated", user });
  } catch (error) {
    next(error);
  }
};

/**
 * RESET USER PASSWORD (ADMIN only)
 */
export const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.validatedBody;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};
