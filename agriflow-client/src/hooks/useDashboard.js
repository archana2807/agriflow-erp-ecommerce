import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboard";

export const useDashboard = () =>
  useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardStats,
    select: (res) => res.data,
  });
