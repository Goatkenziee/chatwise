"use client";

import { Conversation } from "@/lib/types";
import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
}

export function Sidebar({ conversations, activeId, onSelect, onNew, onDelete, isOpen }: SidebarProps) {
  return (
    <aside
      className={cn(
        "h-full bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0",
        isOpen ? "w-72" : "w-0 overflow-hidden"
      )}
    >
      <div className="p-4 border-b border-border">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                activeId === conv.id
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              onClick={() => onSelect(conv.id)}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate flex-1">
                {conv.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-background transition-all"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-400" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          ChatWise v0.1
        </p>
      </div>
    </aside>
  );
}