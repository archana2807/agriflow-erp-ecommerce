import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginApi, registerApi } from "../api/auth";
import { useDispatch } from "react-redux";
import { setCredentials, logout as logoutAction } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../api/api";

export const useLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      toast.success("Login successful!");
      navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Login failed");
    },
  });
};

export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    },
    onError: (err) => {
      toast.error(err.data?.message || err.message || "Registration failed");
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      dispatch(logoutAction());
      qc.clear();
      toast.success("Logged out");
      navigate("/login");
    },
    onError: () => {
      dispatch(logoutAction());
      qc.clear();
      navigate("/login");
    },
  });
};

export const useCheckAuth = () => {
  return useQuery({
    queryKey: ["auth-me"],
    queryFn: () => api.get("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
