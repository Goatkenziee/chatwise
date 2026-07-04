# ChatWise

A modern AI chat assistant built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🤖 **AI Chat** — Streaming responses via OpenAI API (or demo mode without a key)
- 💻 **Code Highlighting** — Syntax-highlighted code blocks with copy button
- 🎨 **Modern UI** — Clean dark theme inspired by OpenAI's design
- 📱 **Responsive** — Works on desktop and mobile
- ⚡ **Fast** — Edge-ready streaming API

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Goatkenziee/chatwise.git
cd chatwise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and add your OpenAI API key:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
OPENAI_API_KEY=sk-your-key-here
```

> **Without an API key, the app runs in demo mode** with simulated responses so you can test the UI.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Goatkenziee/chatwise)

After deploying, add `OPENAI_API_KEY` to your Vercel environment variables.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** OpenAI API (streaming)
- **Markdown:** react-markdown + react-syntax-highlighter

## License

MIT
