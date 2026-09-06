import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cream: {
          DEFAULT: "#F7F4EE",
          light: "#FDFCF9",
          soft: "#FAF7F0",
          dark: "#ECE5D8",
          card: "#FFFFFF",
          border: "#E2D9C8",
          muted: "#D8CCB5",
        },
        brown: {
          DEFAULT: "#5C3A21",
          light: "#8C6239",
          warm: "#A27B5C",
          dark: "#3D2413",
          deep: "#24140A",
          espresso: "#1A0E07",
          border: "#795548",
          hover: "#4A2E1A",
        },
        bizarre: {
          orange: "#5C3A21", // Re-mapped to luxury warm brown
          orangeHover: "#3D2413",
          dark: "#141414",
          card: "#FFFFFF",
          gray: "#F5F2EB",
          border: "#E2D9C8",
          yellow: "#A27B5C",
        },
        luxury: {
          dark: "#F7F4EE",
          card: "#FFFFFF",
          border: "#E2D9C8",
          gold: {
            DEFAULT: "#8C6239",
            light: "#FAF7F0",
            hover: "#5C3A21",
            muted: "rgba(140, 98, 57, 0.15)",
          },
          emerald: {
            DEFAULT: "#2D5A27",
            dark: "#1E3F1A",
            muted: "rgba(45, 90, 39, 0.15)",
          },
          charcoal: "#24140A",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FDFCF9 0%, #FAF7F0 50%, #ECE5D8 100%)",
        "brown-gradient": "linear-gradient(135deg, #8C6239 0%, #5C3A21 50%, #3D2413 100%)",
        "dark-brown-gradient": "linear-gradient(135deg, #3D2413 0%, #24140A 50%, #141414 100%)",
        "cream-gradient": "linear-gradient(180deg, #FDFCF9 0%, #F7F4EE 100%)",
        "card-gradient": "linear-gradient(145deg, #FFFFFF 0%, #FAF7F0 100%)",
      },
      boxShadow: {
        "brown-glow": "0 0 25px -5px rgba(92, 58, 33, 0.25)",
        "card-soft": "0 4px 20px -2px rgba(36, 20, 10, 0.06)",
        "card-hover": "0 10px 25px -5px rgba(36, 20, 10, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
