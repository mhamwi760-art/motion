import type { FontFamily, LogoInput, ThemeColors, ThemeInput, ThemePreset } from "./types";

export interface Theme {
  colors: ThemeColors;
  fonts: { display: FontFamily; body: FontFamily; mono: FontFamily };
  radius: number;
  logo?: LogoInput;
  /** whether the background is dark — drives a few blend decisions */
  dark: boolean;
}

const PRESETS: Record<ThemePreset, Omit<Theme, "logo">> = {
  midnight: {
    colors: {
      bg: "#070B1A",
      bg2: "#141B3D",
      fg: "#F4F6FF",
      muted: "#8D96C2",
      accent: "#6C7BFF",
      accent2: "#2EE6C9",
      onAccent: "#070B1A",
    },
    fonts: { display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
    radius: 28,
    dark: true,
  },
  paper: {
    colors: {
      bg: "#F3EEE4",
      bg2: "#E6DDCB",
      fg: "#1B1916",
      muted: "#6E665A",
      accent: "#E8462B",
      accent2: "#1F4FD8",
      onAccent: "#FFF8EE",
    },
    fonts: { display: "DM Serif Display", body: "Inter", mono: "JetBrains Mono" },
    radius: 6,
    dark: false,
  },
  neon: {
    colors: {
      bg: "#050505",
      bg2: "#151515",
      fg: "#FAFAFA",
      muted: "#8A8A8A",
      accent: "#C6FF3D",
      accent2: "#FF3DA5",
      onAccent: "#050505",
    },
    fonts: { display: "Bricolage Grotesque", body: "Inter", mono: "JetBrains Mono" },
    radius: 999,
    dark: true,
  },
  sunset: {
    colors: {
      bg: "#2A0E2E",
      bg2: "#6B1D3C",
      fg: "#FFF3E8",
      muted: "#E7B9B0",
      accent: "#FF8A3D",
      accent2: "#FFD15C",
      onAccent: "#2A0E2E",
    },
    fonts: { display: "Bricolage Grotesque", body: "Inter", mono: "JetBrains Mono" },
    radius: 24,
    dark: true,
  },
  mono: {
    colors: {
      bg: "#0C0C0C",
      bg2: "#1C1C1C",
      fg: "#FFFFFF",
      muted: "#9A9A9A",
      accent: "#FFFFFF",
      accent2: "#BDBDBD",
      onAccent: "#0C0C0C",
    },
    fonts: { display: "Inter", body: "Inter", mono: "JetBrains Mono" },
    radius: 0,
    dark: true,
  },
  ocean: {
    colors: {
      bg: "#EAF4F7",
      bg2: "#CFE6EE",
      fg: "#06283D",
      muted: "#4C6B7C",
      accent: "#0A84FF",
      accent2: "#14B8A6",
      onAccent: "#FFFFFF",
    },
    fonts: { display: "Space Grotesk", body: "Inter", mono: "JetBrains Mono" },
    radius: 20,
    dark: false,
  },
};

const luminance = (hex: string) => {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const resolveTheme = (input: ThemeInput = {}): Theme => {
  const base = PRESETS[input.preset ?? "midnight"];
  const colors = { ...base.colors, ...input.colors };
  return {
    colors,
    fonts: { ...base.fonts, ...input.fonts },
    radius: input.radius ?? base.radius,
    logo: input.logo,
    dark: luminance(colors.bg) < 0.45,
  };
};

export const THEME_PRESETS = Object.keys(PRESETS) as ThemePreset[];

/** hex + alpha (0-1) → rgba() */
export const alpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
};
