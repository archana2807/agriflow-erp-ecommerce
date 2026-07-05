const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_BASE = BASE;

export const API = {
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    ME: `${BASE}/auth/me`,
    LOGOUT: `${BASE}/auth/logout`,
    PROFILE: `${BASE}/auth/profile`,
    UPDATE_PROFILE: `${BASE}/auth/profile`,
    CHANGE_PASSWORD: `${BASE}/auth/change-password`,
  },
  CUSTOMER_AUTH: {
    REGISTER: `${BASE}/customer/register`,
    LOGIN: `${BASE}/customer/login`,
    LOGOUT: `${BASE}/customer/logout`,
    ME: `${BASE}/customer/me`,
    PROFILE: `${BASE}/customer/profile`,
    UPDATE_PROFILE: `${BASE}/customer/profile`,
    CHANGE_PASSWORD: `${BASE}/customer/change-password`,
  },
  DASHBOARD: `${BASE}/dashboard`,
  USERS: `${BASE}/users`,
  CUSTOMERS: `${BASE}/customers`,
  PRODUCTS: `${BASE}/products`,
  ORDERS: `${BASE}/orders`,
  INVOICES: `${BASE}/invoices`,
  PAYMENTS: `${BASE}/payments`,
  RAZORPAY: {
    CREATE: `${BASE}/razorpay/create-order`,
    VERIFY: `${BASE}/razorpay/verify`,
  },
  SHOP: {
    PRODUCTS: `${BASE}/shop/products`,
    PRODUCT_SLUG: (slug) => `${BASE}/shop/products/${slug}`,
    CATEGORIES: `${BASE}/shop/categories`,
    BRANDS: `${BASE}/shop/brands`,
    SEARCH: `${BASE}/shop/search`,
    FEATURED: `${BASE}/shop/featured`,
    NEW: `${BASE}/shop/new-arrivals`,
    BEST: `${BASE}/shop/best-sellers`,
  },
  CART: `${BASE}/cart`,
  WISHLIST: `${BASE}/wishlist`,
  ADDRESSES: `${BASE}/addresses`,
  CHECKOUT: `${BASE}/checkout`,
  MY_ORDERS: `${BASE}/my-orders`,
  ADMIN: {
    CATEGORIES: `${BASE}/admin/categories`,
    BRANDS: `${BASE}/admin/brands`,
    BANNERS: `${BASE}/admin/banners`,
    COUPONS: `${BASE}/admin/coupons`,
  },
};
