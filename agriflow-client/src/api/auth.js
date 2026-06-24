import { api } from "./api";

export const loginApi = (data) => api.post("/auth/login", data);
export const registerApi = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");
export const logoutApi = () => api.post("/auth/logout");
