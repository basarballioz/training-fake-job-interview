import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "Consolas", "Monaco", "monospace"],
        sans: ["var(--font-sans)", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        terminal: {
          bg: "#0a0e0a",
          surface: "#0f1a0f",
          border: "#1a3a1a",
          green: "#00ff41",
          "green-dim": "#00cc33",
          "green-muted": "#005515",
          amber: "#ffb700",
          red: "#ff3333",
          "red-dim": "#cc0000",
          cyan: "#00d4ff",
          gray: "#4a5a4a",
          "gray-light": "#8a9a8a",
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "scan-line": "scan-line 4s linear infinite",
        "type-in": "type-in 0.05s steps(1) forwards",
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glitch": "glitch 0.3s linear infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "scan-line": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        glitch: {
          "0%, 100%": { clipPath: "inset(40% 0 61% 0)", transform: "translate(-2px)" },
          "20%": { clipPath: "inset(92% 0 1% 0)", transform: "translate(2px)" },
          "40%": { clipPath: "inset(43% 0 1% 0)", transform: "translate(-2px)" },
          "60%": { clipPath: "inset(25% 0 58% 0)", transform: "translate(2px)" },
          "80%": { clipPath: "inset(54% 0 7% 0)", transform: "translate(-2px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
