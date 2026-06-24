import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { tenantMiddleware } from "../middlewares/tenant.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "../controllers/user.controller.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "../validations/user.validation.js";

const router = express.Router();

router.use(protect, authorize("ADMIN"), tenantMiddleware);

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", validate(createUserSchema), createUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/reset-password", validate(resetPasswordSchema), resetUserPassword);

export default router;
