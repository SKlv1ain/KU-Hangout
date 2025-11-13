"use client"

import { type ReactNode } from "react"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type BaseInputProps = React.ComponentProps<typeof Input>

interface AuthInputFieldProps extends BaseInputProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  endAdornment?: ReactNode
}

export function AuthInputField({
  id,
  label,
  error,
  hint,
  endAdornment,
  className,
  ...props
}: AuthInputFieldProps) {
  return (
    <Field>
      <div className="flex items-center">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {endAdornment}
      </div>
      <Input id={id} className={cn(className, error && "border-red-500")} {...props} />
      {error ? <p className="text-sm text-red-500 mt-1">{error}</p> : null}
      {hint}
    </Field>
  )
}
