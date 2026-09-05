import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "media",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sistema visual oscuro de toda la app (no exclusivo de auth) — introducido en /login y /registro.
        bg: "#14131f",
        surface: "oklch(0.25 0.03 288)",
        "surface-2": "oklch(0.2 0.025 288)",
        border: "oklch(0.34 0.03 288 / 70%)",
        "border-2": "oklch(0.36 0.03 288)",
        accent: "oklch(0.72 0.15 255)",
        "accent-hover": "oklch(0.78 0.15 255)",
        "accent-ink": "oklch(0.14 0.02 288)",
        ink: "oklch(0.96 0.006 288)",
        muted: "oklch(0.65 0.02 288)",
        label: "oklch(0.78 0.015 288)",
        placeholder: "oklch(0.5 0.02 288)",
        success: "oklch(0.72 0.15 165)",
        "success-bg": "oklch(0.72 0.15 165 / 16%)",
        danger: "oklch(0.7 0.15 25)",
        "danger-bg": "oklch(0.7 0.15 25 / 16%)",
        "muted-bg": "oklch(0.65 0.02 288 / 18%)",
        "blob-violet": "oklch(0.5 0.09 288 / 45%)",
        "blob-blue": "oklch(0.55 0.11 255 / 40%)",
      },
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
        sans: ["var(--font-karla)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
