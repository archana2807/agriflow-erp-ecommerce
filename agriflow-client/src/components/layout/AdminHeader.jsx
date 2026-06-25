import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="erp-header">
      <div className="erp-header-left">
        <h2 className="erp-header-title">AgriFlow ERP</h2>
      </div>
      <div className="erp-header-right">
        <button className="header-icon-btn">
          <Bell className="h-5 w-5" />
          <span className="notification-dot"></span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="user-menu-trigger">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || "Admin"}</span>
              <span className="user-role">Administrator</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
