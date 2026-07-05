import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

export const brandService = {
  getAll: (params) => get(`${API.ADMIN.BRANDS}${buildQuery(params)}`),
  getById: (id) => get(`${API.ADMIN.BRANDS}/${id}`),
  create: (data) => post(API.ADMIN.BRANDS, data),
  update: (id, data) => put(`${API.ADMIN.BRANDS}/${id}`, data),
  delete: (id) => del(`${API.ADMIN.BRANDS}/${id}`),
};
