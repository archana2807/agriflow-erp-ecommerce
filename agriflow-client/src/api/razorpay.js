import { api } from "./api";

export const createRazorpayOrder = (data) => api.post("/razorpay/create-order", data);
export const verifyRazorpayPayment = (data) => api.post("/razorpay/verify", data);
