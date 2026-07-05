import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

const adminService = {
  customers: {
    getAll: (params) => get(`${API.CUSTOMERS}${buildQuery(params)}`),
    getById: (id) => get(`${API.CUSTOMERS}/${id}`),
    create: (data) => post(API.CUSTOMERS, data),
    update: (id, data) => put(`${API.CUSTOMERS}/${id}`, data),
    delete: (id) => del(`${API.CUSTOMERS}/${id}`),
  },
  categories: {
    getAll: (params) => get(`${API.ADMIN.CATEGORIES}${buildQuery(params)}`),
    create: (data) => post(API.ADMIN.CATEGORIES, data),
    update: (id, data) => put(`${API.ADMIN.CATEGORIES}/${id}`, data),
    delete: (id) => del(`${API.ADMIN.CATEGORIES}/${id}`),
  },
  brands: {
    getAll: (params) => get(`${API.ADMIN.BRANDS}${buildQuery(params)}`),
    create: (data) => post(API.ADMIN.BRANDS, data),
    update: (id, data) => put(`${API.ADMIN.BRANDS}/${id}`, data),
    delete: (id) => del(`${API.ADMIN.BRANDS}/${id}`),
  },
  products: {
    getAll: (params) => get(`${API.PRODUCTS}${buildQuery(params)}`),
    getById: (id) => get(`${API.PRODUCTS}/${id}`),
    create: (data) => post(API.PRODUCTS, data),
    update: (id, data) => put(`${API.PRODUCTS}/${id}`, data),
    delete: (id) => del(`${API.PRODUCTS}/${id}`),
  },
  orders: {
    create: (data) => post(API.ORDERS, data),
    getAll: () => get(API.ORDERS),
    getById: (id) => get(`${API.ORDERS}/${id}`),
    updateStatus: (id, status) => put(`${API.ORDERS}/${id}/status`, { status }),
    delete: (id) => del(`${API.ORDERS}/${id}`),
  },
  invoices: {
    getAll: (params) => get(`${API.INVOICES}${buildQuery(params)}`),
    getByOrder: (orderId) => get(`${API.INVOICES}/order/${orderId}`),
  },
  payments: {
    getAll: (params) => get(`${API.PAYMENTS}${buildQuery(params)}`),
    getByInvoice: (invoiceId) => get(`${API.PAYMENTS}/invoice/${invoiceId}`),
    create: (data) => post(API.PAYMENTS, data),
  },
  coupons: {
    getAll: (params) => get(`${API.ADMIN.COUPONS}${buildQuery(params)}`),
    create: (data) => post(API.ADMIN.COUPONS, data),
    update: (id, data) => put(`${API.ADMIN.COUPONS}/${id}`, data),
    delete: (id) => del(`${API.ADMIN.COUPONS}/${id}`),
    validate: (data) => post(`${API.ADMIN.COUPONS}/validate`, data),
  },
  banners: {
    getAll: () => get(API.ADMIN.BANNERS),
    getActive: () => get(`${API.ADMIN.BANNERS}/active`),
    create: (data) => post(API.ADMIN.BANNERS, data),
    update: (id, data) => put(`${API.ADMIN.BANNERS}/${id}`, data),
    delete: (id) => del(`${API.ADMIN.BANNERS}/${id}`),
  },
  dashboard: {
    getStats: () => get(API.DASHBOARD),
  },
  users: {
    getAll: (params) => get(`${API.USERS}${buildQuery(params)}`),
    create: (data) => post(API.USERS, data),
    update: (id, data) => put(`${API.USERS}/${id}`, data),
    delete: (id) => del(`${API.USERS}/${id}`),
  },
};

export default adminService;
