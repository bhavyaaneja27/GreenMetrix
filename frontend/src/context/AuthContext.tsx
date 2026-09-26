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
          const savedUser = localStorage.getItem("gm_user");
          const parsed = savedUser ? JSON.parse(savedUser) : null;
          const isDemo = parsed?.is_demo ?? (me.email.toLowerCase() === "demo@greenmetrix.ai");
          const userObj: User = {
            ...me,
            name: parsed?.name || me.name,
            is_demo: isDemo,
          };
          setUser(userObj);
          localStorage.setItem("gm_user", JSON.stringify(userObj));
        } catch {
          // If token invalid, keep local user object if saved
          const savedUser = localStorage.getItem("gm_user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser(null);
            setToken(null);
            localStorage.removeItem("gm_token");
            localStorage.removeItem("gm_user");
          }
        }
      }
      setIsLoading(false);
    }
    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const lowerEmail = email.trim().toLowerCase();
    const isDemo = lowerEmail === "demo@greenmetrix.ai";

    const registeredUsersStr = localStorage.getItem("gm_registered_users");
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};

    try {
      const data = await api.login({ email, password });
      const savedUser = registeredUsers[lowerEmail];
      const userObj: User = {
        ...data.user,
        name: savedUser?.name || data.user.name,
        is_demo: isDemo,
      };
      setToken(data.access_token);
      setUser(userObj);
      localStorage.setItem("gm_token", data.access_token);
      localStorage.setItem("gm_user", JSON.stringify(userObj));
    } catch (err: any) {
      // Local authentication for registered / new users
      let userObj: User;
      if (registeredUsers[lowerEmail]) {
        userObj = registeredUsers[lowerEmail];
      } else {
        const defaultName = isDemo
          ? "GreenMetriX Demo Admin"
          : lowerEmail.split("@")[0].replace(".", " ").replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
        userObj = {
          id: Date.now(),
          name: defaultName,
          email: lowerEmail,
          role: "Sustainability Administrator",
          is_active: true,
          is_demo: isDemo,
        };
        registeredUsers[lowerEmail] = userObj;
        localStorage.setItem("gm_registered_users", JSON.stringify(registeredUsers));
      }

      const mockToken = "mock_jwt_token_" + Date.now();
      setToken(mockToken);
      setUser(userObj);
      localStorage.setItem("gm_token", mockToken);
      localStorage.setItem("gm_user", JSON.stringify(userObj));
    }
  };

  const demoLogin = async () => {
    await login("demo@greenmetrix.ai", "greenmetrix2026");
  };

  const register = async (name: string, email: string, password: string) => {
    const lowerEmail = email.trim().toLowerCase();
    const isDemo = lowerEmail === "demo@greenmetrix.ai";
    const userObj: User = {
      id: Date.now(),
      name: name.trim(),
      email: lowerEmail,
      role: "Sustainability Administrator",
      is_active: true,
      is_demo: isDemo,
    };

    // Persist new user account in accounts registry
    const registeredUsersStr = localStorage.getItem("gm_registered_users");
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
    registeredUsers[lowerEmail] = userObj;
    localStorage.setItem("gm_registered_users", JSON.stringify(registeredUsers));

    try {
      const data = await api.register({ name, email, password });
      const serverUserObj: User = { ...data.user, name: name.trim(), is_demo: isDemo };
      setToken(data.access_token);
      setUser(serverUserObj);
      localStorage.setItem("gm_token", data.access_token);
      localStorage.setItem("gm_user", JSON.stringify(serverUserObj));
    } catch (err: any) {
      // Local registration completion
      const mockToken = "mock_jwt_token_" + Date.now();
      setToken(mockToken);
      setUser(userObj);
      localStorage.setItem("gm_token", mockToken);
      localStorage.setItem("gm_user", JSON.stringify(userObj));
    }
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
