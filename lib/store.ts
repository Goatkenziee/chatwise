/**
 * Client-side conversation store using localStorage.
 * Provides persistence across page reloads without a database.
 */

import type { Conversation, Message } from "./types";

const STORAGE_KEY = "chatwise-conversations";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getStoredConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function setStoredConversations(convs: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
  } catch (e) {
    console.error("Failed to save conversations:", e);
  }
}

export function createConversation(model = "gpt-4o-mini"): Conversation {
  return {
    id: generateId(),
    title: "New conversation",
    messages: [],
    model,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function getConversations(): Conversation[] {
  return getStoredConversations();
}

export function getConversation(id: string): Conversation | undefined {
  return getStoredConversations().find((c) => c.id === id);
}

export function addConversation(conv: Conversation): void {
  const convs = getStoredConversations();
  convs.unshift(conv);
  setStoredConversations(convs);
}

export function updateConversation(id: string, updates: Partial<Conversation>): void {
  const convs = getStoredConversations();
  const idx = convs.findIndex((c) => c.id === id);
  if (idx === -1) return;
  convs[idx] = { ...convs[idx], ...updates, updatedAt: Date.now() };
  setStoredConversations(convs);
}

export function deleteConversation(id: string): void {
  const convs = getStoredConversations().filter((c) => c.id !== id);
  setStoredConversations(convs);
}

export function clearConversations(): void {
  setStoredConversations([]);
}

export function addMessage(conversationId: string, message: Message): void {
  const convs = getStoredConversations();
  const idx = convs.findIndex((c) => c.id === conversationId);
  if (idx === -1) return;

  convs[idx].messages.push(message);
  convs[idx].updatedAt = Date.now();

  // Auto-generate title from first user message
  if (convs[idx].messages.filter((m) => m.role === "user").length === 1 && message.role === "user") {
    convs[idx].title = message.content.slice(0, 60) + (message.content.length > 60 ? "..." : "");
  }

  setStoredConversations(convs);
}
