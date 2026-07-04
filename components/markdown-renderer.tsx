"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:text-foreground/90 prose-ul:my-2 prose-ol:my-2 prose-p:my-1.5 prose-headings:my-3 leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");
            
            if (match) {
              return (
                <div className="relative group my-3">
                  <div className="absolute right-3 top-2 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    {match[1]}
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.75rem",
                      padding: "1.25rem 1rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      background: "hsl(240 10% 6%)",
                      border: "1px solid hsl(240 6% 16%)",
                    }}
                  >
                    {codeStr}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            return <div>{children}</div>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {children}
              </a>
            );
          },
          ul({ children }) {
            return <ul className="space-y-1">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="space-y-1">{children}</ol>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground my-3">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="border-border my-4" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
