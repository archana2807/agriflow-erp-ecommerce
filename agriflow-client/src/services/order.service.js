import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

export const orderService = {
  getAll: (params) => get(`${API.ORDERS}${buildQuery(params)}`),
  getById: (id) => get(`${API.ORDERS}/${id}`),
  create: (data) => post(API.ORDERS, data),
  updateStatus: (id, status) => put(`${API.ORDERS}/${id}/status`, { status }),
  recordPayment: (data) => post(`${API.PAYMENTS}`, data),
  delete: (id) => del(`${API.ORDERS}/${id}`),
};
