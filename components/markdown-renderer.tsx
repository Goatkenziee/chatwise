"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypePrism from "rehype-prism-plus";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

function CodeBlock({ language, children }: { language?: string; children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border bg-code-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
        <span className="text-[11px] text-muted-foreground/60 font-mono uppercase">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-3 overflow-x-auto text-sm leading-relaxed">
        <code className={`language-${language || "text"}`}>{children}</code>
      </pre>
    </div>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;
    if (isInline) {
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-code-bg text-sm font-mono text-foreground/90"
          {...props}
        >
          {children}
        </code>
      );
    }
    return <CodeBlock language={match[1]}>{String(children).replace(/\n$/, "")}</CodeBlock>;
  },
  pre({ children }) {
    return <>{children}</>;
  },
  p({ children }) {
    return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
  },
  ul({ children }) {
    return <ul className="mb-3 list-disc pl-5 space-y-1">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="mb-3 list-decimal pl-5 space-y-1">{children}</ol>;
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  h1({ children }) {
    return <h1 className="text-lg font-semibold mb-3 mt-5 first:mt-0">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-base font-semibold mb-2 mt-4 first:mt-0">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-sm font-semibold mb-2 mt-3 first:mt-0">{children}</h3>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-foreground/20 pl-4 my-3 text-muted-foreground italic">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground underline underline-offset-2 decoration-foreground/20 hover:decoration-foreground/60 transition-all"
      >
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-3 rounded-xl border border-border">
        <table className="w-full text-sm">{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th className="px-3 py-2 text-left font-medium bg-muted/30 border-b border-border">{children}</th>;
  },
  td({ children }) {
    return <td className="px-3 py-2 border-b border-border last:border-0">{children}</td>;
  },
  hr() {
    return <hr className="my-4 border-border" />;
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypePrism]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
