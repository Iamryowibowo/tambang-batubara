import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  // Ambil role user dari localStorage
  const userRole = localStorage.getItem("userRole");

  // Jika belum login, tendang ke halaman login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // Jika role tidak diizinkan mengakses halaman ini, kembalikan ke dashboard utama
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Jika lolos, render halaman yang dituju
  return children;
}
