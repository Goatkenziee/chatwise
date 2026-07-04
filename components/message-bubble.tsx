"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { MarkdownRenderer } from "./markdown-renderer";

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

export function MessageBubble({ message, isLoading }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const isUser = message.role === "user";
  const isEmpty = !message.content && isLoading;

  return (
    <div
      className={cn(
        "group flex gap-4 px-4 py-6 animate-fade-in-up",
        isUser ? "" : "bg-accent/20"
      )}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-medium">
            U
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1 font-medium">
          {isUser ? "You" : "ChatWise"}
        </div>

        {isEmpty ? (
          /* Animated typing dots */
          <div className="flex items-center gap-1 py-2">
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
        )}

        {/* Copy button */}
        {!isEmpty && (
          <button
            onClick={handleCopy}
            className={cn(
              "mt-2 flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground",
              copied && "opacity-100 text-emerald-500"
            )}
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 4L6 12l-3-3" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="12" height="12" rx="1" />
                  <path d="M12 4V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
