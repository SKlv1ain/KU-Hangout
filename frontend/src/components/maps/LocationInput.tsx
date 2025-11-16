"use client"

import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
  label?: string
  required?: boolean
}

/**
 * Reusable location input field with search icon
 * Used as fallback when Google Maps is not available
 */
export function LocationInput({
  id,
  value,
  onChange,
  placeholder = "Enter location",
  error,
  className,
  label,
  required = false,
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "flex h-9 items-center gap-2 border-b px-3 flex-shrink-0",
          error && "border-destructive",
          className
        )}
      >
        <SearchIcon className="size-4 shrink-0 opacity-50" />
        <input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive"
          )}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

