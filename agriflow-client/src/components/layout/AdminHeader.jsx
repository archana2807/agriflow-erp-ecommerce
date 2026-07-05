import { Bell, Search, ChevronDown, LogOut, User, Settings, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function AdminHeader({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";

  const handleLogout = async () => { await logout(); navigate("/admin/login"); };
  const handleSearchFocus = () => { setSearchFocused(true); };
  const handleSearchBlur = () => { setSearchFocused(false); };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100" onClick={onToggleSidebar}>
        <PanelLeft className="h-4 w-4" />
      </Button>

      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={searchRef}
          placeholder="Search..."
          className="h-9 pl-9 bg-slate-100/80 border-0 rounded-lg text-sm focus-visible:ring-2 focus-visible:ring-slate-400/20 placeholder:text-slate-400"
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 h-auto hover:bg-slate-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
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
            <DropdownMenuItem className="gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer">
              <User className="h-4 w-4 text-slate-500" /> My Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2.5 rounded-lg px-3 py-2.5 text-sm cursor-pointer">
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
