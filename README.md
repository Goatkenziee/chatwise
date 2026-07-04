# ChatWise

A modern AI chat assistant like ChatGPT. Built with Next.js 14 + TypeScript + Tailwind.

## Features

- **Streaming responses** — real-time AI replies via OpenAI
- **Conversation management** — create, switch, rename, delete conversations
- **Markdown rendering** — with syntax-highlighted code blocks
- **Polished dark UI** — responsive sidebar, elegant design
- **localStorage persistence** — conversations survive page reloads

## Getting Started

```bash
npm install
echo "OPENAI_API_KEY=sk-..." > .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Goatkenziee/chatwise)

Set `OPENAI_API_KEY` as an environment variable for full AI-powered responses.
