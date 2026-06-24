import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Leaf,
  ShoppingCart,
  ArrowRight,
  LogOut,
  Menu,
} from "lucide-react";
import { selectCartCount } from "../../store/cartSlice";
import { useLogout } from "../../hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export default function StorefrontNavbar() {
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const user = useSelector((s) => s.auth.user);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  const logoutMut = useLogout();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/cart", label: "Cart" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-lg font-bold text-green-600">
              Ambika Krishi Yantra
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-green-600",
                  isActive(link.to)
                    ? "text-green-600 font-semibold"
                    : "text-gray-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={user?.role === "ADMIN" ? "/dashboard" : "/shop"}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  {user?.name?.split(" ")[0] || "Account"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => logoutMut.mutate()}
                  disabled={logoutMut.isPending}
                  title="Sign out"
                  className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetTitle className="text-lg font-bold text-green-600">
                  Ambika Krishi Yantra
                </SheetTitle>
                <div className="flex flex-col gap-4 mt-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-green-600",
                        isActive(link.to)
                          ? "text-green-600 font-semibold"
                          : "text-gray-600"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    to="/cart"
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Cart
                    {cartCount > 0 && (
                      <span className="bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <Link
                        to={user?.role === "ADMIN" ? "/dashboard" : "/shop"}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        {user?.name?.split(" ")[0] || "Account"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => logoutMut.mutate()}
                        disabled={logoutMut.isPending}
                        title="Sign out"
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/login"
                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-center"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors text-center"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
