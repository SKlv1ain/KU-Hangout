import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchMe, loginUser, registerUser, logoutUser } from "../services/authService.js";

// สร้าง Context เปล่าไว้ให้ Provider เติมค่า
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // เก็บสถานะผู้ใช้/บทบาท และ state โหลดตอนเริ่ม
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'user' | 'admin'
  const [loading, setLoading] = useState(true);

  // ตอนแอปโหลดครั้งแรก → ถ้ามี token อยู่ ลองเรียก /users/me เพื่อดึงข้อมูลเข้า state
  useEffect(() => {
    const token = localStorage.getItem("kh_token");
    if (!token) { setLoading(false); return; }
    fetchMe()
      .then((res) => {
        // บาง backend ส่ง { user: {...} } หรือส่ง {...} ตรงๆ เลยรองรับทั้งสองแบบ
        const u = res.user || res;
        setUser(u);
        setRole(u?.role ?? "user");
      })
      .finally(() => setLoading(false));
  }, []);

  // ฟังก์ชันล็อกอิน: ยิง API → เก็บ token → อัปเดต user/role ใน state
  const login = useCallback(async (username, password) => {
    const data = await loginUser({ username, password });
    if (data?.token) localStorage.setItem("kh_token", data.token);
    const u = data?.user ?? null;
    setUser(u);
    setRole(u?.role ?? "user");
    return u;
  }, []);

  // ฟังก์ชันสมัครสมาชิก: ส่งทุกฟิลด์ที่ backend ต้องการ
  const register = useCallback(async ({ username, email, password, password_confirm, contact }) => {
    const data = await registerUser({ username, email, password, password_confirm, contact });
    if (data?.token) localStorage.setItem("kh_token", data.token);
    const u = data?.user ?? null;
    setUser(u);
    setRole(u?.role ?? "user");
    return u;
  }, []);

  // ฟังก์ชันออกจากระบบ: เคลียร์ฝั่ง server (ถ้ามี) + ล้าง state/ token
  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setRole(null);
  }, []);

  const isAdmin = role === "admin";

  // ให้ทุกหน้าที่อยู่ใต้ AuthProvider ใช้ค่าเหล่านี้ได้ผ่าน useAuth()
  return (
    <AuthContext.Provider value={{ user, role, isAdmin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook สั้นๆ สำหรับเรียกใช้ค่าใน AuthContext
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
