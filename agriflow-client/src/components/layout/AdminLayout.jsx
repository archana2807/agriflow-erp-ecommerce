import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function AdminLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login", { replace: true });
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="erp-loading">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#16a34a" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="erp-layout">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={`erp-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <AdminHeader />
          <main className="erp-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
