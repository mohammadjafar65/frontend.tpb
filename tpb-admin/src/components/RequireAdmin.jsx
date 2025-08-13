import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null; // or a spinner

  // not logged in
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // logged in but not an admin
  if (user.role !== "admin") {
    return <Navigate to="/no-access" replace />;
  }

  return children;
}
