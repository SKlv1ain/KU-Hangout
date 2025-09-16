import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "password" | "email" | "number" | "textarea" | "datetime-local" | "select";
  placeholder?: string;
  validation: z.ZodTypeAny;
  options?: Array<{ value: string; label: string }>; // For select dropdowns
}

interface PostFormProps {
  title: string;
  fields: FormFieldConfig[];
  endpoint: string;
  buttonText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  method?: "POST" | "PUT" | "PATCH";
}

function PostForm({ 
  title, 
  fields, 
  endpoint, 
  buttonText = "Submit",
  onSuccess,
  onError,
  method = "POST"
}: PostFormProps) {
  // Create dynamic schema from field configurations
  const schemaFields = fields.reduce((acc, field) => {
    acc[field.name] = field.validation;
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);

  const formSchema = z.object(schemaFields);

  // Create default values
  const defaultValues = fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {} as Record<string, string>);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await fetch(endpoint, {
        method,
        body: formData,
        credentials: 'include', // Include cookies for Django CSRF
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Success!");
        form.reset();
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        const error = data.error || "An error occurred";
        setErrorMessage(error);
        if (onError) {
          onError(error);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Network error occurred";
      setErrorMessage(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel className="form-label">{field.label}</FormLabel>
            <FormControl>
              {field.type === "textarea" ? (
                <textarea
                  {...formField}
                  className="form-input resize-none"
                  rows={4}
                  placeholder={field.placeholder}
                />
              ) : field.type === "select" ? (
                <select
                  {...formField}
                  className="form-input"
                >
                  <option value="">{field.placeholder || "Select an option"}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  {...formField}
                  type={field.type || "text"}
                  className="form-input"
                  placeholder={field.placeholder}
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="login-page">
        <h1>{title}</h1>

        {/* Success Message */}
        {successMessage && (
          <div className="error-container">
            <p className="text-green-600 bg-green-50 border border-green-300 rounded-md px-3 py-2 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-container">
            <p className="error-text">{errorMessage}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {fields.map(renderField)}

            <Button className="login-button" type="submit" disabled={loading}>
              {loading ? <LoadingIndicator /> : buttonText}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default PostForm;
