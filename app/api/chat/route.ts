import { NextRequest } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are ChatWise, a helpful, thoughtful AI assistant. You respond in a clear, friendly tone. You can help with writing, analysis, coding, creative tasks, and general questions. When appropriate, use formatting like **bold**, \`code\`, and lists for clarity. Be concise but thorough.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, model = "gpt-4o-mini" } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If no API key is set, use a simulated streaming response for demo purposes
    if (!OPENAI_API_KEY) {
      return simulateStreamingResponse(messages);
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI API error:", response.status, errorBody);
      // Fall back to simulated response on API error
      return simulateStreamingResponse(messages);
    }

    // Stream the response back to the client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

            for (const line of lines) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(encoder.encode(JSON.stringify({ content, done: false }) + "\n"));
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        } catch (err) {
          console.error("Stream read error:", err);
        } finally {
          controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true }) + "\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Simulated streaming response for demo when no API key is configured.
 * Generates a realistic, context-aware response.
 */
async function simulateStreamingResponse(messages: { role: string; content: string }[]) {
  const userMessage = messages[messages.length - 1]?.content || "";
  const encoder = new TextEncoder();

  // Generate a realistic response based on the user's message
  const responseText = generateDemoResponse(userMessage);

  const stream = new ReadableStream({
    async start(controller) {
      // Stream word by word for realistic effect
      const words = responseText.split(" ");

      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? " " : "");
        controller.enqueue(encoder.encode(JSON.stringify({ content: chunk, done: false }) + "\n"));
        // Small delay between words for streaming effect
        await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
      }

      controller.enqueue(encoder.encode(JSON.stringify({ content: "", done: true }) + "\n"));
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

function generateDemoResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi ") || msg === "hi" || msg === "hello") {
    return "Hello! I'm ChatWise, your AI assistant. I can help you with writing, coding, research, creative tasks, and more. What can I help you with today?";
  }

  if (msg.includes("code") || msg.includes("program") || msg.includes("javascript") || msg.includes("python") || msg.includes("react")) {
    return `Great question about programming! Here's a helpful example:\n\n\`\`\`javascript\nfunction greet(name) {\n  return \`Hello, \${name}! Welcome to ChatWise.\`;\n}\n\nconsole.log(greet("Developer"));\n\`\`\`\n\nThis is a simple function that returns a greeting. You can adapt this pattern for your specific use case. Let me know if you'd like a more detailed example or have a specific programming problem you're trying to solve!`;
  }

  if (msg.includes("write") || msg.includes("essay") || msg.includes("blog") || msg.includes("content")) {
    return "I'd be happy to help you write content! Here's a quick framework I recommend:\n\n1. **Start with a hook** — Grab your reader's attention in the first sentence.\n2. **State your thesis** — What's the main point you want to convey?\n3. **Provide evidence** — Use examples, data, or stories to support your argument.\n4. **Address counterpoints** — Show you've considered other perspectives.\n5. **End with a call to action** — What should the reader do next?\n\nWould you like me to write a specific type of content? Just tell me the topic and format you're looking for!";
  }

  if (msg.includes("help") || msg.includes("what can you do")) {
    return "I'm ChatWise, and here's what I can help you with:\n\n- **💬 Chat & Conversation** — Ask me anything, brainstorm ideas, or just have a chat\n- **✍️ Writing** — Essays, emails, blog posts, creative writing\n- **💻 Coding** — Write, debug, and explain code in any language\n- **📚 Research** — Summarize topics, explain concepts, provide insights\n- **🧮 Analysis** — Break down problems, analyze data, think through decisions\n\nI'm powered by a streaming AI model, so you'll see my responses appear in real-time. What would you like to explore?";
  }

  if (msg.includes("thank")) {
    return "You're very welcome! 😊 I'm glad I could help. If you have any more questions or need further assistance, don't hesitate to ask. Have a great day!";
  }

  if (msg.includes("pricing") || msg.includes("cost") || msg.includes("price") || msg.includes("free")) {
    return "Great question about pricing! Here's what ChatWise offers:\n\n- **Free Tier** — 50 messages per day, access to GPT-4o-mini model\n- **Pro Tier ($20/mo)** — Unlimited messages, GPT-4o access, file uploads, priority support\n- **Team Tier ($50/mo)** — Everything in Pro, plus team workspaces, shared history, admin controls\n\nYou're currently on the **Free Tier**, which gives you plenty of messages to explore everything ChatWise can do!";
  }

  // Default thoughtful response
  return `That's a great question! Let me think about this carefully.\n\nBased on what you've shared, here are a few key points to consider:\n\n1. **Context matters** — The best approach depends on your specific situation and goals.\n2. **Start simple** — Begin with a straightforward solution and iterate from there.\n3. **Test and learn** — Try different approaches and see what works best.\n\nCould you share a bit more detail about what you're looking for? That way I can give you a more tailored and helpful response.`;
}
