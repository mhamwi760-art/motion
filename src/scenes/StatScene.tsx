import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, springAt } from "../engine/anim";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { alpha } from "../engine/themes";
import type { StatScene as T } from "../engine/types";
import { Body, Stage } from "./common";

export const StatScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const countEnd = fps * 1.5;
  const t = interpolate(frame, [fps * 0.1, countEnd], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const from = scene.from ?? 0;
  const value = from + (scene.value - from) * t;
  const decimals = scene.decimals ?? (Number.isInteger(scene.value) ? 0 : 1);
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const text = `${scene.prefix ?? ""}${formatted}${scene.suffix ?? ""}`;
  const finalText = `${scene.prefix ?? ""}${scene.value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${scene.suffix ?? ""}`;

  const ring = scene.ring ?? false;
  const short = Math.min(L.width, L.height);
  const ringSize = short * (L.landscape ? 0.62 : 0.68);
  // size the number from its FINAL length so it doesn't jump while counting
  const box = ring ? ringSize * 0.66 : L.contentW;
  const size = Math.min((box / Math.max(2, finalText.length)) * 1.75, (ring ? 200 : 300) * L.u);
  const pop = springAt(frame, fps, 0, "bouncy");
  const settle = springAt(frame, fps, countEnd, "bouncy");

  const number = (
    <div
      style={{
        fontFamily: fontStack(theme.fonts.display),
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        fontVariantNumeric: "tabular-nums",
        color: theme.colors.fg,
        transform: `scale(${(0.6 + pop * 0.4) * (1 + Math.sin(settle * Math.PI) * 0.06)})`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );

  return (
    <Stage background={scene.background} gap={50}>
      {ring ? (
        <div style={{ position: "relative", width: ringSize, height: ringSize, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={ringSize} height={ringSize} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx={ringSize / 2} cy={ringSize / 2} r={ringSize * 0.45} fill="none" stroke={alpha(theme.colors.fg, 0.1)} strokeWidth={ringSize * 0.05} />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringSize * 0.45}
              fill="none"
              stroke={theme.colors.accent}
              strokeWidth={ringSize * 0.05}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - Math.min(100, Math.max(0, value))}
            />
          </svg>
          {number}
        </div>
      ) : (
        number
      )}
      {scene.label && <Body text={scene.label} delay={fps * 0.6} size={L.landscape ? 44 : 50} color={theme.colors.fg} />}
    </Stage>
  );
};
