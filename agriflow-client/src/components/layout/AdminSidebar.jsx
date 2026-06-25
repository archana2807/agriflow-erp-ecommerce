import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Tag,
  Package,
  ShoppingCart,
  FileText,
  CreditCard,
  Ticket,
  Image,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Sprout,
  ChevronLeft,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/brands", label: "Brands", icon: Tag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/invoices", label: "Invoices", icon: FileText },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const sections = [
  { label: "OVERVIEW", items: [navItems[0]] },
  { label: "CATALOG", items: [navItems[2], navItems[3], navItems[4]] },
  { label: "SALES", items: [navItems[5], navItems[6], navItems[7], navItems[8]] },
  { label: "CONTENT", items: [navItems[1], navItems[9], navItems[10], navItems[11]] },
];

function SidebarContent({ onNavClick, collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className={`erp-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="erp-sidebar-logo">
        <div className="logo-icon">
          <Sprout className="h-6 w-6" />
        </div>
        {!collapsed && <span className="logo-text">AgriFlow ERP</span>}
        <button className="collapse-btn" onClick={onToggle}>
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="erp-sidebar-nav">
        {sections.map((section, si) => (
          <div key={si} className="nav-section">
            {!collapsed && <span className="nav-section-label">{section.label}</span>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavClick}
                className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="nav-icon" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="erp-sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout" title={collapsed ? "Logout" : undefined}>
          <LogOut className="nav-icon" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ collapsed, onToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block">
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 bg-white shadow-md rounded-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent onNavClick={() => setOpen(false)} collapsed={false} onToggle={() => {}} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
