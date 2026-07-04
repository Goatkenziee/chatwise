import { NextRequest } from "next/server";
import OpenAI from "openai";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Demo responses when no API key is set
const DEMO_RESPONSES: Record<string, string> = {
  hello:
    "Hello! 👋 I'm ChatWise, your AI assistant. I can help you with writing, coding, analysis, and more. What can I help you with today?",
  help: "Here are some things I can help you with:\n\n- **Writing** — essays, emails, reports, creative writing\n- **Coding** — debug, explain, write code in any language\n- **Analysis** — data analysis, math, logic problems\n- **Research** — explain concepts, summarize topics\n- **Brainstorming** — ideas, outlines, creative thinking\n\nJust tell me what you need!",
  code: "Sure! Here's a quick example of a React component:\n\n```tsx\nimport { useState } from 'react';\n\ninterface CounterProps {\n  initialValue?: number;\n}\n\nexport function Counter({ initialValue = 0 }: CounterProps) {\n  const [count, setCount] = useState(initialValue);\n\n  return (\n    <div className=\"flex items-center gap-4 p-4\">\n      <button\n        onClick={() => setCount(c => c - 1)}\n        className=\"px-3 py-1 rounded bg-white/10 hover:bg-white/20\"\n      >\n        -\n      </button>\n      <span className=\"text-2xl font-mono min-w-[3rem] text-center\">\n        {count}\n      </span>\n      <button\n        onClick={() => setCount(c => c + 1)}\n        className=\"px-3 py-1 rounded bg-white/10 hover:bg-white/20\"\n      >\n        +\n      </button>\n    </div>\n  );\n}\n```\n\nThis creates a simple counter with increment/decrement buttons. The `useState` hook manages the count, and the component accepts an optional `initialValue` prop.",
  explain: "Here's how streaming AI chat works:\n\n1. **User sends a message** — The frontend sends a POST request to the API route with the message history.\n\n2. **Server streams the response** — The API calls the AI model and streams tokens back as they're generated.\n\n3. **Frontend renders tokens live** — Each chunk is appended to the message in real-time, giving that smooth typing effect.\n\n4. **Markdown rendering** — The response is rendered as Markdown, so code blocks, lists, and formatting appear correctly.\n\nThe key technology is **Server-Sent Events (SSE)** — a standard that lets the server push data to the client over a single HTTP connection.",
  default:
    "That's a great question! As an AI assistant, I can help with a wide range of topics. Could you be more specific about what you'd like to know? I'm here to help with writing, coding, analysis, explanations, and creative tasks. 🚀",
};

function getDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("hello") || lower.includes("hi ") || lower === "hi") return DEMO_RESPONSES.hello;
  if (lower.includes("help") || lower.includes("what can you")) return DEMO_RESPONSES.help;
  if (lower.includes("code") || lower.includes("example") || lower.includes("react") || lower.includes("component"))
    return DEMO_RESPONSES.code;
  if (lower.includes("explain") || lower.includes("how") || lower.includes("what is") || lower.includes("stream"))
    return DEMO_RESPONSES.explain;
  return DEMO_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Demo mode — return simulated responses
    if (!apiKey) {
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
      const response = getDemoResponse(lastUserMessage);

      // Simulate streaming by sending the response in chunks
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = response.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
            await new Promise((r) => setTimeout(r, 20));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Real OpenAI streaming mode
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatWise, a helpful AI assistant. You respond conversationally with markdown formatting. Use code blocks with language tags when writing code. Be concise but thorough.",
        },
        ...messages.map((m: any) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n"));
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
