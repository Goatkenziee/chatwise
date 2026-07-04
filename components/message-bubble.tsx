"use client";

import { Message } from "@/lib/types";
import { MarkdownRenderer } from "./markdown-renderer";
import { User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 message-enter",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-muted"
            : "bg-accent/10"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Zap className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-accent text-white rounded-tr-sm"
            : "bg-card text-foreground rounded-tl-sm border border-border"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}