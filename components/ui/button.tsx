import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "ghost" | "outline" | "primary";
type Size = "default" | "sm" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-80",
  primary: "bg-foreground text-background hover:opacity-80",
  ghost: "bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground",
  outline: "border border-border bg-transparent hover:bg-muted text-foreground",
};

const sizes: Record<Size, string> = {
  default: "h-9 px-4 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-6 text-sm",
  icon: "h-8 w-8",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "default", size = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20",
      "disabled:pointer-events-none disabled:opacity-40",
      "select-none",
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
