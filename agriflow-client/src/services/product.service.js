import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

export const productService = {
  getAll: (params) => get(`${API.PRODUCTS}${buildQuery(params)}`),
  getById: (id) => get(`${API.PRODUCTS}/${id}`),
  create: (data) => post(API.PRODUCTS, data),
  update: (id, data) => put(`${API.PRODUCTS}/${id}`, data),
  delete: (id) => del(`${API.PRODUCTS}/${id}`),
};
