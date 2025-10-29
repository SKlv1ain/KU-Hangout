import api from "./api";

// สมัครสมาชิก → คาดหวัง { user, token } (ถ้า backend ต่างจากนี้ แก้จุดนี้ทีเดียว)
export async function registerUser(payload) {
  // payload: { username, email, password, password_confirm, contact? }
  const data = await api.post("/api/auth/register", payload);
  return data;
}

// ล็อกอิน → คาดหวัง { user, token }
export async function loginUser(payload) {
  // payload: { username, password }
  const data = await api.post("/api/auth/login", payload);
  return data;
}

// ดึงข้อมูลตัวเองหลังล็อกอิน → { user }
export async function fetchMe() {
  const data = await api.get("/api/users/me");
  return data;
}

// ออกจากระบบ + ลบ token ฝั่ง client
export async function logoutUser() {
  try { 
    await api.post("/api/auth/logout");
  } catch (error) {
    // Don't throw error, let AuthContext handle token removal
    // Token removal is handled by AuthContext regardless of API call success
  }
}
