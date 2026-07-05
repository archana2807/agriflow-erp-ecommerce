import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const ERP_ROLES = ["ADMIN", "SALES", "MANAGER", "ACCOUNTANT"];

export function AdminProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!ERP_ROLES.includes(user.role)) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export function CustomerProtectedRoute() {
  const { user } = useCustomerAuth();
  if (!user) return <Navigate to="/customer/login" replace />;
  return <Outlet />;
}

export function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/admin/dashboard" replace />;
  return children;
}

export function CustomerGuestRoute({ children }) {
  const { user } = useCustomerAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}
