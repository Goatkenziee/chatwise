import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Demo responses for when no API key is configured
const DEMO_RESPONSES: Record<string, string> = {
  hello:
    "Hello! I'm ChatWise, your AI assistant. How can I help you today? Feel free to ask me anything — I can help with writing, coding, analysis, brainstorming, and more!",
  help: "I can help you with:\n\n- **Writing** — essays, emails, reports, creative writing\n- **Coding** — write, explain, debug, refactor code\n- **Analysis** — break down complex topics, compare ideas\n- **Brainstorming** — generate ideas, outline plans\n- **Learning** — explain concepts simply\n\nJust tell me what you need!",
  code: "Here's a quick example of a Python function that sorts files by extension:\n\n```python\nimport os\nimport shutil\nfrom pathlib import Path\n\ndef sort_files_by_extension(directory: str):\n    \"\"\"Sort files into folders by their extension.\"\"\"\n    directory = Path(directory)\n    \n    for file_path in directory.iterdir():\n        if file_path.is_file():\n            # Get the extension (without the dot)\n            ext = file_path.suffix[1:] if file_path.suffix else \"no_extension\"\n            # Create the target folder\n            target_dir = directory / ext\n            target_dir.mkdir(exist_ok=True)\n            # Move the file\n            shutil.move(str(file_path), str(target_dir / file_path.name))\n    \n    print(f\"Sorted files in {directory}\")\n\n# Usage\nsort_files_by_extension(\"/path/to/your/folder\")\n```\n\nThis creates folders named after file extensions (like `pdf`, `jpg`, `txt`) and moves each file into its matching folder. Want me to modify it for your specific use case?",
};

function getDemoResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase().trim();

  // Check for exact keywords
  for (const [key, response] of Object.entries(DEMO_RESPONSES)) {
    if (lower === key || lower.startsWith(key)) {
      return response;
    }
  }

  // Default contextual response
  if (lower.includes("?")) {
    return `Great question! Let me help you with that.

Here's what I can tell you about "${userMessage.slice(0, 60)}...":

This is the **demo mode** of ChatWise. To get full AI-powered responses, you'll need to add your OpenAI API key by setting the \`OPENAI_API_KEY\` environment variable in your Vercel project settings.

**In demo mode, I can still:**
- Answer general questions
- Provide code examples
- Explain concepts
- Help with writing

**To enable the full AI experience:**
1. Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add it as \`OPENAI_API_KEY\` in your Vercel project settings
3. Deploy and enjoy real GPT-4o-mini responses!

What else can I help you with?`;
  }

  return `That's an interesting topic! Let me share my thoughts on "${userMessage.slice(0, 80)}..."

**Note:** I'm running in demo mode right now. To get responses powered by GPT-4o-mini, add your \`OPENAI_API_KEY\` to the environment variables.

In the meantime, here are some things I can help with:
- Try asking me to **write code** in any language
- Ask me to **explain** a complex topic simply
- Request **creative writing** — stories, poems, scripts
- Ask for **analysis** or **comparisons**

What would you like to explore?`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body as { messages: ChatMessage[] };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1]?.content || "";

    // Check if OpenAI API key is configured
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // Demo mode — return a simulated streaming response
      const responseText = getDemoResponse(lastMessage);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          // Simulate token-by-token streaming
          const words = responseText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            controller.enqueue(encoder.encode(chunk));
            // Random delay between 10-50ms to simulate streaming
            await new Promise((resolve) =>
              setTimeout(resolve, 10 + Math.random() * 40)
            );
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Real OpenAI streaming
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are ChatWise, a helpful AI assistant. You provide clear, accurate, and well-formatted responses. Use markdown for formatting — code blocks, lists, tables, and headings where appropriate. Be concise but thorough.",
          },
          ...messages,
        ],
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return NextResponse.json(
        { error: `OpenAI API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Forward the streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n").filter((line) => line.trim());

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (error) {
          console.error("Stream error:", error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
