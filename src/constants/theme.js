/**
 * Color and design tokens.
 *
 * Tailwind utilities are exposed via `@theme` in src/index.css (e.g. `bg-primary`,
 * `text-muted`, `shadow-card`). Use those for styling whenever possible.
 *
 * Only use the exports below when you need a literal value at runtime — for example,
 * passing colors into inline SVG `stroke`/`fill` attributes.
 */
export const COLORS = {
  primary: "#DB8B31",
  primarySoft: "rgba(219,139,49,0.9)",
  secondary: "#004D6C",
  dark: "#0e2c38",
  muted: "#86969c",
  mutedSoft: "#bfbbb7",
  divider: "#dfdddb",
  success: "#4caf50",
  warning: "#f57c00",
  danger: "#e53935",
};

export const DIFFICULTY = {
  colors: { 1: "#4caf50", 2: "#ffb74d", 3: "#f57c00", 4: "#e53935" },
  labels: { 1: "Fácil", 2: "Moderado", 3: "Difícil", 4: "Muito difícil" },
};
