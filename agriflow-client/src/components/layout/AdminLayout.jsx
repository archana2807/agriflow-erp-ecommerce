import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        data-collapsed={collapsed}
        className="flex flex-1 flex-col overflow-hidden transition-all duration-200 ml-64 data-[collapsed=true]:ml-[4.5rem] max-lg:ml-0"
      >
        <AdminHeader onToggleSidebar={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
