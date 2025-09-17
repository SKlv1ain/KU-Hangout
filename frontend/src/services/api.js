import axios from "axios";

// สร้าง instance กลางของ axios เพื่อกำหนด baseURL/headers เหมือนกันทุกที่
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000/api",
  withCredentials: true, // ถ้า backend ใช้ cookie/session ให้เปิดไว้
});

// Interceptor ก่อนส่ง request ทุกครั้ง → แนบ Bearer token ให้โดยอัตโนมัติ
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
