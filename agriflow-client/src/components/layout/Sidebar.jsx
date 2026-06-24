import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogout } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  LogOut,
  Menu,
  X,
  Leaf,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SALES", "ACCOUNTANT", "TECHNICIAN"] },
  { to: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "SALES"] },
  { to: "/erp/products", label: "Products", icon: Package, roles: ["ADMIN", "SALES", "ACCOUNTANT"] },
  { to: "/orders", label: "Orders", icon: ShoppingCart, roles: ["ADMIN", "SALES"] },
  { to: "/invoices", label: "Invoices", icon: FileText, roles: ["ADMIN", "ACCOUNTANT"] },
  { to: "/payments", label: "Payments", icon: CreditCard, roles: ["ADMIN", "ACCOUNTANT"] },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const logoutMut = useLogout();
  const { user } = useSelector((s) => s.auth);

  const hasAccess = (roles) => !roles || roles.includes(user?.role);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-green-600/10 text-green-400"
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    }`;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-slate-800 p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-700 hover:text-slate-200 lg:hidden"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-slate-900 text-slate-400 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6">
          <Leaf size={28} className="text-green-400" />
          <span className="text-lg font-bold text-green-400">Ambika Krishi Yantra</span>
        </div>

        {/* User info */}
        {user && (
          <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600/20 text-sm font-semibold text-green-400">
              {user.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">{user.name}</p>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {/* ERP Admin section */}
          {user?.role !== "CUSTOMER" && (
            <>
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                ERP Admin
              </p>
              <div className="space-y-1">
                {navItems.map((item) => {
                  if (!hasAccess(item.roles)) return null;
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={linkClasses}
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}

          {/* Admin-only section */}
          {user?.role === "ADMIN" && (
            <>
              <p className="mb-2 mt-6 px-4 text-xs font-semibold uppercase tracking-wider text-slate-600">
                Administration
              </p>
              <div className="space-y-1">
                <NavLink
                  to="/admin/users"
                  className={linkClasses}
                  onClick={() => setOpen(false)}
                >
                  <Shield size={20} />
                  <span>User Management</span>
                </NavLink>
              </div>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-800 p-4">
          <button
            onClick={() => logoutMut.mutate()}
            disabled={logoutMut.isPending}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-red-600/10 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut size={20} />
            <span>{logoutMut.isPending ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
