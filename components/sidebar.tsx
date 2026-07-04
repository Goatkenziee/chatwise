"use client";

import { Conversation } from "@/lib/types";
import { Plus, MessageSquare, Trash2, X, LogOut, Sparkles } from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClearAll,
  isOpen,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="w-72 bg-muted/50 border-r border-border flex flex-col shrink-0">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover transition-all duration-150 shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground/60">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/40 mt-1">
              Start a new chat to begin
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                activeId === conv.id
                  ? "bg-accent/10 text-foreground border border-accent/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate flex-1">{conv.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 hover:text-red-400 transition-all"
                aria-label="Delete conversation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="p-2 border-t border-border">
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear all conversations
          </button>
        </div>
      )}
    </aside>
  );
}
