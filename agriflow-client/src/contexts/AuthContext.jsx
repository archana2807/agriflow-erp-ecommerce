import { createContext, useContext, useState, useEffect } from "react";
import authService from "@/services/auth.service";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await authService.getMe();
        if (res.success && res.user) setUser(res.user);
      } catch {} finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) setUser(res.user);
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res.success) setUser(res.user);
    return res;
  };

  const logout = async () => {
    try { await authService.logout(); } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
