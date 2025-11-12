"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { FieldGroup } from "@/components/ui/field"

interface AuthFormLayoutProps {
  title: string
  description: string
  serverError?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function AuthFormLayout({
  title,
  description,
  serverError,
  children,
  footer,
  className,
}: AuthFormLayoutProps) {
  return (
    <FieldGroup className={cn(className)}>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm text-balance">{description}</p>
      </div>

      {serverError ? (
        <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
          {serverError}
        </div>
      ) : null}

      {children}
      {footer}
    </FieldGroup>
  )
}
