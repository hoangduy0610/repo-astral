import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#070B1A", surface: "#11182D", primary: "#7C8CFF", accent: "#66E5FF" },
      fontFamily: { sans: ["var(--font-inter)"], display: ["var(--font-space)"], mono: ["var(--font-mono)"] }
    }
  },
  plugins: []
};
export default config;
