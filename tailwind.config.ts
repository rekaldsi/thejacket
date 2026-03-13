import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "jacket-black": "#0d0d0d",
        "jacket-red": "#dc2626",
        "jacket-amber": "#f59e0b",
        "jacket-white": "#f5f4f0",
        "jacket-gray": "#2a2a2a",
        "jacket-border": "#333333"
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};

export default config;
