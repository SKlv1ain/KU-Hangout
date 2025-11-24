import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useGoogleLogin } from "@react-oauth/google"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { isGoogleAuthConfigured } from "@/lib/googleAuth"
import {
  AuthFormLayout,
  AuthInputField,
  AuthFormFooter,
  GoogleAuthButton,
} from "@/components/auth"

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
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const isGoogleConfigured = isGoogleAuthConfigured();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await login(values.username, values.password);
      toast.success("Login successful!");
      navigate("/home");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage = error?.response?.data?.detail || error?.message || "Invalid username or password";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          throw new Error("Google ไม่ส่ง access token กลับมา");
        }

        await loginWithGoogle(tokenResponse.access_token);
        toast.success("Login successful!");
        navigate("/home");
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string; error?: string } }; message?: string };
        const errorMessage = error?.response?.data?.detail || error?.response?.data?.error || error?.message || "Google login failed";
        setServerError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      setIsGoogleLoading(false);
      const message = errorResponse.error ?? "ไม่สามารถเริ่ม Google login ได้";
      toast.error(message);
    },
  });

  const handleGoogleLogin = () => {
    if (!isGoogleConfigured) {
      toast.error("ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID");
      return;
    }
    setServerError("");
    setIsGoogleLoading(true);
    try {
      googleLogin();
    } catch {
      setIsGoogleLoading(false);
      toast.error("ไม่สามารถเปิดหน้าต่าง Google login ได้");
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <AuthFormLayout
        title="Login to your account"
        description="Enter your username below to login to your account"
        serverError={serverError}
        footer={(
          <AuthFormFooter
            socialButton={
              <GoogleAuthButton
                label={isGoogleLoading ? "Connecting..." : "Login with Google"}
                disabled={isGoogleLoading}
                onClick={handleGoogleLogin}
              />
            }
            prompt={{
              message: "Don't have an account?",
              actionLabel: "Sign up",
              onAction: onSignUp,
            }}
          />
        )}
      >
        <AuthInputField
            id="username"
            type="text"
          label="Username"
            placeholder="yourusername"
          error={errors.username?.message}
            {...register("username")}
        />
        <AuthInputField
          id="password"
          type="password"
          label="Password"
          error={errors.password?.message}
          endAdornment={(
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          )}
            {...register("password")}
        />
        <Field>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </AuthFormLayout>
    </form>
  )
}

