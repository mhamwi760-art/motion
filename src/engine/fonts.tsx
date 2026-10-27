import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/dm-serif-display";
import "@fontsource-variable/jetbrains-mono";
import React, { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { FontFamily } from "./types";

/** CSS family names as registered by the @fontsource packages (bundled — no network needed). */
const CSS_FAMILY: Record<FontFamily, string> = {
  Inter: "Inter Variable",
  "Space Grotesk": "Space Grotesk Variable",
  "Bricolage Grotesque": "Bricolage Grotesque Variable",
  "DM Serif Display": "DM Serif Display",
  "JetBrains Mono": "JetBrains Mono Variable",
};

const FALLBACK = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export const fontStack = (f: FontFamily) => `"${CSS_FAMILY[f]}", ${FALLBACK}`;

/**
 * Renders children only once the fonts are loaded, so text measurement
 * (auto-fitting titles) never runs against fallback fonts.
 */
export const FontGate: React.FC<{ families: FontFamily[]; children: React.ReactNode }> = ({
  families,
  children,
}) => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  const [ready, setReady] = useState(false);
  const key = families.join("|");

  useEffect(() => {
    const unique = Array.from(new Set(key.split("|"))) as FontFamily[];
    const loads = unique.flatMap((f) =>
      [400, 600, 800].map((w) => document.fonts.load(`${w} 64px "${CSS_FAMILY[f]}"`)),
    );
    Promise.all(loads)
      .catch(() => undefined)
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [key, handle]);

  return ready ? <>{children}</> : null;
};
