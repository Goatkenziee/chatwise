import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatWise — AI Chat Assistant",
  description: "A modern AI chat assistant. Chat, code, create, and explore with intelligent conversation.",
  openGraph: {
    title: "ChatWise — AI Chat Assistant",
    description: "A modern AI chat assistant.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
