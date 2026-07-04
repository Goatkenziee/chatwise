// In-memory store for conversations
// In a production app, this would use Zustand + localStorage or a database
import { Conversation } from "./types";

const STORAGE_KEY = "chatwise-conversations";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}