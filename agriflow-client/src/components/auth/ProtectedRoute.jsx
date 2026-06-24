import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute - Requires authentication
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RoleRoute - Requires specific role(s)
 */
export function RoleRoute({ children, roles }) {
  const { isAuthenticated, user } = useSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

/**
 * AdminRoute - Requires ADMIN role
 */
export function AdminRoute({ children }) {
  return <RoleRoute roles={["ADMIN"]}>{children}</RoleRoute>;
}

/**
 * GuestRoute - Only for non-authenticated users (login/register)
 */
export function GuestRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}
