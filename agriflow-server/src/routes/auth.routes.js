import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  loginUser,
  registerUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../validations/auth.validation.js";

const router = express.Router();

// PUBLIC
router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);

// Check if user is logged in (via cookie)
router.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// PROTECTED - any authenticated user
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put("/change-password", protect, validate(changePasswordSchema), changePassword);

// ADMIN ONLY
router.get("/admin-only", protect, authorize("ADMIN"), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin Panel",
    user: req.user,
  });
});

export default router;
