"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/lib/types";
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
  onClear,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300 ease-out",
        collapsed ? "w-[52px]" : "w-[260px]",
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center px-3 h-12 shrink-0", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium">ChatWise</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-sidebar-hover text-muted-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className={cn("px-2 pb-2", collapsed && "px-1")}>
        <button
          onClick={onNew}
          className={cn(
            "flex items-center gap-2 w-full rounded-lg text-sm transition-all duration-150",
            "text-muted-foreground hover:text-foreground hover:bg-sidebar-hover",
            collapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 h-9",
          )}
        >
          <MessageSquarePlus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-none">
        {sorted.map((conv) => (
          <div key={conv.id} className="group relative">
            {editingId === conv.id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <input
                  ref={editRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onRename(conv.id, editValue.trim() || conv.title);
                      setEditingId(null);
                    }
                    if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  className="flex-1 h-7 px-2 text-sm rounded-md bg-sidebar-active border border-border outline-none"
                />
                <button
                  onClick={() => {
                    onRename(conv.id, editValue.trim() || conv.title);
                    setEditingId(null);
                  }}
                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-sidebar-hover text-muted-foreground"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-sidebar-hover text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg text-sm transition-all duration-150",
                  collapsed ? "justify-center h-9" : "px-3 h-9",
                  conv.id === activeId
                    ? "bg-sidebar-active text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-hover",
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!collapsed && (
                  <span className="truncate flex-1 text-left">{conv.title || "New chat"}</span>
                )}
                {!collapsed && conv.id === activeId && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(conv.id);
                        setEditValue(conv.title);
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-sidebar-hover text-muted-foreground"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-sidebar-hover text-muted-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </button>
            )}
          </div>
        ))}
        {sorted.length === 0 && !collapsed && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">No conversations yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!collapsed && conversations.length > 0 && (
        <div className="px-2 py-2 border-t border-border">
          <button
            onClick={onClear}
            className="flex items-center gap-2 w-full px-3 h-9 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-hover transition-all duration-150"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear conversations
          </button>
        </div>
      )}
    </aside>
  );
}
