import { useMutation } from "@tanstack/react-query";
import { createInvoice } from "../api/invoices";
import toast from "react-hot-toast";

export const useCreateInvoice = () =>
  useMutation({
    mutationFn: createInvoice,
    onSuccess: () => toast.success("Invoice created!"),
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    },
  });
