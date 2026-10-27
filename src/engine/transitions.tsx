import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { none } from "@remotion/transitions/none";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import type { TransitionType } from "./types";

/** custom: outgoing scene zooms past camera + fades, incoming scales up from slightly small */
const ZoomPresentation: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  const entering = presentationDirection === "entering";
  const scale = entering ? interpolate(p, [0, 1], [0.86, 1]) : interpolate(p, [0, 1], [1, 1.35]);
  const opacity = entering ? interpolate(p, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }) : interpolate(p, [0.2, 0.9], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blur = entering ? (1 - p) * 12 : p * 16;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>
  );
};

const zoom = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomPresentation, props: {} });

// The presentations have different prop types; the engine treats them uniformly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const presentationFor = (type: TransitionType, width: number, height: number): TransitionPresentation<any> => {
  switch (type) {
    case "fade":
      return fade();
    case "slide":
      return slide({ direction: "from-right" });
    case "slide-up":
      return slide({ direction: "from-bottom" });
    case "wipe":
      return wipe({ direction: "from-left" });
    case "flip":
      return flip({ direction: "from-right" });
    case "clock":
      return clockWipe({ width, height });
    case "zoom":
      return zoom();
    case "none":
      return none();
  }
};
