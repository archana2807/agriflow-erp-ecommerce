import express from "express";
import { checkout } from "../controllers/checkout.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";

const router = express.Router();

router.post("/", protectCustomer, checkout);

export default router;
