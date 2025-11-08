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
const signUpSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirm: z.string().min(8, "Password confirmation is required"),
  contact: z.string().optional(),
}).refine((data) => data.password === data.password_confirm, {
  message: "Passwords don't match",
  path: ["password_confirm"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

type SignUpFormProps = React.ComponentProps<"form"> & {
  onLogin?: () => void
}

export function SignUpForm({
  className,
  onLogin,
  ...props
}: SignUpFormProps) {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ผูกฟอร์มกับสคีมา
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // เมื่อ submit สำเร็จ → เรียก register → โยกไปหน้า Home
  const onSubmit = async (values: SignUpFormData) => {
    setServerError("");
    setIsSubmitting(true);
    try {
      await registerUser({
        username: values.username,
        email: values.email,
        password: values.password,
        password_confirm: values.password_confirm,
        contact: values.contact,
      });
      toast.success("Account created successfully!");
      navigate("/home"); // ไปหน้า Home
    } catch (err: any) {
      // ดัก error จาก backend แล้วโชว์ข้อความ
      const errorMessage = err?.response?.data?.detail || err?.message || "Failed to create account";
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
          <h1 className="text-2xl font-bold">Create a new account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Start by entering your details below
          </p>
        </div>
        {serverError && (
          <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
            {serverError}
          </div>
        )}
        <Field>
          <FieldLabel htmlFor="signup-username">Username</FieldLabel>
          <Input
            id="signup-username"
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
          <FieldLabel htmlFor="signup-email">Email</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-password">Password</FieldLabel>
          <Input
            id="signup-password"
            type="password"
            {...register("password")}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-confirm-password">Confirm password</FieldLabel>
          <Input
            id="signup-confirm-password"
            type="password"
            {...register("password_confirm")}
            className={errors.password_confirm ? "border-red-500" : ""}
          />
          {errors.password_confirm && (
            <p className="text-sm text-red-500 mt-1">{errors.password_confirm.message}</p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="signup-contact">Contact (Optional)</FieldLabel>
          <Input
            id="signup-contact"
            type="text"
            placeholder="Your contact information"
            {...register("contact")}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
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
            Sign up with Google
          </Button>
          <FieldDescription className="text-center">
            Already have an account?{" "}
            <span
              onClick={onLogin}
              className="text-primary underline underline-offset-4 cursor-pointer font-medium hover:text-primary/80"
            >
              Log in
            </span>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

