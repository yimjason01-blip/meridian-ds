/** @type {import('tailwindcss').Config} */
// Meridian Design System — Tailwind config
// Tokens mirror src/tokens/tokens.json (DTCG). CSS vars live in src/index.css.
// Do not add colors here directly; edit tokens.json and regenerate via scripts/build-tokens.mjs
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces (luminance-stepped)
        bg: "var(--bg)",
        "bg-panel": "var(--bg-panel)",
        "bg-surface": "var(--bg-surface)",
        "bg-hover": "var(--bg-hover)",
        // Text roles
        text: "var(--text)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        // Accent
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-bright": "var(--accent-bright)",
        "accent-tint": "var(--accent-tint)",
        // Status (data-viz only)
        "status-ok": "var(--status-ok)",
        "status-ok-bright": "var(--status-ok-bright)",
        "status-warn": "var(--status-warn)",
        "status-crit": "var(--status-crit)",
        // Borders
        "border-subtle": "var(--border-subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
      },
      fontFamily: {
        sans: ["InterVariable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Role-keyed scale — use via semantic classes, not raw sizes
        caption: ["12px", { letterSpacing: "0", fontWeight: "510" }],
        ui: ["13px", { letterSpacing: "-0.130px", fontWeight: "510" }],
        body: ["15px", { letterSpacing: "-0.165px", fontWeight: "400" }],
        "body-lg": ["18px", { letterSpacing: "-0.165px", fontWeight: "400" }],
        h3: ["20px", { letterSpacing: "-0.240px", fontWeight: "590" }],
        h2: ["24px", { letterSpacing: "-0.288px", fontWeight: "510" }],
        h1: ["32px", { letterSpacing: "-0.704px", fontWeight: "510" }],
        display: ["48px", { letterSpacing: "-1.056px", fontWeight: "510" }],
      },
      spacing: {
        // 4px base — clinical density
        0.5: "2px",
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        14: "56px",
        18: "72px",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        card: "8px",
        lg: "12px",
        pill: "9999px",
      },
      fontWeight: {
        // Linear's three-weight system — no 700
        normal: "400",
        ui: "510",
        strong: "590",
      },
    },
  },
  plugins: [],
};
