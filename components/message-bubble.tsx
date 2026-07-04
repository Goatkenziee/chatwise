"use client";

import { Message } from "@/lib/types";
import { MarkdownRenderer } from "./markdown-renderer";
import { Avatar } from "./ui/avatar";
import { User, Zap } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`group flex gap-3 px-4 py-3 ${isUser ? "" : "bg-muted/30"}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {isUser ? (
          <Avatar className="bg-accent/20 text-accent border border-accent/10">
            <User className="w-4 h-4" />
          </Avatar>
        ) : (
          <Avatar className="bg-gradient-to-br from-accent to-purple-500 text-white shadow-sm shadow-accent/20">
            <Zap className="w-4 h-4" />
          </Avatar>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-xs font-medium text-muted-foreground mb-1.5">
          {isUser ? "You" : "ChatWise"}
        </div>

        {message.content ? (
          <div className="text-sm leading-relaxed text-foreground/90">
            <MarkdownRenderer content={message.content} />
          </div>
        ) : (
          <div className="flex gap-1 py-2">
            <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
      </div>
    </div>
  );
}
