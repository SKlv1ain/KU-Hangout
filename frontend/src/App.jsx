import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Auth/Login.jsx";
import Register from "@/pages/Auth/Register.jsx";
import Homepage from "@/pages/Homepage.jsx";
import Home from "@/pages/Plans/Home.jsx";
import ProtectedRoute from "@/components/ProtectedRoute.jsx";
import CustomNavbar from "@/components/Navbar.jsx";

export default function App() {
  return (
    <>
      <CustomNavbar />
      <Routes>
        {/* หน้าแรก - หน้าเปล่า ไม่ต้องล็อกอิน */}
        <Route path="/" element={<Homepage />} />

        {/* หน้า Home - ต้องล็อกอินก่อน */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        {/* หน้า Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ถ้าเส้นทางไม่ตรงกับอะไรก็โยนกลับหน้าแรก */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
