import React from "react";
import { useVideoConfig } from "remotion";
import { staggerFor } from "../engine/anim";
import { useLayout } from "../engine/context";
import { parseRich, RichText } from "../engine/RichText";
import type { TitleScene as T } from "../engine/types";
import { Body, Kicker, Stage } from "./common";

export const TitleScene: React.FC<{ scene: T }> = ({ scene }) => {
  const { fps } = useVideoConfig();
  const L = useLayout();
  const anim = scene.anim ?? "rise";
  const split = scene.split ?? "word";
  const align = scene.align ?? "center";
  const kickerDelay = 0;
  const titleDelay = scene.kicker ? fps * 0.2 : 0;

  // when the title finishes animating, bring the subtitle in
  const units =
    split === "char"
      ? scene.text.replace(/[\s*]/g, "").length
      : split === "word"
        ? parseRich(scene.text).flat().length
        : scene.text.split("\n").length;
  const subDelay = titleDelay + units * staggerFor(anim, split, fps) + fps * 0.25;

  return (
    <Stage background={scene.background} align={align} gap={44}>
      {scene.kicker && <Kicker text={scene.kicker} delay={kickerDelay} />}
      <RichText
        text={scene.text}
        anim={anim}
        split={split}
        align={align}
        delay={titleDelay}
        maxSize={L.landscape ? 190 : 170}
        maxH={L.contentH * (scene.subtitle ? 0.5 : 0.65)}
      />
      {scene.subtitle && <Body text={scene.subtitle} delay={subDelay} align={align} size={L.landscape ? 38 : 44} />}
    </Stage>
  );
};
