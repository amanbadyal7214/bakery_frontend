import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        fredoka: ["Fredoka", "sans-serif"],
        dancing: ["Dancing Script", "cursive"],
        lora: ["Lora", "serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        hepta: ["Hepta Slab", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cream: "hsl(var(--cream))",
        chocolate: "hsl(var(--chocolate))",
        "chocolate-light": "hsl(var(--chocolate-light))",
        strawberry: "hsl(var(--strawberry))",
        "strawberry-light": "hsl(var(--strawberry-light))",
        vanilla: "hsl(var(--vanilla))",
        caramel: "hsl(var(--caramel))",
        "caramel-light": "hsl(var(--caramel-light))",
        mint: "hsl(var(--mint))",
        blueberry: "hsl(var(--blueberry))",
        /* Panbread landing page tokens */
        navy:    "#1A2744",
        "navy-lt": "#2C3D6B",
        gold:    "#C9952A",
        parchment: "#F5EAD0",
        "bread-brown": "#6B3A2A",
        "bread-dark":  "#3D1F14",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        bakery: "1.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "cookie-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-6px) rotate(-3deg)" },
          "50%": { transform: "translateY(-2px) rotate(2deg)" },
          "75%": { transform: "translateY(-4px) rotate(-1deg)" },
        },
        "float-up": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float-a": {
          "0%, 100%": { transform: "translate(-50%, -50%) rotate(-8deg) translateY(0px)" },
          "50%":       { transform: "translate(-50%, -50%) rotate(-8deg) translateY(-18px)" },
        },
        "float-b": {
          "0%, 100%": { transform: "rotate(15deg) translateY(0px)" },
          "50%":       { transform: "rotate(15deg) translateY(-12px)" },
        },
        "float-c": {
          "0%, 100%": { transform: "rotate(-12deg) translateY(0px)" },
          "50%":       { transform: "rotate(-12deg) translateY(-10px)" },
        },
        "spin-slow": {
          "from": { transform: "rotate(0deg)" },
          "to":   { transform: "rotate(360deg)" },
        },
        "bob": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "cookie-bounce": "cookie-bounce 0.5s ease",
        "float-up": "float-up 3s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-up": "fade-up 0.9s ease both",
        "float-a": "float-a 4s ease-in-out infinite",
        "float-b": "float-b 5s ease-in-out infinite 0.5s",
        "float-c": "float-c 4.5s ease-in-out infinite 1s",
        "spin-slow": "spin-slow 20s linear infinite",
        "bob": "bob 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
