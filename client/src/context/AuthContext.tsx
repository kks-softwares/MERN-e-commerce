import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api } from "../lib/api";
import type { AuthUser } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ecommerce-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(storedUser) as AuthUser);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = (nextUser: AuthUser | null) => {
    setUser(nextUser);

    if (nextUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = async (payload: { email: string; password: string }) => {
    const response = await api.login(payload);
    persistUser(response.data);
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const response = await api.register(payload);
    persistUser(response.data);
  };

  const logout = () => {
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
