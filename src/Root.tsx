import React from "react";
import { CalculateMetadataFunction, Composition, Folder } from "remotion";
import { FORMAT_IDS, FORMATS } from "./engine/formats";
import { computeTimeline } from "./engine/timing";
import type { FormatId, VideoSpec } from "./engine/types";
import { Video, type VideoProps } from "./engine/Video";
import explainer from "../specs/explainer.json";
import launchPromo from "../specs/launch-promo.json";
import logoIntro from "../specs/logo-intro.json";
import socialCaptions from "../specs/social-captions.json";

/** duration & fps come from the spec, so any spec passed via --props just works */
const calculateMetadata: CalculateMetadataFunction<VideoProps> = ({ props }) => {
  const tl = computeTimeline(props.spec);
  return { durationInFrames: tl.total, fps: tl.fps };
};

const EXAMPLES: Record<string, VideoSpec> = {
  LaunchPromo: launchPromo as VideoSpec,
  LogoIntro: logoIntro as VideoSpec,
  Explainer: explainer as VideoSpec,
  SocialCaptions: socialCaptions as VideoSpec,
};

const comp = (id: string, spec: VideoSpec, format: FormatId) => (
  <Composition
    key={id}
    id={id}
    component={Video}
    width={FORMATS[format].width}
    height={FORMATS[format].height}
    fps={spec.fps ?? 30}
    durationInFrames={computeTimeline(spec).total}
    defaultProps={{ spec, format }}
    calculateMetadata={calculateMetadata}
  />
);

export const Root: React.FC = () => (
  <>
    {/* Generic entry points used by `npm run make` — one per format */}
    <Folder name="Engine">{FORMAT_IDS.map((f) => comp(`Engine-${f}`, launchPromo as VideoSpec, f))}</Folder>

    {/* Examples, each in the formats its spec lists — open these in Studio */}
    {Object.entries(EXAMPLES).map(([name, spec]) => (
      <Folder key={name} name={name}>
        {(spec.formats ?? FORMAT_IDS).map((f) => comp(`${name}-${f}`, spec, f))}
      </Folder>
    ))}
  </>
);
