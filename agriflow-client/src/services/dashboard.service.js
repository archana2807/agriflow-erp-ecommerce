import { API } from "@/constants/api";
import { get } from "./api";

export const dashboardService = {
  getStats: () => get(API.DASHBOARD),
};
