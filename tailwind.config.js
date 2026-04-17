/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  // Safelist dynamic badge colour classes selected at runtime via TAG_STYLES lookup
  safelist: [
    // BEARISH PRICE
    'bg-red-500/15', 'text-red-400', 'border-red-500/30',
    // BULLISH PRICE
    'bg-green-500/15', 'text-green-400', 'border-green-500/30',
    // BEARISH MARGIN
    'bg-orange-500/15', 'text-orange-400', 'border-orange-500/30',
    // WATCH
    'bg-amber-500/15', 'text-amber-400', 'border-amber-500/30',
    // NEUTRAL
    'bg-zinc-700/40', 'text-zinc-400', 'border-zinc-600/30',
    // Loading state badge
    'bg-zinc-800', 'text-zinc-600', 'border-zinc-700',
  ],
  plugins: [],
}

