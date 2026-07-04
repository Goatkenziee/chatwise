"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeft, Sparkles, ChevronDown } from "lucide-react";
import type { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClear,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onToggleCollapse} />
      )}

      <aside
        className={cn(
          "fixed md:relative z-40 h-full flex flex-col bg-card border-r border-border transition-all duration-300",
          isCollapsed ? "w-0 md:w-[60px] overflow-hidden" : "w-[280px]",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center p-4 border-b border-border", isCollapsed && "md:justify-center md:p-3")}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm gradient-text">ChatWise</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 shrink-0"
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className={cn("p-3", isCollapsed && "md:p-2")}>
          <Button
            onClick={onNew}
            variant="outline"
            className={cn(
              "w-full gap-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5",
              isCollapsed && "md:p-2 md:justify-center",
            )}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span>New Chat</span>}
          </Button>
        </div>

        {/* Conversations List */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all group flex items-center gap-3",
                    conv.id === activeId
                      ? "bg-primary/10 border border-primary/20 text-foreground"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent",
                  )}
                >
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />
                  <span className="truncate flex-1 text-xs">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </button>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        {!isCollapsed && conversations.length > 0 && (
          <div className="p-3 border-t border-border">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
              >
                <span>{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
              {showMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl p-1 shadow-xl">
                  <button
                    onClick={() => {
                      onClear();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  >
                    Clear all conversations
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
