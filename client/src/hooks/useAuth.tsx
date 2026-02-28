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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [userType, setUserType] = useState<"candidate" | "hr" | null>(() =>
    localStorage.getItem("userType") as "candidate" | "hr" | null
  );

  const login = (token: string, user: User, type: "candidate" | "hr") => {
    setToken(token);
    setUser(user);
    setUserType(type);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", type);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserType(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, userType, login, logout, isAuthenticated: !!token }}
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
