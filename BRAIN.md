# BRAIN.md — ChatWise

## What this app does
An AI chat assistant (like ChatGPT) with streaming responses, markdown rendering, and multi-conversation management.

## Tech stack
- **Framework:** Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS with dark theme
- **AI:** OpenAI API streaming (GPT-4o-mini) with demo fallback
- **Persistence:** localStorage for conversations
- **Markdown:** react-markdown + react-syntax-highlighter + remark-gfm

## Current state
✅ Complete and verified. Build compiles successfully, dev server runs.

## Key files
- `app/api/chat/route.ts` — Streaming AI API route (OpenAI + demo fallback)
- `app/page.tsx` — Root page (delegates to ChatInterface)
- `components/chat-interface.tsx` — Main orchestrator: state management, streaming logic, empty state
- `components/chat-input.tsx` — Auto-resize textarea with send/stop buttons
- `components/message-bubble.tsx` — Renders user/assistant messages
- `components/markdown-renderer.tsx` — Markdown with code highlighting + copy
- `components/sidebar.tsx` — Conversation list with new/delete/clear
- `lib/store.ts` — localStorage persistence helpers
- `lib/types.ts` — Message and Conversation types

## Features built
- Streaming AI responses (token-by-token)
- Demo mode — works without any API key
- Real OpenAI — set OPENAI_API_KEY for live GPT-4o-mini
- Markdown rendering with syntax-highlighted code blocks + copy button
- Multiple conversations with sidebar
- Suggested prompts on empty state
- Dark monochrome UI (#0c0c0c theme)
- localStorage persistence
- Auto-resize textarea

## GitHub
https://github.com/Goatkenziee/chatwise

## Deploy
Vercel integration needs reconnecting. Manual deploy:
1. Go to https://vercel.com/new
2. Import https://github.com/Goatkenziee/chatwise
3. Add OPENAI_API_KEY env var (optional)
4. Click Deploy
