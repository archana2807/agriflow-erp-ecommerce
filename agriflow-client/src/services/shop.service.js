import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

const shopService = {
  getProducts: (params) => get(`${API.SHOP.PRODUCTS}${buildQuery(params)}`),
  getProductBySlug: (slug) => get(API.SHOP.PRODUCT_SLUG(slug)),
  searchProducts: (q, params) =>
    get(`${API.SHOP.SEARCH}${buildQuery({ q, ...params })}`),
  getCategories: () => get(API.SHOP.CATEGORIES),
  getBrands: () => get(API.SHOP.BRANDS),
  getFeatured: () => get(API.SHOP.FEATURED),
  getNewArrivals: () => get(API.SHOP.NEW),
  getBestSellers: () => get(API.SHOP.BEST),

  getCart: () => get(API.CART),
  addToCart: (productId, quantity) => post(API.CART, { productId, quantity }),
  updateCart: (productId, quantity) => put(`${API.CART}/${productId}`, { quantity }),
  removeFromCart: (productId) => del(`${API.CART}/${productId}`),
  clearCart: () => del(API.CART),

  getWishlist: () => get(API.WISHLIST),
  addToWishlist: (productId) => post(API.WISHLIST, { productId }),
  removeFromWishlist: (productId) => del(`${API.WISHLIST}/${productId}`),

  getAddresses: () => get(API.ADDRESSES),
  createAddress: (data) => post(API.ADDRESSES, data),
  updateAddress: (id, data) => put(`${API.ADDRESSES}/${id}`, data),
  deleteAddress: (id) => del(`${API.ADDRESSES}/${id}`),

  checkout: (data) => post(API.CHECKOUT, data),
  getMyOrders: (params) => get(`${API.MY_ORDERS}${buildQuery(params)}`),
  getMyOrderById: (id) => get(`${API.MY_ORDERS}/${id}`),
  cancelOrder: (id) => put(`${API.MY_ORDERS}/${id}/cancel`),
};

export default shopService;
