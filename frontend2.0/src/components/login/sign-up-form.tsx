import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import {
  AuthFormLayout,
  AuthInputField,
  AuthFormFooter,
  GoogleAuthButton,
} from "@/components/auth"

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

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
      navigate("/home");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      const errorMessage = error?.response?.data?.detail || error?.message || "Failed to create account";
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
      <AuthFormLayout
        title="Create a new account"
        description="Start by entering your details below"
        serverError={serverError}
        footer={(
          <AuthFormFooter
            socialButton={<GoogleAuthButton label="Sign up with Google" />}
            prompt={{
              message: "Already have an account?",
              actionLabel: "Log in",
              onAction: onLogin,
            }}
          />
        )}
      >
        <AuthInputField
            id="signup-username"
            type="text"
          label="Username"
            placeholder="yourusername"
          error={errors.username?.message}
            {...register("username")}
        />
        <AuthInputField
            id="signup-email"
            type="email"
          label="Email"
            placeholder="you@example.com"
          error={errors.email?.message}
            {...register("email")}
        />
        <AuthInputField
            id="signup-password"
            type="password"
          label="Password"
          error={errors.password?.message}
            {...register("password")}
        />
        <AuthInputField
            id="signup-confirm-password"
            type="password"
          label="Confirm password"
          error={errors.password_confirm?.message}
            {...register("password_confirm")}
        />
        <AuthInputField
            id="signup-contact"
            type="text"
          label="Contact (Optional)"
            placeholder="Your contact information"
          error={errors.contact?.message}
            {...register("contact")}
          />
        <Field>
          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </Field>
      </AuthFormLayout>
    </form>
  )
}

