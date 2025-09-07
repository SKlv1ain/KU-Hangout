import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// สคีมาสมัครสมาชิก + เช็คยืนยันรหัสผ่านให้ตรงกัน
const schema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(6, "Confirm your password"),
  contact: z.string().optional(), // ฟิลด์เพิ่มเติมตามสเปค
}).refine((data) => data.password === data.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  // สมัครเสร็จ → โดยโค้ดนี้จะ auto-login (รับ token) แล้วโยนกลับ Home
  const onSubmit = async ({ username, password, contact }) => {
    setServerError("");
    try {
      await doRegister({ username, password, contact });
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "64px auto" }}>
      <h1>Register</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <div>
          <label>Username</label>
          <input {...register("username")} placeholder="yourusername" />
          {errors.username && <p style={{ color: "crimson" }}>{errors.username.message}</p>}
        </div>

        <div>
          <label>Password</label>
          <input type="password" {...register("password")} placeholder="Create a password" />
          {errors.password && <p style={{ color: "crimson" }}>{errors.password.message}</p>}
        </div>

        <div>
          <label>Confirm Password</label>
          <input type="password" {...register("confirm")} placeholder="Repeat password" />
          {errors.confirm && <p style={{ color: "crimson" }}>{errors.confirm.message}</p>}
        </div>

        <div>
          <label>Contact (optional)</label>
          <input {...register("contact")} placeholder="Line ID, phone, etc." />
        </div>

        {serverError && <p style={{ color: "crimson" }}>{serverError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
