import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, FolderTree, Tag, Package, ShoppingCart,
  FileText, CreditCard, Ticket, Image, BarChart3, Settings,
  LogOut, Sprout, PanelLeft, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navSections = [
  { label: "Overview", items: [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Catalog", items: [
    { to: "/admin/categories", label: "Categories", icon: FolderTree },
    { to: "/admin/brands", label: "Brands", icon: Tag },
    { to: "/admin/products", label: "Products", icon: Package },
  ]},
  { label: "Sales", items: [
    { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { to: "/admin/invoices", label: "Invoices", icon: FileText },
    { to: "/admin/payments", label: "Payments", icon: CreditCard },
    { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  ]},
  { label: "Content", items: [
    { to: "/admin/customers", label: "Customers", icon: Users },
    { to: "/admin/banners", label: "Banners", icon: Image },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ]},
];

function SidebarNav({ collapsed, onNavClick }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";
  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-400">
      {/* Logo + Workspace Selector */}
      <div className="flex h-16 items-center border-b border-slate-700/50 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 transition-colors text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                <Sprout className="h-5 w-5" />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-white block">AgriFlow</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">ERP System</span>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-56">
            <DropdownMenuItem className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-slate-900 text-xs font-bold shadow-sm">
                <Sprout className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-sm font-medium">AgriFlow ERP</p>
                <p className="text-xs text-muted-foreground">Main Workspace</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-4 px-3">
        <nav className="space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to;
                  const NavItem = (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onNavClick}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      )}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-white" />
                      )}
                      <item.icon className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-150",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      )} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                  if (collapsed) {
                    return (
                      <Tooltip key={item.to} delayDuration={0}>
                        <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }
                  return NavItem;
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t border-slate-700/50 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xs font-bold shadow-sm">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{user?.name || "Admin"}</p>
                <p className="text-[11px] text-slate-500">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ collapsed, onToggle }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <aside data-collapsed={collapsed} className="hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col border-r border-slate-200 transition-all duration-300 ease-in-out data-[collapsed=true]:w-[4.5rem] w-64">
        <SidebarNav collapsed={collapsed} />
      </aside>
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 h-10 w-10 bg-white shadow-md border border-slate-200 rounded-lg hover:bg-slate-50">
              <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-0">
            <SidebarNav collapsed={false} onNavClick={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
