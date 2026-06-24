import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./store/store";
import MainLayout from "./components/layout/MainLayout";
import { ProtectedRoute, RoleRoute, AdminRoute, GuestRoute } from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/customers/Customers";
import Products from "./pages/products/Products";
import Orders from "./pages/orders/Orders";
import Invoices from "./pages/invoices/Invoices";
import Payments from "./pages/payments/Payments";
import Landing from "./pages/Landing";
import Contact from "./pages/Contact";
import Shop from "./pages/shop/Shop";
import Cart from "./pages/shop/Cart";
import Checkout from "./pages/shop/Checkout";
import OrderSuccess from "./pages/shop/OrderSuccess";
import UserManagement from "./pages/admin/UserManagement";
import "./index.css";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={qc}>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/contact" element={<Contact />} />

            {/* Guest Only Routes */}
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            {/* Protected Routes - Any Role */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />

            {/* ERP Protected Routes - ADMIN, SALES, ACCOUNTANT */}
            <Route element={<ProtectedRoute><RoleRoute roles={["ADMIN", "SALES", "ACCOUNTANT"]}><MainLayout /></RoleRoute></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={
                <RoleRoute roles={["ADMIN", "SALES"]}><Customers /></RoleRoute>
              } />
              <Route path="/erp/products" element={
                <RoleRoute roles={["ADMIN", "SALES", "ACCOUNTANT"]}><Products /></RoleRoute>
              } />
              <Route path="/orders" element={
                <RoleRoute roles={["ADMIN", "SALES"]}><Orders /></RoleRoute>
              } />
              <Route path="/invoices" element={
                <RoleRoute roles={["ADMIN", "ACCOUNTANT"]}><Invoices /></RoleRoute>
              } />
              <Route path="/payments" element={
                <RoleRoute roles={["ADMIN", "ACCOUNTANT"]}><Payments /></RoleRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="/admin/users" element={
                <AdminRoute><UserManagement /></AdminRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
