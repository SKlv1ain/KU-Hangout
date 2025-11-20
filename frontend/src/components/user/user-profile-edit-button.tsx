"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PencilLine } from "lucide-react";

interface UserProfileEditButtonProps {
  className?: string;
  onClick?: () => void;
  label?: string;
}

export default function UserProfileEditButton({
  className,
  onClick,
  label = "Edit profile",
}: UserProfileEditButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-full bg-white/80 text-neutral-700 shadow-md hover:bg-white dark:bg-black/40 dark:text-neutral-200 dark:hover:bg-black/60 transition-colors",
        className
      )}
    >
      <PencilLine className="h-4 w-4" />
    </Button>
  );
}

