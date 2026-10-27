import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { asset } from "../engine/asset";
import { useLayout, useTheme } from "../engine/context";
import { alpha } from "../engine/themes";
import type { BackgroundInput } from "../engine/types";

export const Background: React.FC<{ bg?: BackgroundInput }> = ({ bg = { type: "orbs" } }) => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ background: colors.bg, overflow: "hidden" }}>
      {bg.type === "orbs" && <Orbs intensity={bg.intensity ?? 1} />}
      {bg.type === "grid" && <Grid perspective={bg.perspective ?? false} />}
      {bg.type === "gradient" && <Gradient angle={bg.angle ?? 135} />}
      {bg.type === "dots" && <Dots />}
      {bg.type === "image" && <ImageBg src={bg.src} dim={bg.dim ?? 0.45} />}
      <Vignette />
    </AbsoluteFill>
  );
};

const Orbs: React.FC<{ intensity: number }> = ({ intensity }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { colors, dark } = useTheme();
  const t = frame / 240;
  const blobs = [
    { c: colors.accent, s: 0.9, seed: "a", x: 0.2, y: 0.25 },
    { c: colors.accent2, s: 0.75, seed: "b", x: 0.85, y: 0.7 },
    { c: colors.bg2, s: 1.2, seed: "c", x: 0.6, y: 0.15 },
  ];
  const big = Math.max(width, height);
  return (
    <AbsoluteFill>
      {blobs.map((b) => {
        const x = (b.x + noise2D(b.seed + "x", t, 0) * 0.22) * width;
        const y = (b.y + noise2D(b.seed + "y", 0, t) * 0.22) * height;
        const r = big * 0.45 * b.s;
        return (
          <div
            key={b.seed}
            style={{
              position: "absolute",
              left: x - r,
              top: y - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(b.c, (dark ? 0.42 : 0.3) * intensity)} 0%, ${alpha(b.c, 0)} 65%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Grid: React.FC<{ perspective: boolean }> = ({ perspective }) => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const { colors, dark } = useTheme();
  const cell = 90 * u;
  const offset = (frame * 0.6 * u) % cell;
  const line = alpha(colors.fg, dark ? 0.07 : 0.08);
  const grid = (
    <div
      style={{
        position: "absolute",
        inset: perspective ? "-50% -50% -10% -50%" : -cell,
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${cell}px ${cell}px`,
        backgroundPosition: `0 ${offset}px`,
      }}
    />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${alpha(colors.accent, dark ? 0.25 : 0.15)}, transparent 60%)`,
        }}
      />
      {perspective ? (
        <AbsoluteFill style={{ perspective: 900 * u, perspectiveOrigin: "50% 20%" }}>
          <AbsoluteFill style={{ transform: "rotateX(62deg)", transformOrigin: "50% 100%" }}>{grid}</AbsoluteFill>
        </AbsoluteFill>
      ) : (
        grid
      )}
    </AbsoluteFill>
  );
};

const Gradient: React.FC<{ angle: number }> = ({ angle }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const a = angle + Math.sin(frame / 90) * 12;
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${a}deg, ${colors.bg} 0%, ${colors.bg2} 55%, ${alpha(colors.accent, 0.55)} 130%)`,
      }}
    />
  );
};

const Dots: React.FC = () => {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const { colors, dark } = useTheme();
  const gap = 46 * u;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `radial-gradient(${alpha(colors.fg, dark ? 0.16 : 0.18)} ${2.2 * u}px, transparent ${2.6 * u}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${(frame * 0.4 * u) % gap}px ${(frame * 0.25 * u) % gap}px`,
      }}
    />
  );
};

const ImageBg: React.FC<{ src: string; dim: number }> = ({ src, dim }) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  return (
    <AbsoluteFill>
      <Img src={asset(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + frame * 0.0004})` }} />
      <AbsoluteFill style={{ background: alpha(colors.bg, dim) }} />
    </AbsoluteFill>
  );
};

const Vignette: React.FC = () => {
  const { colors, dark } = useTheme();
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, transparent 55%, ${alpha(colors.bg, dark ? 0.75 : 0.45)} 100%)`,
      }}
    />
  );
};

/** animated film grain — SVG turbulence re-seeded every 2 frames */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  const { dark } = useTheme();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: dark ? "screen" : "multiply", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
