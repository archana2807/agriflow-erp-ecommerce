import { api } from "./api";

export const createInvoice = (data) => api.post("/invoices", data);
