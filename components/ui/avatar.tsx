import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", className)} {...props}>
      {children}
    </div>
  );
}

export function AvatarFallback({ className, children, ...props }: AvatarProps) {
  return (
    <span className={cn("text-xs font-semibold", className)} {...props}>
      {children}
    </span>
  );
}
