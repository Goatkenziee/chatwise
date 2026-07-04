import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0c0c",
        foreground: "#e8e8e8",
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#888888",
        },
        card: {
          DEFAULT: "#141414",
          hover: "#1c1c1c",
        },
        border: "#222222",
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "monospace"],
      },
      typography: {
        invert: {
          css: {
            "--tw-prose-body": "#d4d4d4",
            "--tw-prose-headings": "#e8e8e8",
            "--tw-prose-links": "#3b82f6",
            "--tw-prose-bold": "#e8e8e8",
            "--tw-prose-counters": "#888888",
            "--tw-prose-bullets": "#555555",
            "--tw-prose-hr": "#222222",
            "--tw-prose-quotes": "#d4d4d4",
            "--tw-prose-quote-borders": "#333333",
            "--tw-prose-captions": "#888888",
            "--tw-prose-code": "#3b82f6",
            "--tw-prose-pre-code": "#e8e8e8",
            "--tw-prose-pre-bg": "#1a1a1a",
            "--tw-prose-th-borders": "#333333",
            "--tw-prose-td-borders": "#222222",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
