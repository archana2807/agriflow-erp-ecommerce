import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";

const router = express.Router();

router.get("/", protectCustomer, getAddresses);
router.post("/", protectCustomer, createAddress);
router.put("/:id", protectCustomer, updateAddress);
router.delete("/:id", protectCustomer, deleteAddress);

export default router;
