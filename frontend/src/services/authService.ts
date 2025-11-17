import api from "./api";

// สมัครสมาชิก → คาดหวัง { user, token }
export async function registerUser(payload: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  contact?: string;
}) {
  const data = await api.post("/auth/register", payload);
  return data;
}

// ล็อกอิน → คาดหวัง { user, token }
export async function loginUser(payload: { username: string; password: string }) {
  const data = await api.post("/auth/login", payload);
  return data;
}

export async function fetchMe() {
  const data = await api.get("/users/me");
  return data;
}

export async function logoutUser() {
  try { 
    await api.post("/auth/logout");
  } catch (error) {
  }
}

