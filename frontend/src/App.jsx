import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login.jsx";
import Register from "@/pages/Auth/Register.jsx";
import Home from "@/pages/Plans/Home.jsx";

export default function App() {
  return (
    <Routes>
      {/* path หลัก ไปหน้า Home */}
      <Route path="/" element={<Home />} />

      {/* หน้า Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ถ้าเส้นทางไม่ตรงกับอะไรก็โยนกลับ Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
