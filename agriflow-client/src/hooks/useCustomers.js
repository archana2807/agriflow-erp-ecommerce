import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../api/customers";
import toast from "react-hot-toast";

export const useCustomers = (params) =>
  useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });

export const useCustomer = (id) =>
  useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to create customer");
    },
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to update customer");
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to delete customer");
    },
  });
};
