import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles, allowedStatuses = ["Active"] }) {
  const { currentUser, userRole, userData } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to correct dashboard
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/seeker" replace />;
  }

  const status = userData?.status || "Active";
  if (!allowedStatuses.includes(status)) {
    if (status === "Pending") return <Navigate to="/pending" replace />;
    if (userRole === "admin") return <Navigate to="/admin" replace />;
    if (userRole === "recruiter") return <Navigate to="/recruiter" replace />;
    return <Navigate to="/seeker" replace />;
  }

  return children;
}