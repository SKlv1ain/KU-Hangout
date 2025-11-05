import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "react-bootstrap";

// ใช้ครอบหน้า/เพจที่ต้องการการยืนยันตัวตนหรือ admin-only
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAdmin } = useAuth();

  // แสดง loading spinner ขณะตรวจสอบ authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="success" size="lg" />
          <div className="mt-3 text-muted">Loading...</div>
        </div>
      </div>
    );
  }

  // ไม่ล็อกอิน → ส่งไปหน้า login
  if (!user) return <Navigate to="/login" replace />;
  
  // ไม่ใช่ admin แต่ต้องการ admin → ส่งไปหน้า home
  if (requireAdmin && !isAdmin) return <Navigate to="/home" replace />;

  return children;
}
