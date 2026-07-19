import { lazy, Suspense } from "react";
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

const AdminLogin = lazy(() => import("@/pages/auth/AdminLogin"));
const CustomerLogin = lazy(() => import("@/pages/auth/CustomerLogin"));
const CustomerRegister = lazy(() => import("@/pages/auth/CustomerRegister"));

const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));
const AdminCategories = lazy(() => import("@/pages/admin/Categories"));
const AdminBrands = lazy(() => import("@/pages/admin/Brands"));
const AdminProducts = lazy(() => import("@/pages/admin/Products"));
const AdminOrders = lazy(() => import("@/pages/admin/Orders"));
const AdminInvoices = lazy(() => import("@/pages/admin/Invoices"));
const AdminPayments = lazy(() => import("@/pages/admin/Payments"));
const AdminCoupons = lazy(() => import("@/pages/admin/Coupons"));
const AdminBanners = lazy(() => import("@/pages/admin/Banners"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const Test = lazy(() => import("@/pages/Test"));
const Home = lazy(() => import("@/pages/customer/Home"));
const Shop = lazy(() => import("@/pages/customer/Shop"));
const ProductDetails = lazy(() => import("@/pages/customer/ProductDetails"));
const Cart = lazy(() => import("@/pages/customer/Cart"));
const Checkout = lazy(() => import("@/pages/customer/Checkout"));
const MyOrders = lazy(() => import("@/pages/customer/MyOrders"));
const Wishlist = lazy(() => import("@/pages/customer/Wishlist"));
const Profile = lazy(() => import("@/pages/customer/Profile"));
const Contact = lazy(() => import("@/pages/customer/Contact"));

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
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-screen">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/test" element={<Test />} />
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
                </Suspense>
              </AuthLoader>
            </CustomerAuthProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
