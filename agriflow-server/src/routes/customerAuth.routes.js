import express from "express";
import {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  changeCustomerPassword,
} from "../controllers/customerAuth.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  customerRegisterSchema,
  customerLoginSchema,
  updateCustomerProfileSchema,
  customerChangePasswordSchema,
} from "../validations/customerAuth.validation.js";

const router = express.Router();

// PUBLIC
router.post("/register", validate(customerRegisterSchema), registerCustomer);
router.post("/login", validate(customerLoginSchema), loginCustomer);
router.post("/logout", logoutCustomer);

// PROTECTED - any authenticated customer
router.get("/me", protectCustomer, getCustomerProfile);
router.get("/profile", protectCustomer, getCustomerProfile);
router.put("/profile", protectCustomer, validate(updateCustomerProfileSchema), updateCustomerProfile);
router.put("/change-password", protectCustomer, validate(customerChangePasswordSchema), changeCustomerPassword);

export default router;
