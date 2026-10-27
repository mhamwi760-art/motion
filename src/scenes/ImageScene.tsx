import React from "react";
import { Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, springAt } from "../engine/anim";
import { asset } from "../engine/asset";
import { useLayout, useTheme } from "../engine/context";
import { alpha } from "../engine/themes";
import type { ImageScene as T } from "../engine/types";
import { Body, Stage } from "./common";

export const ImageScene: React.FC<{ scene: T }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const fit = scene.fit ?? "contain";
  const kb = scene.kenBurns ?? true;
  const p = springAt(frame, fps, 0, "smooth");
  const k = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  const scale = kb ? 1.04 + k * 0.08 : 1;

  if (fit === "cover") {
    return (
      <Stage background={scene.background} justify="flex-end" pushIn={false}>
        <Img
          src={asset(scene.src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translateX(${kb ? (k - 0.5) * -2 : 0}%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, transparent 50%, ${alpha(theme.colors.bg, 0.85)} 100%)`,
          }}
        />
        {scene.caption && <Body text={scene.caption} delay={fps * 0.4} size={52} color={theme.colors.fg} />}
      </Stage>
    );
  }

  return (
    <Stage background={scene.background} gap={44}>
      <div
        style={{
          borderRadius: theme.radius * L.u,
          overflow: "hidden",
          boxShadow: `0 ${40 * L.u}px ${90 * L.u}px ${alpha("#000000", theme.dark ? 0.55 : 0.22)}`,
          opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
          transform: `translateY(${(1 - p) * 80 * L.u}px) rotate(${(1 - p) * 3}deg)`,
          maxWidth: L.contentW,
          maxHeight: L.contentH * (scene.caption ? 0.75 : 0.9),
        }}
      >
        <Img
          src={asset(scene.src)}
          style={{
            display: "block",
            maxWidth: L.contentW,
            maxHeight: L.contentH * (scene.caption ? 0.75 : 0.9),
            objectFit: "contain",
            transform: `scale(${scale})`,
          }}
        />
      </div>
      {scene.caption && <Body text={scene.caption} delay={fps * 0.4} size={46} />}
    </Stage>
  );
};
