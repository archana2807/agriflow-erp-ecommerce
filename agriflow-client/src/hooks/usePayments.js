import { useMutation } from "@tanstack/react-query";
import { createPayment } from "../api/payments";
import toast from "react-hot-toast";

export const useCreatePayment = () =>
  useMutation({
    mutationFn: createPayment,
    onSuccess: () => toast.success("Payment recorded!"),
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to record payment");
    },
  });
