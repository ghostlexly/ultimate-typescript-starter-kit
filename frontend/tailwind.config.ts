import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import headlessUi from "@headlessui/tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
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
      colors: {
        black: "#232938",

        // 👇 shadcn/ui
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
      },
      borderRadius: {
        // 👇 shadcn/ui
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.25" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },

        fade: {
          "0%, 80%, 100%": { opacity: "0" },
          "40%": { opacity: "1" },
        },

        // 👇 aceternity/ui
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },

        // 👇 magicui
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },

        // 👇 shadcn/ui
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        ripple: "ripple 1s linear",
        fade: "fade 1s ease-in-out infinite",

        // 👇 aceternity/ui
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",

        // 👇 magicui
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",

        // 👇 shadcn/ui
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        paytone: ["var(--font-paytone)"],
        aeonikPro: ["var(--font-aeonikpro)"],
        hole: ["var(--font-hole)"],
        gothic: ["var(--font-gothic)"],
        steven: ["var(--font-steven)"],
        libre_franklin: ["var(--font-libre_franklin)"],
        visbycfMedium: ["var(--font-visbycf-medium)"],
        visbycfBold: ["var(--font-visbycf-bold)"],
      },

      // 👇 typography plugin
      typography: ({ theme }) => ({
        ghost: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-lead": "hsl(var(--foreground))",
            "--tw-prose-links": "hsl(var(--primary))",
            "--tw-prose-bold": "hsl(var(--foreground))",
            "--tw-prose-counters": "hsl(var(--foreground))",
            "--tw-prose-bullets": "hsl(var(--foreground))",
            "--tw-prose-hr": "hsl(var(--foreground))",
            "--tw-prose-quotes": "hsl(var(--foreground))",
            "--tw-prose-quote-borders": "hsl(var(--foreground))",
            "--tw-prose-captions": "hsl(var(--foreground))",
            "--tw-prose-code": "hsl(var(--foreground))",
            // "--tw-prose-pre-code": "hsl(var(--foreground))",
            // "--tw-prose-pre-bg": "hsl(var(--foreground))",
            "--tw-prose-th-borders": "hsl(var(--foreground))",
            "--tw-prose-td-borders": "hsl(var(--foreground))",
          },
        },
      }),
    },
  },
  safelist: [],
  darkMode: "selector",

  plugins: [tailwindcssAnimate, headlessUi, typography],
};

export default config;
