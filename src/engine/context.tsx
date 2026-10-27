import React, { createContext, useContext } from "react";
import { useVideoConfig } from "remotion";
import { FORMATS, type Format } from "./formats";
import type { Theme } from "./themes";
import type { FormatId } from "./types";

interface EngineCtx {
  theme: Theme;
  format: Format;
}

const Ctx = createContext<EngineCtx | null>(null);

export const EngineProvider: React.FC<{ theme: Theme; formatId: FormatId; children: React.ReactNode }> = ({
  theme,
  formatId,
  children,
}) => <Ctx.Provider value={{ theme, format: FORMATS[formatId] }}>{children}</Ctx.Provider>;

export const useTheme = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme outside EngineProvider");
  return c.theme;
};

/**
 * Layout numbers for the current format. `u` is a unit that equals 1px
 * on a 1080px short side, so sizes written as `n * u` scale to every format.
 */
export const useLayout = () => {
  const c = useContext(Ctx);
  const { width, height } = useVideoConfig();
  if (!c) throw new Error("useLayout outside EngineProvider");
  const short = Math.min(width, height);
  const u = short / 1080;
  const s = c.format.safe;
  const contentW = width - s.left - s.right;
  const contentH = height - s.top - s.bottom;
  return {
    width,
    height,
    u,
    safe: s,
    contentW,
    contentH,
    portrait: height > width * 1.2,
    landscape: width > height * 1.2,
    format: c.format,
  };
};
