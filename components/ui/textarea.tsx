import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[60px] w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "resize-none transition-all duration-150",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
