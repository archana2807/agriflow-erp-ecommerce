import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import store from "@/store";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CustomerAuthProvider, useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { AdminProtectedRoute, CustomerProtectedRoute, GuestRoute, CustomerGuestRoute } from "@/middleware/ProtectedRoute";

import AdminLayout from "@/components/layout/AdminLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";

import AdminLogin from "@/pages/auth/AdminLogin";
import CustomerLogin from "@/pages/auth/CustomerLogin";
import CustomerRegister from "@/pages/auth/CustomerRegister";

import Dashboard from "@/pages/admin/Dashboard";
import AdminCustomers from "@/pages/admin/Customers";
import AdminCategories from "@/pages/admin/Categories";
import AdminBrands from "@/pages/admin/Brands";
import AdminProducts from "@/pages/admin/Products";
import AdminOrders from "@/pages/admin/Orders";
import AdminInvoices from "@/pages/admin/Invoices";
import AdminPayments from "@/pages/admin/Payments";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminBanners from "@/pages/admin/Banners";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";

import Home from "@/pages/customer/Home";
import Shop from "@/pages/customer/Shop";
import ProductDetails from "@/pages/customer/ProductDetails";
import Cart from "@/pages/customer/Cart";
import Checkout from "@/pages/customer/Checkout";
import MyOrders from "@/pages/customer/MyOrders";
import Wishlist from "@/pages/customer/Wishlist";
import Profile from "@/pages/customer/Profile";
import Contact from "@/pages/customer/Contact";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function AuthLoader({ children }) {
  const { loading: adminLoading } = useAuth();
  const { loading: customerLoading } = useCustomerAuth();

  if (adminLoading || customerLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" richColors />
          <AuthProvider>
            <CustomerAuthProvider>
              <AuthLoader>
                <Routes>
                <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />
                <Route path="/customer/login" element={<CustomerGuestRoute><CustomerLogin /></CustomerGuestRoute>} />
                <Route path="/register" element={<CustomerGuestRoute><CustomerRegister /></CustomerGuestRoute>} />

                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="shop/:slug" element={<ProductDetails />} />
                  <Route element={<CustomerProtectedRoute />}>
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="my-orders" element={<MyOrders />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="contact" element={<Contact />} />
                  </Route>
                </Route>

                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="invoices" element={<AdminInvoices />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="banners" element={<AdminBanners />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AuthLoader>
            </CustomerAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
