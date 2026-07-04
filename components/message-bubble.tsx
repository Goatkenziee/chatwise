"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/lib/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Copy, Check, User, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-4 animate-message-in",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
          </div>
        </div>
      )}

      <div className={cn("group relative max-w-[700px]", isUser ? "order-1" : "order-1")}>
        <div
          className={cn(
            "relative px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "bg-user-bubble text-foreground rounded-2xl rounded-tr-md"
              : "bg-assistant-bubble text-foreground",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {/* Copy button — appears on hover */}
        <button
          onClick={handleCopy}
          className={cn(
            "absolute -bottom-5 right-0 h-6 w-6 flex items-center justify-center rounded-md",
            "opacity-0 group-hover:opacity-100 transition-all duration-150",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
