import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("gm_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("gm_token"));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
          localStorage.setItem("gm_user", JSON.stringify(me));
        } catch {
          // If token invalid, clear
          setUser(null);
          setToken(null);
          localStorage.removeItem("gm_token");
          localStorage.removeItem("gm_user");
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("gm_token", data.access_token);
    localStorage.setItem("gm_user", JSON.stringify(data.user));
  };

  const demoLogin = async () => {
    await login("demo@greenmetrix.ai", "greenmetrix2026");
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.register({ name, email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("gm_token", data.access_token);
    localStorage.setItem("gm_user", JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gm_token");
    localStorage.removeItem("gm_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        demoLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
