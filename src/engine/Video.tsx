import { linearTiming, TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, Grain } from "../backgrounds/Background";
import { SceneView } from "../scenes";
import { asset } from "./asset";
import { clamp } from "./anim";
import { EngineProvider, useTheme } from "./context";
import { FontGate } from "./fonts";
import { resolveTheme } from "./themes";
import { computeTimeline, transitionFor } from "./timing";
import { presentationFor } from "./transitions";
import type { FormatId, VideoSpec } from "./types";

export interface VideoProps extends Record<string, unknown> {
  spec: VideoSpec;
  format: FormatId;
}

export const Video: React.FC<VideoProps> = ({ spec, format }) => {
  const theme = resolveTheme(spec.theme);
  return (
    <EngineProvider theme={theme} formatId={format}>
      <FontGate families={[theme.fonts.display, theme.fonts.body, theme.fonts.mono, "DM Serif Display"]}>
        <VideoInner spec={spec} />
      </FontGate>
    </EngineProvider>
  );
};

const VideoInner: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const { width, height } = useVideoConfig();
  const tl = computeTimeline(spec);

  return (
    <AbsoluteFill>
      <Background bg={spec.background} />
      <TransitionSeries>
        {spec.scenes.map((scene, i) => {
          const t = transitionFor(spec, i);
          return (
            <React.Fragment key={i}>
              {i > 0 && tl.transitions[i] > 0 && (
                <TransitionSeries.Transition
                  presentation={presentationFor(t.type, width, height)}
                  timing={linearTiming({ durationInFrames: tl.transitions[i], easing: Easing.bezier(0.65, 0, 0.35, 1) })}
                />
              )}
              <TransitionSeries.Sequence durationInFrames={tl.scenes[i]} name={`${i + 1}. ${scene.type}`}>
                <SceneView scene={scene} />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {spec.grain !== false && <Grain />}
      {spec.progressBar && <ProgressBar />}
      {spec.music && <Music src={spec.music.src} volume={spec.music.volume ?? 0.8} fadeOut={spec.music.fadeOut ?? 1.5} />}
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, height } = useVideoConfig();
  const theme = useTheme();
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        height: Math.round(height * 0.004) + 2,
        width: `${((frame + 1) / durationInFrames) * 100}%`,
        background: theme.colors.accent,
      }}
    />
  );
};

const Music: React.FC<{ src: string; volume: number; fadeOut: number }> = ({ src, volume, fadeOut }) => {
  const { durationInFrames, fps } = useVideoConfig();
  return (
    <Audio
      src={asset(src)}
      volume={(f) =>
        volume *
        interpolate(f, [0, fps * 0.3, durationInFrames - fadeOut * fps, durationInFrames], [0, 1, 1, 0], clamp)
      }
    />
  );
};

export const videoDuration = (spec: VideoSpec) => computeTimeline(spec);
