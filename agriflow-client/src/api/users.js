import { api } from "./api";

export const getUsers = (params) => api.get("/users", params);
export const getUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const resetUserPassword = (id, data) => api.put(`/users/${id}/reset-password`, data);
