import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCart, useShopCategories } from "@/hooks/useQueries";

const categoryIcons = {
  "tractor-parts": "fa-solid fa-wrench",
  "thresher": "fa-solid fa-tractor",
  "trali-trolley": "fa-solid fa-truck",
  "shield-panja": "fa-solid fa-shield-halved",
  "cultivator": "fa-solid fa-gear",
  "plough": "fa-solid fa-hammer",
  "sprayer": "fa-solid fa-spray-can",
  "irrigation": "fa-solid fa-droplet",
};
const fallbackIcon = "fa-solid fa-box";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "My Orders", path: "/my-orders" },
  { name: "Contact", path: "/#contact" },
];

export default function CustomerNavbar({ onCartClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isAuthenticated } = useCustomerAuth();
  const { data: cartData } = useCart();
  const { data: catRes } = useShopCategories();
  const categories = catRes?.categories || [];
  const navigate = useNavigate();
  const cartCount = cartData?.cart?.items?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <header className="em-header">
      {/* Top Bar */}
      <div className="em-top-bar">
        <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <i className="fa-solid fa-phone" style={{ fontSize: "9px" }}></i>
              089896 96971
            </span>
            <span className="opacity-50">|</span>
            <span className="hidden sm:inline">Mon - Sat: 8:30 AM - 7:00 PM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline">Barnagar, MP</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4">
          <button className="em-hamburger" onClick={() => setMobileNavOpen(true)}>
            <span></span><span></span><span></span>
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 gap-2 no-underline">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--em-green)" }}>
              <i className="fa-solid fa-tractor text-white text-lg"></i>
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-base font-bold block" style={{ color: "#333" }}>Ambika Krishi</span>
              <span className="text-[10px] font-medium" style={{ color: "var(--em-green)" }}>Yantra</span>
            </div>
          </Link>

          {/* Category Dropdown */}
          <div className="em-cat-dropdown hidden lg:block">
            <button className="em-cat-trigger">
              <i className="fa-solid fa-bars" style={{ fontSize: "14px" }}></i>
              Categories
              <i className="fa-solid fa-chevron-down" style={{ fontSize: "10px" }}></i>
            </button>
            <div className="em-cat-menu">
              {categories.map((cat) => (
                <Link key={cat._id} to={`/shop?category=${cat.slug}`}>
                  <i className={categoryIcons[cat.slug] || fallbackIcon}></i>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 justify-center hidden md:flex">
            <form onSubmit={handleSearch} className="em-search" style={{ maxWidth: "480px" }}>
              <input
                type="text"
                placeholder="Search for machinery, parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="em-right-links">
            <button className="em-action-btn" onClick={() => navigate(isAuthenticated ? "/profile" : "/customer/login")}>
              <i className="fa-regular fa-user"></i>
              <span className="hidden lg:inline">{isAuthenticated ? "Account" : "Login"}</span>
            </button>
            <div className="em-divider"></div>
            <button className="em-action-btn" onClick={() => navigate("/wishlist")}>
              <i className="fa-regular fa-heart"></i>
              <span className="hidden lg:inline">Wishlist</span>
            </button>
            <div className="em-divider"></div>
            <button className="em-action-btn relative" onClick={onCartClick}>
              <div className="relative">
                <i className="fa-solid fa-bag-shopping"></i>
                {cartCount > 0 && <span className="em-badge">{cartCount}</span>}
              </div>
              <span className="hidden lg:inline">Cart</span>
            </button>
          </div>

          {/* Mobile Icons */}
          <div className="em-mobile-icons">
            <button className="p-1.5" onClick={() => navigate(isAuthenticated ? "/profile" : "/customer/login")}>
              <i className="fa-regular fa-user text-gray-600"></i>
            </button>
            <button className="relative p-1.5" onClick={onCartClick}>
              <i className="fa-solid fa-bag-shopping text-gray-600"></i>
              {cartCount > 0 && <span className="em-badge">{cartCount}</span>}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="px-4 pb-3 md:hidden">
          <div className="em-search">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button type="submit"><Search className="h-4 w-4" /></button>
          </div>
        </form>
      </div>

      {/* Nav Bar */}
      <nav className="em-nav-bar hidden md:block">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="em-nav-items">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileNavOpen && <div className="em-overlay" onClick={() => setMobileNavOpen(false)} />}
      <div className={`em-drawer ${mobileNavOpen ? "show" : ""}`}>
        <div className="em-drawer-header">
          <span className="font-semibold">Menu</span>
          <button onClick={() => setMobileNavOpen(false)} className="bg-transparent border-none cursor-pointer">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        <div className="em-drawer-menu">
          <ul>
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link to={link.path} onClick={() => setMobileNavOpen(false)}>
                  {link.name} <i className="fa-solid fa-chevron-right text-xs text-gray-300"></i>
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ padding: "8px 0" }}>
            <div style={{ padding: "4px 16px 8px", fontSize: "11px", fontWeight: "600", color: "#999", textTransform: "uppercase" }}>Categories</div>
            {categories.map((cat) => (
              <Link key={cat._id} to={`/shop?category=${cat.slug}`} onClick={() => setMobileNavOpen(false)} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", color: "#555", fontSize: "13px", borderBottom: "1px solid #f5f5f5" }}>
                <i className={categoryIcons[cat.slug] || fallbackIcon} style={{ width: "16px", color: "var(--em-green)", textAlign: "center" }}></i>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
