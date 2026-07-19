import { Link, useLocation } from "react-router-dom";
import { Home, Tag, ShoppingCart, User } from "lucide-react";

export default function MobileBottomNav({ cartCount = 0, user }) {
  const location = useLocation();
  const tabs = [
    { icon: Home, label: "Home", to: "/" },
    { icon: Tag, label: "Shop", to: "/shop" },
    { icon: ShoppingCart, label: "Cart", to: "/cart", badge: cartCount },
    { icon: User, label: user ? "Account" : "Login", to: user ? "/account" : "/login" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex items-center justify-around h-14 z-50 lg:hidden safe-area-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 no-underline transition-all ${isActive ? "text-green-600 -translate-y-0.5" : "text-gray-500"}`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-green-600 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
