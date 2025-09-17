import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ให้ใช้เส้นทางแบบ SPA
import { AuthProvider } from "@/context/AuthContext"; // ครอบทั้งแอปด้วย Auth
import App from "./App.jsx";
import "./index.css"; // Base styles
import "./styles/index.css"; // Custom styles
// Utility classes loaded only when needed

ReactDOM.createRoot(document.getElementById("root")).render(
  // BrowserRouter ครอบไว้ → ใช้ <Routes> <Route> ได้
  <BrowserRouter>
    {/* AuthProvider ครอบอีกชั้น → ทุกหน้ามีสิทธิ์เข้าถึง user/login/logout */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
