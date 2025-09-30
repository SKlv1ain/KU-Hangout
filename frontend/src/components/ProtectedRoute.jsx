import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ใช้ครอบหน้า/เพจที่ต้องการการยืนยันตัวตนหรือ admin-only
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;                 // อาจใส่ spinner ตรงนี้
  if (!user) return <Navigate to="/login" replace />; // ไม่ล็อกอิน → ส่งไปหน้า login
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />; // ไม่ใช่ admin ก็กันเข้า

  return children;
}
