# ChatWise

A modern AI chat assistant built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Streaming AI responses** — Real-time token-by-token responses
- **Demo mode** — Works immediately without any API key (try "hello", "help", or "code")
- **Real OpenAI** — Set `OPENAI_API_KEY` for live GPT-4o-mini responses
- **Markdown rendering** — Code blocks with syntax highlighting + copy button
- **Multiple conversations** — Sidebar with new/delete/switch chats
- **Modern dark UI** — Clean monochrome theme with smooth animations
- **Suggested prompts** — Starter cards on the empty state (like ChatGPT)

## Getting Started

```bash
git clone https://github.com/Goatkenziee/chatwise
cd chatwise
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### API Key (Optional)

Create a `.env.local` file:

```
OPENAI_API_KEY=your_key_here
```

Without a key, the app runs in demo mode with preset responses.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Goatkenziee/chatwise)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `https://github.com/Goatkenziee/chatwise`
3. Add `OPENAI_API_KEY` as an environment variable (optional — demo mode works without it)
4. Deploy — takes ~2 minutes

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI API (GPT-4o-mini)
- **Markdown:** react-markdown + react-syntax-highlighter
- **Icons:** Lucide React
- **AI Client ID:** nanoid

## Project Structure

```
chatwise/
├── app/
│   ├── api/chat/route.ts    # Streaming AI API route
│   ├── globals.css          # Tailwind + custom styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main entry point
├── components/
│   ├── chat-input.tsx       # Message input with auto-resize
│   ├── chat-interface.tsx   # Main chat UI container
│   ├── markdown-renderer.tsx # Code blocks + markdown
│   ├── message-bubble.tsx   # User/AI message display
│   ├── sidebar.tsx          # Conversation sidebar
│   └── ui/                  # Base UI primitives
├── lib/
│   ├── store.ts             # localStorage persistence
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # cn() helper
└── package.json
```
