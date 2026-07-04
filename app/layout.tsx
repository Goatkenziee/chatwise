import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChatWise — AI Chat Assistant",
  description:
    "ChatWise is an intelligent AI chat assistant powered by GPT. Ask questions, get code, brainstorm ideas, and more.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%233b82f6'/><text x='16' y='22' text-anchor='middle' fill='white' font-size='18' font-weight='bold'>CW</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
