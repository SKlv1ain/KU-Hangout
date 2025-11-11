import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ให้ใช้เส้นทางแบบ SPA
import { AuthProvider } from "@/context/AuthContext"; // ครอบทั้งแอปด้วย Auth
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.jsx";
import "./styles/index.css"; // global theme (green-white)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    {/* BrowserRouter ครอบไว้ → ใช้ <Routes> <Route> ได้ */}
    <BrowserRouter>
      {/* AuthProvider ครอบอีกชั้น → ทุกหน้ามีสิทธิ์เข้าถึง user/login/logout */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);
