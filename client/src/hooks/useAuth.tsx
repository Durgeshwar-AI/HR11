/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  userType: "candidate" | "hr" | null;
  login: (token: string, user: User, type: "candidate" | "hr") => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const NO_AUTH_MODE = import.meta.env.VITE_DISABLE_AUTH !== "false";
const LOCAL_TEST_USER: User = {
  id: "local-user",
  name: "Local Tester",
  email: "local@test.dev",
  role: "admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) return storedToken;
    return NO_AUTH_MODE ? "local-dev-token" : null;
  });
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    if (stored) return JSON.parse(stored);
    return NO_AUTH_MODE ? LOCAL_TEST_USER : null;
  });
  const [userType, setUserType] = useState<"candidate" | "hr" | null>(() => {
    const storedType = localStorage.getItem("userType") as
      | "candidate"
      | "hr"
      | null;
    if (storedType) return storedType;
    return NO_AUTH_MODE ? "hr" : null;
  });

  const login = (token: string, user: User, type: "candidate" | "hr") => {
    setToken(token);
    setUser(user);
    setUserType(type);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", type);
  };

  const logout = () => {
    if (NO_AUTH_MODE) {
      setToken("local-dev-token");
      setUser(LOCAL_TEST_USER);
      setUserType("hr");
      localStorage.setItem("token", "local-dev-token");
      localStorage.setItem("user", JSON.stringify(LOCAL_TEST_USER));
      localStorage.setItem("userType", "hr");
      return;
    }

    setToken(null);
    setUser(null);
    setUserType(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user || (NO_AUTH_MODE ? LOCAL_TEST_USER : null),
        userType,
        login,
        logout,
        isAuthenticated: NO_AUTH_MODE ? true : !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
