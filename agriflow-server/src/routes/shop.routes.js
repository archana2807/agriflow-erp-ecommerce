import express from "express";
import {
  getShopProducts,
  getShopProductBySlug,
  getShopCategories,
  getShopBrands,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
} from "../controllers/shop.controller.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/products", getShopProducts);
router.get("/products/:slug", getShopProductBySlug);
router.get("/categories", getShopCategories);
router.get("/brands", getShopBrands);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/new-arrivals", getNewArrivals);
router.get("/best-sellers", getBestSellers);

export default router;
