import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to correct dashboard
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/seeker" replace />;
  }
  return children;
}