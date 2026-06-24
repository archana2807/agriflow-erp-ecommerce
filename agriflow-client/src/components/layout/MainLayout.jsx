import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <main className="ml-64 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
