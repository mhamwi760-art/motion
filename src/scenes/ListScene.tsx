import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, progress, springAt } from "../engine/anim";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { RichText } from "../engine/RichText";
import { alpha } from "../engine/themes";
import type { ListScene as T } from "../engine/types";
import { Stage } from "./common";

export const ListScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const n = scene.items.length;
  const titleH = scene.title ? L.contentH * (L.landscape ? 0.22 : 0.2) : 0;
  const listH = L.contentH - titleH - 60 * L.u;
  const rowH = listH / n;
  const itemSize = Math.min((L.landscape ? 66 : 58) * L.u, rowH * 0.36);
  const start = scene.title ? fps * 0.5 : fps * 0.1;
  const gapF = fps * 0.35;
  const width = L.landscape ? L.contentW * 0.78 : L.contentW;

  return (
    <Stage background={scene.background} gap={60} align="center">
      {scene.title && (
        <RichText text={scene.title} maxW={width} maxH={titleH} maxSize={110} anim="rise" split="word" align="left" />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: itemSize * 0.55, width }}>
        {scene.items.map((item, i) => {
          const d = start + i * gapF;
          const p = springAt(frame, fps, d, "snappy");
          const bar = progress(frame, d + 4, d + fps * 0.5);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: itemSize * 0.6,
                opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
                transform: `translateX(${(1 - p) * 80 * L.u}px)`,
              }}
            >
              <div
                style={{
                  flex: "none",
                  width: itemSize * 1.5,
                  height: itemSize * 1.5,
                  borderRadius: Math.min(theme.radius * L.u, itemSize),
                  background: alpha(theme.colors.accent, 0.14),
                  border: `${2 * L.u}px solid ${alpha(theme.colors.accent, 0.55)}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fontStack(theme.fonts.mono),
                  fontWeight: 700,
                  fontSize: itemSize * 0.62,
                  color: theme.colors.accent,
                  transform: `scale(${springAt(frame, fps, d, "bouncy")})`,
                }}
              >
                {scene.numbered === false ? <Check size={itemSize * 0.7} color={theme.colors.accent} p={bar} /> : i + 1}
              </div>
              <div
                style={{
                  fontFamily: fontStack(theme.fonts.body),
                  fontWeight: 600,
                  fontSize: itemSize,
                  lineHeight: 1.18,
                  color: theme.colors.fg,
                  letterSpacing: "-0.01em",
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

const Check: React.FC<{ size: number; color: string; p: number }> = ({ size, color, p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12.5l5 5L20 6.5"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  </svg>
);
