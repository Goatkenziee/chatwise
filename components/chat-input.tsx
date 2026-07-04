"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  function handleSubmit() {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 transition-colors">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Send a message..."
        rows={1}
        className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none resize-none max-h-[200px] leading-relaxed"
        disabled={isStreaming}
      />
      {isStreaming ? (
        <button
          onClick={onStop}
          className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors shrink-0"
          aria-label="Stop generating"
        >
          <Square className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}