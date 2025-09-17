import api from "./api";

// สมัครสมาชิก → คาดหวัง { user, token } (ถ้า backend ต่างจากนี้ แก้จุดนี้ทีเดียว)
export async function registerUser(payload) {
  // payload: { username, email, password, password_confirm, contact? }
  const { data } = await api.post("/auth/register", payload);
  return data;
}

// ล็อกอิน → คาดหวัง { user, token }
export async function loginUser(payload) {
  // payload: { username, password }
  const { data } = await api.post("/auth/login", payload);
  return data;
}

// ดึงข้อมูลตัวเองหลังล็อกอิน → { user }
export async function fetchMe() {
  const { data } = await api.get("/users/me");
  return data;
}

// ออกจากระบบ + ลบ token ฝั่ง client
export async function logoutUser() {
  try { 
    console.log("Calling logout API...");
    const response = await api.post("/auth/logout");
    console.log("Logout API response:", response.data);
  } catch (error) {
    console.error("Logout API error:", error);
  }
  localStorage.removeItem("kh_token");
  console.log("Token removed from localStorage");
}
