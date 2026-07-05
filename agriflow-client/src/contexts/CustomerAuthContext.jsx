import { createContext, useContext, useState, useEffect } from "react";
import customerAuthService from "@/services/customer-auth.service";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await customerAuthService.getMe();
        if (res.success && res.customer) setUser(res.customer);
      } catch {} finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await customerAuthService.login(email, password);
    if (res.success) setUser(res.customer);
    return res;
  };

  const register = async (data) => {
    const res = await customerAuthService.register(data);
    if (res.success) setUser(res.customer);
    return res;
  };

  const logout = async () => {
    try { await customerAuthService.logout(); } catch {}
    setUser(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  return ctx;
}

export default CustomerAuthContext;
