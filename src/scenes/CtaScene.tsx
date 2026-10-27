import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, progress, springAt, staggerFor } from "../engine/anim";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { parseRich, RichText } from "../engine/RichText";
import { alpha } from "../engine/themes";
import type { CtaScene as T } from "../engine/types";
import { Body, LogoMark, Stage } from "./common";

export const CtaScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const hasLogo = (scene.showLogo ?? true) && theme.logo;
  const textDelay = hasLogo ? fps * 0.25 : 0;
  const words = parseRich(scene.text).flat().length;
  const btnDelay = textDelay + words * staggerFor("rise", "word", fps) + fps * 0.15;
  const logoP = springAt(frame, fps, 0, "smooth");

  return (
    <Stage background={scene.background} gap={52}>
      {hasLogo && (
        <div style={{ opacity: logoP, transform: `translateY(${(1 - logoP) * -30 * L.u}px)` }}>
          <LogoMark logo={theme.logo} scale={0.55} />
        </div>
      )}
      <RichText text={scene.text} delay={textDelay} maxSize={L.landscape ? 130 : 140} maxH={L.contentH * 0.38} />
      {scene.button && <Button label={scene.button} delay={btnDelay} />}
      {(scene.url || scene.handle) && (
        <Body
          text={[scene.url, scene.handle].filter(Boolean).join("   ·   ")}
          delay={btnDelay + fps * 0.3}
          size={38}
        />
      )}
    </Stage>
  );
};

/** pill button: pops in, shimmer sweep, then a "press" */
const Button: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const p = springAt(frame, fps, delay, "bouncy");
  const shine = progress(frame, delay + fps * 0.4, delay + fps * 1.1);
  const pressAt = delay + fps * 1.3;
  const press = interpolate(frame, [pressAt, pressAt + 4, pressAt + 10], [1, 0.93, 1], clamp);
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: fontStack(theme.fonts.body),
        fontWeight: 700,
        fontSize: 46 * L.u,
        color: theme.colors.onAccent,
        background: theme.colors.accent,
        borderRadius: Math.min(theme.radius * L.u * 1.5, 999),
        padding: `${30 * L.u}px ${64 * L.u}px`,
        boxShadow: `0 ${20 * L.u}px ${60 * L.u}px ${alpha(theme.colors.accent, 0.45)}`,
        opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
        transform: `scale(${(0.5 + p * 0.5) * press})`,
        whiteSpace: "nowrap",
      }}
    >
      {label}  →
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          left: `${-50 + shine * 160}%`,
          background: `linear-gradient(100deg, transparent, ${alpha("#FFFFFF", 0.45)}, transparent)`,
          transform: "skewX(-20deg)",
        }}
      />
    </div>
  );
};
