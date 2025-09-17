import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login.jsx";
import Register from "@/pages/Auth/Register.jsx";
import Home from "@/pages/Plans/Home.jsx";
import UserProfile from "@/pages/Profile/UserProfile.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* path หลัก: ต้องล็อกอินก่อนถึงเข้า Home ได้ */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

      {/* หน้า Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* หน้า Profile */}
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

      {/* ถ้าเส้นทางไม่ตรงกับอะไรก็โยนกลับ Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
