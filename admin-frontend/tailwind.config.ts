import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--bg))",
        foreground: "hsl(var(--text))",
        surface: "hsl(var(--surface))",
        primary: "hsl(var(--primary))",
        danger: "hsl(var(--danger))",
        muted: "hsl(var(--text-muted))",
        faint: "hsl(var(--text-faint))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
