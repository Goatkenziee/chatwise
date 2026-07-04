import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;
export const runtime = "edge";

// Demo responses when no API key is configured
const DEMO_RESPONSES: Record<string, string> = {
  hello:
    "Hello! I'm ChatWise, your AI assistant. I can help you with writing, coding, analysis, creative tasks, and more. What would you like to explore today?",
  help:
    "I can help you with:\n\n- **Writing**: essays, emails, reports, creative writing\n- **Coding**: write, debug, explain code in any language\n- **Analysis**: data interpretation, pros/cons, comparisons\n- **Learning**: explain concepts, summarize articles, study help\n- **Creative**: brainstorming, outlines, storytelling\n\nJust tell me what you need!",
  code: "Here's a simple React component:\n\n```tsx\nimport { useState } from 'react';\n\ninterface CounterProps {\n  initialValue?: number;\n}\n\nexport function Counter({ initialValue = 0 }: CounterProps) {\n  const [count, setCount] = useState(initialValue);\n\n  return (\n    <div className=\"flex items-center gap-4 p-4\">\n      <button\n        onClick={() => setCount(c => c - 1)}\n        className=\"px-3 py-1 bg-red-500 text-white rounded\"\n      >\n        -\n      </button>\n      <span className=\"text-xl font-mono\">{count}</span>\n      <button\n        onClick={() => setCount(c => c + 1)}\n        className=\"px-3 py-1 bg-green-500 text-white rounded\"\n      >\n        +\n      </button>\n    </div>\n  );\n}\n```\n\nThis creates a simple counter with increment and decrement buttons!",
};

function getDemoResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  // Check exact matches
  for (const [key, response] of Object.entries(DEMO_RESPONSES)) {
    if (lower === key || lower.startsWith(key + " ") || lower.endsWith(" " + key)) {
      return response;
    }
  }

  // Check for keywords
  if (lower.includes("hello") || lower.includes("hi ") || lower.includes("hey")) {
    return DEMO_RESPONSES.hello;
  }

  // Default fallback
  return `You said: "${input}"\n\nI'm running in **demo mode** — I can respond to a few preset topics:\n\n- Say **"hello"** for a greeting\n- Say **"help"** to see what I can do\n- Say **"code"** for a code example\n\nTo unlock full AI responses, add your **OPENAI_API_KEY** as an environment variable.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Demo mode — no API key configured
    if (!apiKey) {
      const lastMessage = messages[messages.length - 1];
      const userInput = lastMessage?.content || "";
      const response = getDemoResponse(userInput);

      // Simulate streaming by sending chunks
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = response.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Demo-Mode": "true",
        },
      });
    }

    // Real OpenAI mode
    const openai = new OpenAI({ apiKey });

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are ChatWise, a helpful AI assistant. You respond conversationally, clearly, and accurately. When sharing code, use markdown code blocks with language tags.",
        },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}