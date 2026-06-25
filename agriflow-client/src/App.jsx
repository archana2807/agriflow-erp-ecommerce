import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <CustomerAuthProvider>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/register" element={<CustomerRegister />} />

              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="product/:slug" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="my-orders" element={<MyOrders />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="profile" element={<Profile />} />
              </Route>

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

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CustomerAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
