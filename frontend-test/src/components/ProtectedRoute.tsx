import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getStoredUser } from "../services/api";

interface Props {
  children: React.ReactNode;
  /** Which user role is allowed. Defaults to "candidate". */
  role?: "candidate" | "hr";
}

/**
 * Wraps a route so only authenticated users of the given role can access it.
 * Redirects to the correct login page if not authenticated.
 */
export function ProtectedRoute({ children, role = "candidate" }: Props) {
  const location = useLocation();

  if (!isLoggedIn()) {
    const loginPath =
      role === "hr" ? "/company-login" : "/candidate-login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Optional: verify role from stored user
  const user = getStoredUser();
  const userRole = typeof user?.role === "string" ? user.role : "";

  if (role === "hr" && userRole !== "admin" && userRole !== "viewer" && userRole !== "hr") {
    return <Navigate to="/company-login" replace />;
  }

  if (role === "candidate" && userRole === "hr") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
