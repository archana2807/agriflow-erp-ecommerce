import { Link, useLocation } from "react-router-dom";

export default function MobileBottomNav({ cartCount = 0, user }) {
  const location = useLocation();
  const tabs = [
    { icon: "fa-home", label: "Home", to: "/" },
    { icon: "fa-tag", label: "Shop", to: "/shop" },
    { icon: "fa-shopping-cart", label: "Cart", to: "/cart", badge: cartCount },
    { icon: "fa-user", label: user ? "Account" : "Login", to: user ? "/account" : "/login" },
  ];

  return (
    <nav className="em-mobile-nav">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <Link key={tab.to} to={tab.to} className={`em-mobile-nav-item ${isActive ? "active" : ""}`}>
            <div className="relative">
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.badge > 0 && <span className="em-cart-badge">{tab.badge}</span>}
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
