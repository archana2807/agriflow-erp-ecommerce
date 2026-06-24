import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from "../api/orders";
import toast from "react-hot-toast";

export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to create order");
    },
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateOrderStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to update order");
    },
  });
};

export const useDeleteOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to delete order");
    },
  });
};
