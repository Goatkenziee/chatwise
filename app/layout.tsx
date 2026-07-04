import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatWise — AI Chat Assistant",
  description: "A modern AI chat assistant powered by OpenAI. Chat, code, create, and explore with intelligent conversation.",
  openGraph: {
    title: "ChatWise — AI Chat Assistant",
    description: "A modern AI chat assistant powered by OpenAI.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ ["--font-sans" as string]: "Inter, system-ui, sans-serif" }}>
      <body>{children}</body>
    </html>
  );
}
