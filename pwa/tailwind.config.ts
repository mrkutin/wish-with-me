import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        'background-card': "var(--background-card)",
        'background-alt': "var(--background-alt)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        'text-primary': "var(--text-primary)",
        'text-secondary': "var(--text-secondary)",
        primary: {
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#6366F1"
        },
        error: "var(--error)",
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config; 