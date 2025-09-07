import { useState } from "react";
import { useForm } from "react-hook-form";           // ฟอร์มเบาๆ
import { z } from "zod";                             // สคีมา validate
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// กำหนดกติกาฟอร์มด้วย zod
const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { login } = useAuth();       // ดึงฟังก์ชัน login จาก Context
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  // ผูกฟอร์มกับสคีมา (จะได้ errors อัตโนมัติ)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  // เมื่อ submit สำเร็จ → เรียก login → โยกไปหน้า Home
  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values.username, values.password);
      navigate("/"); // ไป Home
    } catch (err) {
      // ดัก error จาก backend แล้วโชว์ข้อความ
      setServerError(err?.response?.data?.detail || "Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "64px auto" }}>
      <h1>Login</h1>

      {/* handleSubmit จะ validate ให้ ก่อนเรียก onSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <div>
          <label>Username</label>
          {/* register ผูก input นี้กับ key "username" */}
          <input {...register("username")} placeholder="yourusername" />
          {errors.username && <p style={{ color: "crimson" }}>{errors.username.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input type="password" {...register("password")} placeholder="••••••••" />
          {errors.password && <p style={{ color: "crimson" }}>{errors.password.message}</p>}
        </div>

        {/* โชว์ error ที่มาจาก server */}
        {serverError && <p style={{ color: "crimson" }}>{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
