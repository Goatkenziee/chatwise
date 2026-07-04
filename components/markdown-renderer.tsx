"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      if (match) {
        return (
          <div className="my-4 rounded-lg overflow-hidden border border-white/10">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
              <span className="text-xs text-white/40 font-mono">{match[1]}</span>
              <button
                onClick={() => navigator.clipboard.writeText(codeString)}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Copy
              </button>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, borderRadius: 0, background: "transparent", fontSize: "0.875rem" }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    pre({ children }) {
      return <>{children}</>;
    },
    p({ children }) {
      return <p className="mb-4 leading-relaxed">{children}</p>;
    },
    ul({ children }) {
      return <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>;
    },
    h1({ children }) {
      return <h1 className="text-2xl font-semibold mb-4 mt-6">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mb-2 mt-4">{children}</h3>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-2 border-white/20 pl-4 my-4 italic text-white/60">
          {children}
        </blockquote>
      );
    },
    a({ children, href }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          {children}
        </a>
      );
    },
  };

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
