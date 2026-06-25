import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { protectCustomer } from "../middlewares/customerAuth.middleware.js";

const router = express.Router();

router.get("/", protectCustomer, getWishlist);
router.post("/", protectCustomer, addToWishlist);
router.delete("/:productId", protectCustomer, removeFromWishlist);

export default router;
