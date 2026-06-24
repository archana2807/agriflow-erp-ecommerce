import { api } from "./api";

export const getOrders = () => api.get("/orders");
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const createOrder = (data) => api.post("/orders", data);
export const updateOrderStatus = (id, data) => api.put(`/orders/${id}/status`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
