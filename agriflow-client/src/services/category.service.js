import { API } from "@/constants/api";
import { get, post, put, del } from "./api";
import { buildQuery } from "@/lib/utils";

export const categoryService = {
  getAll: (params) => get(`${API.ADMIN.CATEGORIES}${buildQuery(params)}`),
  getById: (id) => get(`${API.ADMIN.CATEGORIES}/${id}`),
  create: (data) => post(API.ADMIN.CATEGORIES, data),
  update: (id, data) => put(`${API.ADMIN.CATEGORIES}/${id}`, data),
  delete: (id) => del(`${API.ADMIN.CATEGORIES}/${id}`),
};
