import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";

const router = express.Router();

router.get("/", protectCustomer, getCart);
router.post("/", protectCustomer, addToCart);
router.put("/:productId", protectCustomer, updateCartItem);
router.delete("/:productId", protectCustomer, removeFromCart);
router.delete("/", protectCustomer, clearCart);

export default router;
