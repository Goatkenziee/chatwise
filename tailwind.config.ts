import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.4s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(12px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in": {
          from: {
            opacity: "0",
            transform: "translateX(-16px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      colors: {
        background: "var(--bg)",
        foreground: "var(--foreground)",
        muted: {
          foreground: "var(--muted-foreground)",
        },
        border: "var(--border)",
        accent: "var(--accent)",
        ring: "var(--ring)",
        sidebar: {
          bg: "var(--sidebar-bg)",
        },
        "chat-bg": "var(--chat-bg)",
        "input-bg": "var(--input-bg)",
        "user-bubble": "var(--user-bubble)",
        "code-bg": "var(--code-bg)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
