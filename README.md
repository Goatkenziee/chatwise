# ChatWise

A modern AI chat assistant built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Streaming AI responses** — Real-time token-by-token responses
- **Demo mode** — Works immediately without any API key
- **Real OpenAI** — Set `OPENAI_API_KEY` for live GPT responses
- **Markdown rendering** — Code blocks with syntax highlighting + copy button
- **Multiple conversations** — Sidebar with new/delete/switch chats
- **Modern dark UI** — Clean monochrome theme with smooth animations

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

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Goatkenziee/chatwise)

Add `OPENAI_API_KEY` as an environment variable in Vercel for full AI functionality.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API
- react-markdown + react-syntax-highlighter
- Lucide Icons
