"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#282c34] rounded-t-lg border-b border-[#3e4451]">
        <span className="text-xs text-[#abb2bf]">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-[#3e4451] transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#abb2bf]" />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyles={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
          fontSize: "0.8125rem",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const value = String(children).replace(/\n$/, "");
          if (match) {
            return <CodeBlock language={match[1]} value={value} />;
          }
          return (
            <code className="prose-code" {...props}>
              {children}
            </code>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}