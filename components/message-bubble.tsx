"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Bot, User } from "lucide-react";
import type { Message } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null;

  return (
    <div className={cn("flex gap-4 w-full animate-fade-up", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <Avatar className={cn("mt-1 shrink-0", isUser ? "bg-primary" : "bg-gradient-to-br from-primary to-accent")}>
        <AvatarFallback>
          {isUser ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-white" />}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card border border-border rounded-tl-md",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="relative">
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5 rounded-sm" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
