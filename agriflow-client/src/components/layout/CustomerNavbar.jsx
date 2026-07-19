import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, LogOut, User, ShoppingBag, Heart, ChevronDown, Menu, Phone, Tractor, ChevronRight } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useCart, useWishlist } from "@/hooks/useQueries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },

  { name: "Contact", path: "/contact" },
];

export default function CustomerNavbar({ onCartClick }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user, logout } = useCustomerAuth();
  const { data: cartData } = useCart(!!user);
  const { data: wishlistData } = useWishlist(!!user);
  const navigate = useNavigate();
  const cartCount = cartData?.cart?.items?.length || 0;
  const wishlistCount = wishlistData?.wishlist?.length || 0;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavClick = (e, link) => {
    if (link.protected && !user) {
      e.preventDefault();
      navigate("/customer/login");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-green-600 text-white text-xs">
        <div className="max-w-[1200px] mx-auto px-4 h-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              089896 96971
            </span>
            <span className="opacity-50">|</span>
            <span className="hidden sm:inline">Mon - Sat: 8:30 AM - 7:00 PM</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>Barnagar, MP</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-4">
          {/* Mobile Menu */}
          <button className="lg:hidden p-1" onClick={() => setMobileNavOpen(true)}>
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 gap-2 no-underline">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-600 ring-1 ring-green-500/20">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="text-base font-bold block text-gray-900">Ambika Krishi</span>
              <span className="text-[10px] font-medium text-green-600">Yantra</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto">
            {/* Wishlist - only when logged in */}
            {user && (
              <button
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-600 hover:text-green-600 transition-colors relative"
                onClick={() => navigate("/wishlist")}
              >
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Wishlist</span>
              </button>
            )}

            {/* Cart - only when logged in */}
            {user && (
              <button
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-600 hover:text-green-600 transition-colors relative"
                onClick={onCartClick}
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">Cart</span>
              </button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer outline-none">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-green-500/20">
                    {initials}
                  </div>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 leading-tight">{user.name}</span>
                    <span className="text-[10px] text-gray-500">My Account</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-xl border border-gray-100">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-orders")} className="cursor-pointer">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")} className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => navigate("/customer/login")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nav Bar */}
      <nav className="hidden lg:block border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-4">
          <ul className="flex items-center gap-8 h-11">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors no-underline relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-600 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileNavOpen(false)} />
      )}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 lg:hidden ${ mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={() => setMobileNavOpen(false)} className="p-1">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Mobile User Section */}
        {user && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={(e) => {
                    handleNavClick(e, link);
                    setMobileNavOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg no-underline"
                >
                  {link.name}
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                </Link>
              </li>
            ))}
            {user && (
              <>
                <li className="border-t border-gray-100 mt-2 pt-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg no-underline"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileNavOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}
