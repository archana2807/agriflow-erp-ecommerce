import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProduct } from "../api/products";
import toast from "react-hot-toast";

export const useProducts = (params) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: () => getProducts(params),
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to create product");
    },
  });
};
