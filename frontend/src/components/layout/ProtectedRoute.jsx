import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  adminOnly = false 
}) {
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user); // القراءة من Redux state
  const location = useLocation();

  // إذا مش مسجل -> اذهب إلى login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // إذا طلبنا دور محدد والمستخدم مش موجود أو الدور مش متطابق
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // إذا الصفحة للادمن فقط والمستخدم مش ادمن
  if (adminOnly && (!user || user.role !== 'admin')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}