"use client"

import { Button, type ButtonProps } from "@/components/ui/button"

interface GoogleAuthButtonProps extends ButtonProps {
  label: string
}

export function GoogleAuthButton({ label, className, ...props }: GoogleAuthButtonProps) {
  return (
    <Button variant="outline" type="button" className={className} {...props}>
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
      <span className="ml-2">{label}</span>
    </Button>
  )
}
