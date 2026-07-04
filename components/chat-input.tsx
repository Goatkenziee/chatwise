"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowUp, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, onStop, isLoading, placeholder }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto px-4 pb-4">
      <div
        className={cn(
          "relative flex items-end gap-2",
          "rounded-2xl border border-border bg-chat-input-bg",
          "transition-all duration-150",
          "focus-within:border-foreground/20 focus-within:shadow-input-focus",
          "px-3 py-2",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Message ChatWise..."}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-sm leading-relaxed outline-none resize-none",
            "placeholder:text-muted-foreground/60",
            "max-h-[200px] py-1",
          )}
          disabled={isLoading}
        />

        <button
          onClick={isLoading ? onStop : handleSubmit}
          disabled={!isLoading && !value.trim()}
          className={cn(
            "flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center",
            "transition-all duration-150",
            isLoading
              ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
              : value.trim()
                ? "bg-foreground text-background hover:opacity-80"
                : "bg-foreground/5 text-muted-foreground cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-[11px] text-center text-muted-foreground/40 mt-2 select-none">
        ChatWise may produce inaccurate information. Verify important facts.
      </p>
    </div>
  );
}
