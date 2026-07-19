import { Bell, Search, ChevronDown, LogOut, User, Settings, PanelLeft, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors" onClick={onToggleSidebar}>
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="relative flex-1 max-w-sm hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search products, orders, customers..."
          className="h-9 pl-9 bg-slate-50 border-slate-200 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 placeholder:text-slate-400 transition-all"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 h-auto hover:bg-slate-100 transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-[13px] font-semibold text-slate-900">{user?.name || "Admin"}</span>
                <span className="text-[11px] text-slate-500">{user?.email || "admin@agriflow.com"}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border border-slate-200 shadow-xl p-1.5">
            <DropdownMenuItem className="gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:bg-slate-50">
              <User className="h-4 w-4 text-slate-500" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:bg-slate-50">
              <Settings className="h-4 w-4 text-slate-500" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 my-1" />
            <DropdownMenuItem onClick={handleLogout} className="gap-2.5 rounded-lg px-3 py-2.5 text-sm text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
              <LogOut className="h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
