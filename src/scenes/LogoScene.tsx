import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, progress, springAt } from "../engine/anim";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { alpha } from "../engine/themes";
import type { LogoScene as T } from "../engine/types";
import { Body, LogoMark, Stage } from "./common";

export const LogoScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const logo = scene.logo ?? theme.logo ?? { text: "brand" };
  const style = scene.style ?? (logo.src ? "burst" : "type");
  const L = useLayout();

  let mark: React.ReactNode;
  switch (style) {
    case "burst": {
      const p = springAt(frame, fps, fps * 0.15, "bouncy");
      mark = (
        <div style={{ transform: `scale(${p})`, opacity: interpolate(p, [0, 0.3], [0, 1], clamp) }}>
          <LogoMark logo={logo} />
        </div>
      );
      break;
    }
    case "mask": {
      const p = progress(frame, 0, fps * 0.9);
      const s = springAt(frame, fps, 0, "heavy");
      mark = (
        <div style={{ clipPath: `circle(${p * 75}% at 50% 50%)`, transform: `scale(${1.25 - s * 0.25})` }}>
          <LogoMark logo={logo} />
        </div>
      );
      break;
    }
    case "scale": {
      const p = progress(frame, 0, fps * 1.1);
      mark = (
        <div style={{ opacity: p, filter: `blur(${(1 - p) * 30 * L.u}px)`, transform: `scale(${1.6 - p * 0.6})` }}>
          <LogoMark logo={logo} />
        </div>
      );
      break;
    }
    case "slices": {
      const n = 6;
      mark = (
        <div style={{ position: "relative" }}>
          <div style={{ visibility: "hidden" }}>
            <LogoMark logo={logo} />
          </div>
          {Array.from({ length: n }).map((_, i) => {
            const p = springAt(frame, fps, i * 2.5, "snappy");
            const dir = i % 2 ? 1 : -1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `inset(${(i / n) * 100}% 0 ${100 - ((i + 1) / n) * 100 - 0.4}% 0)`,
                  transform: `translateX(${(1 - p) * dir * 110}%)`,
                }}
              >
                <LogoMark logo={logo} />
              </div>
            );
          })}
        </div>
      );
      break;
    }
    case "type": {
      const text = logo.text ?? "brand";
      const short = Math.min(L.width, L.height);
      const size = Math.min((L.contentW / Math.max(4, text.length)) * 1.7, short * (logo.size ?? 0.42) * 0.42);
      const track = interpolate(progress(frame, 0, fps * 1.4), [0, 1], [0.5, -0.04]);
      mark = (
        <div
          style={{
            fontFamily: fontStack(theme.fonts.display),
            fontWeight: 800,
            fontSize: size,
            letterSpacing: `${track}em`,
            color: theme.colors.fg,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {Array.from(text).map((ch, i) => {
            const p = springAt(frame, fps, i * 2, "smooth");
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 0.35}em)`,
                  filter: `blur(${(1 - p) * 10}px)`,
                }}
              >
                {ch === " " ? " " : ch}
              </span>
            );
          })}
          <span
            style={{
              display: "inline-block",
              width: "0.18em",
              height: "0.18em",
              marginLeft: "0.06em",
              borderRadius: "50%",
              background: theme.colors.accent,
              transform: `scale(${springAt(frame, fps, text.length * 2 + 6, "bouncy")})`,
            }}
          />
        </div>
      );
      break;
    }
  }

  return (
    <Stage background={scene.background} gap={56} pushIn={false}>
      {style === "burst" && <Burst />}
      {mark}
      {scene.tagline && <Body text={scene.tagline} delay={fps * 0.9} size={L.landscape ? 40 : 46} />}
    </Stage>
  );
};

/** expanding rings + particle spray behind the logo */
const Burst: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();
  const L = useLayout();
  const short = Math.min(L.width, L.height);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      {[0, 6, 12].map((d, i) => {
        const p = progress(frame, fps * 0.12 + d, fps * 1.3 + d);
        const r = short * (0.2 + p * 0.6);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: r,
              height: r,
              borderRadius: "50%",
              border: `${(3 - i) * 2 * L.u}px solid ${i === 1 ? colors.accent2 : colors.accent}`,
              opacity: (1 - p) * 0.8,
            }}
          />
        );
      })}
      {Array.from({ length: 26 }).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2;
        const dist = short * (0.18 + random(`d${i}`) * 0.4);
        const p = progress(frame, fps * 0.15, fps * (1 + random(`t${i}`) * 0.6));
        const size = (6 + random(`s${i}`) * 12) * L.u;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 ? colors.accent : colors.accent2,
              transform: `translate(${Math.cos(a) * dist * p}px, ${Math.sin(a) * dist * p}px) scale(${1 - p * 0.6})`,
              opacity: interpolate(p, [0, 0.1, 0.8, 1], [0, 1, 0.8, 0], clamp),
              boxShadow: `0 0 ${size * 2}px ${alpha(colors.accent, 0.6)}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
