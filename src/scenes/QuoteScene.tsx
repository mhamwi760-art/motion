import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, springAt, staggerFor } from "../engine/anim";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { parseRich, RichText } from "../engine/RichText";
import type { QuoteScene as T } from "../engine/types";
import { Stage } from "./common";

export const QuoteScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const words = parseRich(scene.text).flat().length;
  const authorDelay = fps * 0.3 + words * staggerFor("blur", "word", fps) + fps * 0.2;
  const q = springAt(frame, fps, 0, "bouncy");
  const a = springAt(frame, fps, authorDelay, "smooth");
  const width = L.landscape ? L.contentW * 0.85 : L.contentW;

  return (
    <Stage background={scene.background} align="left" gap={36}>
      <div
        style={{
          alignSelf: L.landscape ? "center" : "flex-start",
          width,
          display: "flex",
          flexDirection: "column",
          gap: 36 * L.u,
        }}
      >
        <div
          style={{
            fontFamily: fontStack("DM Serif Display"),
            fontSize: 260 * L.u,
            lineHeight: 0.6,
            height: 120 * L.u,
            color: theme.colors.accent,
            transform: `scale(${q}) rotate(${(1 - q) * -20}deg)`,
            transformOrigin: "left top",
          }}
        >
          “
        </div>
        <RichText
          text={scene.text}
          anim="blur"
          split="word"
          align="left"
          delay={fps * 0.3}
          weight={500}
          maxW={width}
          maxH={L.contentH * 0.5}
          maxSize={96}
          lineHeight={1.15}
          letterSpacing={-0.015}
        />
        {scene.author && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24 * L.u,
              opacity: interpolate(a, [0, 0.6], [0, 1], clamp),
              transform: `translateY(${(1 - a) * 24 * L.u}px)`,
              fontFamily: fontStack(theme.fonts.body),
            }}
          >
            <div style={{ width: 70 * L.u * a, height: 4 * L.u, background: theme.colors.accent, borderRadius: 4 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 42 * L.u, color: theme.colors.fg }}>{scene.author}</div>
              {scene.role && <div style={{ fontSize: 32 * L.u, color: theme.colors.muted, marginTop: 4 * L.u }}>{scene.role}</div>}
            </div>
          </div>
        )}
      </div>
    </Stage>
  );
};
