import React from "react";
import type { Scene } from "../engine/types";
import { CaptionsScene } from "./CaptionsScene";
import { CtaScene } from "./CtaScene";
import { ImageScene } from "./ImageScene";
import { ListScene } from "./ListScene";
import { LogoScene } from "./LogoScene";
import { QuoteScene } from "./QuoteScene";
import { StatScene } from "./StatScene";
import { TitleScene } from "./TitleScene";

/**
 * Scene registry. To add a scene type: add its interface to engine/types.ts,
 * write a component, and add a case here.
 */
export const SceneView: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.type) {
    case "title":
      return <TitleScene scene={scene} />;
    case "logo":
      return <LogoScene scene={scene} />;
    case "list":
      return <ListScene scene={scene} />;
    case "stat":
      return <StatScene scene={scene} />;
    case "quote":
      return <QuoteScene scene={scene} />;
    case "captions":
      return <CaptionsScene scene={scene} />;
    case "image":
      return <ImageScene scene={scene} />;
    case "cta":
      return <CtaScene scene={scene} />;
  }
};
