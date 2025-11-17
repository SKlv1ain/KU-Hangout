import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { fetchMe, loginUser, registerUser, logoutUser } from "../services/authService";

// User type based on backend UserPublicSerializer
export interface User {
  id: number;
  username: string;
  display_name?: string;
  role: string;
  avg_rating?: number;
  review_count?: number;
  contact?: string;
  profile_picture?: string;
  bio?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    contact?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

// สร้าง Context เปล่าไว้ให้ Provider เติมค่า
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // เก็บสถานะผู้ใช้/บทบาท และ state โหลดตอนเริ่ม
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // 'user' | 'admin'
  const [loading, setLoading] = useState(true);

  // ตอนแอปโหลดครั้งแรก → ถ้ามี token อยู่ ลองเรียก /users/me เพื่อดึงข้อมูลเข้า state
  useEffect(() => {
    const token = localStorage.getItem("kh_token");
    if (!token) { 
      setLoading(false); 
      return; 
    }
    
    fetchMe()
      .then((res) => {
        // บาง backend ส่ง { user: {...} } หรือส่ง {...} ตรงๆ เลยรองรับทั้งสองแบบ
        const u = (res as any).user || res;
        setUser(u as User);
        setRole((u as User)?.role ?? "user");
      })
      .catch((error) => {
        // If token is invalid or expired, clear it
        console.error('Failed to fetch user:', error);
        localStorage.removeItem("kh_token");
        setUser(null);
        setRole(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ฟังก์ชันล็อกอิน: ยิง API → เก็บ token → อัปเดต user/role ใน state
  const login = useCallback(async (username: string, password: string): Promise<User> => {
    const data = await loginUser({ username, password });
    if (data?.token) localStorage.setItem("kh_token", data.token);
    const u = (data as any)?.user ?? null;
    setUser(u as User);
    setRole((u as User)?.role ?? "user");
    return u as User;
  }, []);

  // ฟังก์ชันสมัครสมาชิก: ส่งทุกฟิลด์ที่ backend ต้องการ
  const register = useCallback(async ({
    username,
    email,
    password,
    password_confirm,
    contact
  }: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    contact?: string;
  }): Promise<User> => {
    const data = await registerUser({ username, email, password, password_confirm, contact });
    if (data?.token) localStorage.setItem("kh_token", data.token);
    const u = (data as any)?.user ?? null;
    setUser(u as User);
    setRole((u as User)?.role ?? "user");
    return u as User;
  }, []);

  // ฟังก์ชันออกจากระบบ: เคลียร์ฝั่ง server (ถ้ามี) + ล้าง state/ token
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }
    // Always clear local state and token
    setUser(null);
    setRole(null);
    localStorage.removeItem("kh_token");
  }, []);

  // ฟังก์ชันรีเฟรชข้อมูลผู้ใช้: ดึงข้อมูลล่าสุดจาก API
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchMe();
      const u = (res as any).user || res;
      setUser(u as User);
      setRole((u as User)?.role ?? "user");
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  const isAdmin = role === "admin";

  // ให้ทุกหน้าที่อยู่ใต้ AuthProvider ใช้ค่าเหล่านี้ได้ผ่าน useAuth()
  return (
    <AuthContext.Provider value={{ user, role, isAdmin, login, register, logout, refreshUser, loading }}>
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

