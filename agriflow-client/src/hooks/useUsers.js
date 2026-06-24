import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "../api/users";
import toast from "react-hot-toast";

export const useUsers = (params) =>
  useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated!");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to deactivate user");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, data }) => resetUserPassword(id, data),
    onSuccess: () => toast.success("Password reset!"),
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Failed to reset password");
    },
  });
};
