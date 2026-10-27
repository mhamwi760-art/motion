import React, { useMemo } from "react";
import { Audio, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, springAt } from "../engine/anim";
import { asset } from "../engine/asset";
import { useLayout, useTheme } from "../engine/context";
import { fontStack } from "../engine/fonts";
import { alpha } from "../engine/themes";
import { autoCaptionWords } from "../engine/timing";
import type { CaptionsScene as T, CaptionWord } from "../engine/types";
import { Stage } from "./common";

/**
 * Word-timed captions. Feed `words` from any transcriber (e.g. Whisper /
 * @remotion/install-whisper-cpp output) or just `text` for auto timing.
 */
export const CaptionsScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const t = frame / fps;
  const style = scene.style ?? "pill";
  const perPage = scene.perPage ?? (L.landscape ? 6 : 4);

  const words: CaptionWord[] = useMemo(
    () => scene.words ?? autoCaptionWords(scene.text ?? "", scene.wpm),
    [scene.words, scene.text, scene.wpm],
  );
  const pages = useMemo(() => {
    const out: CaptionWord[][] = [];
    let cur: CaptionWord[] = [];
    words.forEach((w) => {
      cur.push(w);
      // break pages on size or sentence end
      if (cur.length >= perPage || /[.!?]$/.test(w.text)) {
        out.push(cur);
        cur = [];
      }
    });
    if (cur.length) out.push(cur);
    return out;
  }, [words, perPage]);

  const pageIndex = Math.max(
    0,
    pages.findIndex((p, i) => t < (pages[i + 1]?.[0].start ?? Infinity) && t >= p[0].start - 0.15),
  );
  const page = pages[pageIndex] ?? [];
  const pageStart = (page[0]?.start ?? 0) * fps;
  const enter = springAt(frame, fps, pageStart - fps * 0.1, "snappy");

  const size = (L.landscape ? 84 : 96) * L.u * (style === "bold" ? 1.1 : 1);

  return (
    <Stage background={scene.background} justify={scene.position === "lower" ? "flex-end" : "center"} pushIn={false}>
      {scene.audio && <Audio src={asset(scene.audio)} />}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          gap: `${size * 0.12}px ${size * 0.24}px`,
          maxWidth: L.contentW,
          fontFamily: fontStack(style === "bold" ? theme.fonts.display : theme.fonts.body),
          fontWeight: style === "bold" ? 800 : 750,
          fontSize: size,
          lineHeight: 1.1,
          textTransform: style === "bold" ? "uppercase" : "none",
          letterSpacing: style === "bold" ? "-0.02em" : "-0.01em",
          opacity: interpolate(enter, [0, 0.5], [0, 1], clamp),
          transform: `translateY(${(1 - enter) * 30 * L.u}px) scale(${0.94 + enter * 0.06})`,
        }}
      >
        {page.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const spoken = t >= w.start;
          const pop = springAt(frame, fps, w.start * fps, "bouncy");
          if (style === "pill") {
            return (
              <span
                key={i}
                style={{
                  padding: `${size * 0.04}px ${size * 0.16}px`,
                  borderRadius: Math.min(theme.radius * L.u, size * 0.3),
                  background: active ? theme.colors.accent : "transparent",
                  color: active ? theme.colors.onAccent : theme.colors.fg,
                  transform: active ? `scale(${1 + 0.06 * pop})` : undefined,
                  opacity: spoken ? 1 : 0.45,
                }}
              >
                {w.text}
              </span>
            );
          }
          if (style === "bold") {
            return (
              <span
                key={i}
                style={{
                  color: active ? theme.colors.accent : theme.colors.fg,
                  transform: `scale(${spoken ? 0.85 + pop * 0.15 : 0.85})`,
                  opacity: spoken ? 1 : 0,
                  textShadow: `0 ${6 * L.u}px ${24 * L.u}px ${alpha("#000000", theme.dark ? 0.5 : 0.15)}`,
                  display: "inline-block",
                }}
              >
                {w.text}
              </span>
            );
          }
          // karaoke: fill sweeps across each word as it's spoken
          const fill = interpolate(t, [w.start, w.end], [0, 100], clamp);
          return (
            <span
              key={i}
              style={{
                backgroundImage: `linear-gradient(90deg, ${theme.colors.fg} ${fill}%, ${alpha(theme.colors.fg, 0.28)} ${fill}%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </Stage>
  );
};
