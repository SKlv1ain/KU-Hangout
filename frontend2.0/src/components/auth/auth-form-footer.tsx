"use client"

import { type ReactNode } from "react"
import { Field, FieldDescription, FieldSeparator } from "@/components/ui/field"

interface AuthFormFooterProps {
  separatorLabel?: string
  socialButton: ReactNode
  prompt?: {
    message: string
    actionLabel: string
    onAction?: () => void
  }
}

export function AuthFormFooter({
  separatorLabel = "Or continue with",
  socialButton,
  prompt,
}: AuthFormFooterProps) {
  return (
    <>
      <FieldSeparator>{separatorLabel}</FieldSeparator>
      <Field>
        {socialButton}
        {prompt ? (
          <FieldDescription className="text-center">
            {prompt.message}{" "}
            <span
              onClick={prompt.onAction}
              className="text-primary underline underline-offset-4 cursor-pointer font-medium hover:text-primary/80"
            >
              {prompt.actionLabel}
            </span>
          </FieldDescription>
        ) : null}
      </Field>
    </>
  )
}
