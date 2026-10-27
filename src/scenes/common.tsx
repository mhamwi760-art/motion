import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../backgrounds/Background";
import { clamp, drift, springAt } from "../engine/anim";
import { asset } from "../engine/asset";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { alpha } from "../engine/themes";
import type { BackgroundInput, LogoInput } from "../engine/types";

/** Safe-area padded, centred column. Applies a slow push-in so scenes never feel frozen. */
export const Stage: React.FC<{
  children: React.ReactNode;
  background?: BackgroundInput;
  align?: "center" | "left";
  justify?: "center" | "space-between" | "flex-end" | "flex-start";
  gap?: number;
  pushIn?: boolean;
}> = ({ children, background, align = "center", justify = "center", gap = 40, pushIn = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  return (
    <AbsoluteFill>
      {background && <Background bg={background} />}
      <AbsoluteFill
        style={{
          paddingTop: L.safe.top,
          paddingRight: L.safe.right,
          paddingBottom: L.safe.bottom,
          paddingLeft: L.safe.left,
          display: "flex",
          flexDirection: "column",
          alignItems: align === "center" ? "center" : "flex-start",
          justifyContent: justify,
          gap: gap * L.u,
          transform: pushIn ? `scale(${drift(frame, fps)})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** small uppercase label in a pill */
export const Kicker: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u } = useLayout();
  const theme = useTheme();
  const p = springAt(frame, fps, delay, "snappy");
  return (
    <div
      style={{
        fontFamily: fontStack(theme.fonts.mono),
        fontWeight: 600,
        fontSize: 30 * u,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: theme.colors.accent,
        border: `${2 * u}px solid ${alpha(theme.colors.accent, 0.5)}`,
        background: alpha(theme.colors.accent, 0.1),
        borderRadius: 999,
        padding: `${12 * u}px ${26 * u}px`,
        opacity: p,
        transform: `translateY(${(1 - p) * 20 * u}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** body copy that fades/rises in */
export const Body: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  align?: "center" | "left";
  maxWidth?: number;
}> = ({ text, delay = 0, size = 40, color, align = "center", maxWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const L = useLayout();
  const theme = useTheme();
  const p = springAt(frame, fps, delay, "smooth");
  return (
    <div
      style={{
        fontFamily: fontStack(theme.fonts.body),
        fontWeight: 450,
        fontSize: size * L.u,
        lineHeight: 1.35,
        color: color ?? theme.colors.muted,
        textAlign: align,
        maxWidth: maxWidth ?? L.contentW * 0.92,
        opacity: interpolate(p, [0, 0.6], [0, 1], clamp),
        transform: `translateY(${(1 - p) * 30 * L.u}px)`,
      }}
    >
      {text}
    </div>
  );
};

/** the logo as an element: image or text wordmark */
export const LogoMark: React.FC<{ logo?: LogoInput; scale?: number; style?: React.CSSProperties }> = ({
  logo,
  scale = 1,
  style,
}) => {
  const L = useLayout();
  const theme = useTheme();
  const short = Math.min(L.width, L.height);
  const w = short * (logo?.size ?? 0.42) * scale;
  if (logo?.src) {
    return <Img src={asset(logo.src)} style={{ width: w, height: "auto", display: "block", ...style }} />;
  }
  return (
    <div
      style={{
        fontFamily: fontStack(theme.fonts.display),
        fontWeight: 800,
        fontSize: w * 0.32,
        letterSpacing: "-0.04em",
        color: theme.colors.fg,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {logo?.text ?? "brand"}
    </div>
  );
};
