  import { useState } from "react";
  import { useForm } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { z } from "zod";
  import { useNavigate } from "react-router-dom";
  import { Link } from "react-router-dom";

  import { Button } from "../ui/button";
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "../ui/form";
  import { Input } from "../ui/input";
  import LoadingIndicator from "../LoadingIndicator";
  import "../../styles/Login.css";

  import { Eye, EyeOff } from "lucide-react";

  const loginFormSchema = z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
  });

  const registerFormSchema = loginFormSchema.extend({
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  interface FormProps {
    method: "login" | "register";
  }

  function AuthenticationForm({ method }: FormProps) {
    const formSchema = method === "login" ? loginFormSchema : registerFormSchema;
    const form = useForm({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: "",
        password: "",
        confirmPassword: "",
      },
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = (values: z.infer<typeof formSchema>, e?: React.FormEvent) => {
      e?.preventDefault();
      setLoading(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        const { username, password } = values;
        console.log(`${method} form submitted:`, { username, password });
        
        if (method === "login") {
          alert(`Login form submitted!\nUsername: ${username}\nPassword: ${password}`);
        } else {
          alert(`Register form submitted!\nUsername: ${username}\nPassword: ${password}`);
          navigate("/login");
        }
        
        setLoading(false);
        setErrorMessage(null);
      }, 1000);
    };

    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="login-page">
          <h1>{name}</h1>

          <Form {...form}>
            <form
              onSubmit={(e) => {
                form.handleSubmit((values) => handleSubmit(values, e))(e); // Explicitly pass `e` to `handleSubmit`
              }}
              className="space-y-6"
            >
              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <div className="error-container">
                      {errorMessage && <p className="error-text">{errorMessage}</p>}
                    </div>
                    <FormLabel className="form-label">Username</FormLabel>
                    <FormControl>
                      <Input className="form-input" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="form-input pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field for Register */}
              {method === "register" && (
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            className="form-input pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button className="login-button" type="submit">
                {loading ? <LoadingIndicator /> : name}
              </Button>
            </form>
          </Form>

          {/* Navigation Links */}
          <p className="mt-4">
            {name === "Login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={name === "Login" ? "/register" : "/login"}
            >
              {name === "Login" ? "Register" : "Login"}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  export default AuthenticationForm;
