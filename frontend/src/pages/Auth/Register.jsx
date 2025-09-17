import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// สคีมาสมัครสมาชิก + เช็คยืนยันรหัสผ่านให้ตรงกัน
const schema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    passwordConfirm: z.string().min(6, "Confirm your password"),
    contact: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export default function Register() {
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  // สมัครเสร็จ → โดยโค้ดนี้จะ auto-login (รับ token) แล้วโยนกลับ Home
  const onSubmit = async ({ username, email, password, passwordConfirm, contact }) => {
    setServerError("");
    try {
      // ส่ง field ให้ backend ตามชื่อที่ต้องการ
      await doRegister({
        username,
        email,
        password,
        password_confirm: passwordConfirm,
        contact,
      });
      navigate("/");
    } catch (err) {
      const data = err?.response?.data;
      // แสดงข้อความ error ราย field จาก backend ถ้ามี
      if (data && typeof data === 'object') {
        const messages = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v)? v.join(', '): String(v)}`);
        setServerError(messages.join(' | ') || "Registration failed");
      } else {
        setServerError("Registration failed");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <h1 className="title">Create your account</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="field">
            <label className="label">Username</label>
            <input className="input" {...register("username")} placeholder="yourusername" />
            {errors.username && <p className="error">{errors.username.message}</p>}
          </div>

          <div className="field">
            <label className="label">Email address</label>
            <input className="input" type="email" {...register("email")} placeholder="you@example.com" />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div className="grid-2">
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" {...register("password")} placeholder="Create a password" />
              {errors.password && <p className="error">{errors.password.message}</p>}
            </div>
            <div className="field">
              <label className="label">Password confirm</label>
              <input className="input" type="password" {...register("passwordConfirm")} placeholder="Repeat password" />
              {errors.passwordConfirm && <p className="error">{errors.passwordConfirm.message}</p>}
            </div>
          </div>

          <div className="field">
            <label className="label">Contact</label>
            <input className="input" {...register("contact")} placeholder="Line ID, phone, etc." />
          </div>

          {serverError && <p className="error" role="alert">{serverError}</p>}

          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "POST"}
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}
