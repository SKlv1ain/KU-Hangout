import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

// กำหนดกติกาฟอร์มด้วย zod
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

type LoginFormProps = React.ComponentProps<"form"> & {
  onSignUp?: () => void
}

export function LoginForm({
  className,
  onSignUp,
  ...props
}: LoginFormProps) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ผูกฟอร์มกับสคีมา (จะได้ errors อัตโนมัติ)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // เมื่อ submit สำเร็จ → เรียก login → โยกไปหน้า Home
  const onSubmit = async (values: LoginFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
      toast.success("Login successful!");
      navigate("/home"); // ไปหน้า Home
    } catch (err: any) {
      // ดัก error จาก backend แล้วโชว์ข้อความ
      const errorMessage = err?.response?.data?.detail || err?.message || "Invalid username or password";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your username below to login to your account
          </p>
        </div>
        {serverError && (
          <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            {serverError}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="yourusername"
            {...register("username")}
            className={errors.username ? "border-red-500" : ""}
          />
          {errors.username && (
            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
          )}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </Field>
        <Field>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M21.6 12.227c0-.637-.057-1.252-.164-1.845H12v3.488h5.404c-.233 1.255-.94 2.318-2.004 3.035v2.517h3.237c1.892-1.742 2.963-4.305 2.963-7.195z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.7 0 4.96-.893 6.613-2.583l-3.237-2.517c-.897.602-2.047.957-3.376.957-2.598 0-4.803-1.756-5.588-4.116H3.05v2.59A9.997 9.997 0 0 0 12 22z"
                fill="#34A853"
              />
              <path
                d="M6.412 13.741a5.99 5.99 0 0 1 0-3.482V7.67H3.05a9.998 9.998 0 0 0 0 8.66l3.362-2.589z"
                fill="#FBBC04"
              />
              <path
                d="M12 6.042c1.469 0 2.784.506 3.821 1.497l2.866-2.866C16.958 2.93 14.7 2 12 2 7.799 2 4.174 4.55 3.05 7.67l3.362 2.59C7.197 7.798 9.402 6.042 12 6.042z"
                fill="#EA4335"
              />
              <path d="M2 2h20v20H2z" fill="none" />
            </svg>
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <span
              onClick={onSignUp}
              className="text-primary underline underline-offset-4 cursor-pointer font-medium hover:text-primary/80"
            >
              Sign up
            </span>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

