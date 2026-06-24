import { useSelector } from "react-redux";
import { Bell } from "lucide-react";

export default function Navbar() {
  const { user } = useSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Ambika Krishi Yantra</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Bell size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0)}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
      </div>
    </header>
  );
}
