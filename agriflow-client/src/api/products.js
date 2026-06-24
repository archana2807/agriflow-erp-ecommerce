import { api } from "./api";

export const getPublicProducts = (params) => api.get("/products", params);
export const getPublicProductById = (id) => api.get(`/products/public/${id}`);
export const getProducts = (params) => api.get("/products", params);
export const createProduct = (data) => api.post("/products", data);
