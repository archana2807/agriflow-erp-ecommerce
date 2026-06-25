import { createContext, useContext, useState, useEffect, useCallback } from "react";
import customerAuthService from "@/services/customer-auth.service";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await customerAuthService.getProfile();
      if (res.success && res.customer) {
        setUser(res.customer);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
  }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await customerAuthService.login(email, password);
    if (res.success) {
      setUser(res.customer);
    }
    return res;
  };

  const register = async (data) => {
    const res = await customerAuthService.register(data);
    if (res.success) {
      setUser(res.customer);
    }
    return res;
  };

  const logout = async () => {
    try {
      await customerAuthService.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, login, register, logout }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}

export default CustomerAuthContext;
