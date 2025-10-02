import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#62a9f0",   
        foreground: "#22252b",   // mörk text

        primary: {
          DEFAULT: "#1564cf",    // blå
        },
        secondary: {
          DEFAULT: "#d95c9c",    // rosa/lila
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#cc3333",    // röd
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f2f5f7",    // ljus neutral
          foreground: "#4a4f59",
        },
        accent: {
          DEFAULT: "#f7b500",    
          foreground: "#121f3b",
        },
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#22252b",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#22252b",
        },

        sidebar: {
          DEFAULT: "#fafafa",
          foreground: "#22252b",
          primary: "#2979ff",
          "primary-foreground": "#ffffff",
          accent: "#f7b500",
          "accent-foreground": "#22252b",
          border: "#d4dbe3",
          ring: "#2979ff",
        },

        // Shop-specific
        "shop-primary": "#2979ff",
        "shop-primary-light": "#a7c7ff",
        "shop-success": "#1e8c4d",
        "shop-warning": "#ffb31a",
        "shop-error": "#cc3333",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
