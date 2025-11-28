import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user) {
    const roleHierarchy: { [key: string]: number } = {
      admin: 100,
      hr_manager: 50,
      hr_user: 25,
      recruiter: 25,
      interviewer: 10,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    if (userLevel < requiredLevel) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            padding: "2rem",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "1rem" }}>
            Access Denied
          </h2>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
