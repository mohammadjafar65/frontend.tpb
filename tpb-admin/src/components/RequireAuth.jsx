import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function RequireAuth({ children }) {
  const { isAuthed, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null; // or a loader
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}