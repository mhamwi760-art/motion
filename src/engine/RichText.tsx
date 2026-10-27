import { measureText } from "@remotion/layout-utils";
import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { enterStyle, progress, staggerFor } from "./anim";
import { useLayout, useTheme } from "./context";
import { fontStack } from "./fonts";
import type { Align, FontFamily, SplitBy, TextAnim } from "./types";

interface Word {
  text: string;
  hl: boolean;
}

/** "Ship *twice as* fast\nevery week" → lines of words with highlight flags */
export const parseRich = (text: string): Word[][] => {
  let hl = false;
  return text.split("\n").map((line) =>
    line
      .split(/\s+/)
      .filter(Boolean)
      .map((raw) => {
        let t = raw;
        let thisHl = hl;
        if (t.startsWith("*")) {
          t = t.slice(1);
          thisHl = true;
          hl = true;
        }
        if (/\*[.,!?;:]*$/.test(t)) {
          t = t.replace(/\*([.,!?;:]*)$/, "$1");
          hl = false;
        }
        return { text: t, hl: thisHl };
      }),
  );
};

interface FitArgs {
  lines: Word[][];
  family: string;
  weight: number;
  letterSpacing: number; // em
  maxW: number;
  maxH: number;
  maxSize: number;
  minSize: number;
  lineHeight: number;
}

/** largest font size whose greedy wrap fits the box; returns wrapped lines too */
export const fitParagraph = ({ lines, family, weight, letterSpacing, maxW, maxH, maxSize, minSize, lineHeight }: FitArgs) => {
  const REF = 100;
  const m = (t: string) =>
    measureText({ text: t, fontFamily: family, fontSize: REF, fontWeight: String(weight), letterSpacing: `${letterSpacing}em` }).width;
  const space = m("a a") - m("aa");
  const widths = lines.map((l) => l.map((w) => m(w.text)));

  const wrap = (size: number) => {
    const k = size / REF;
    const out: Word[][] = [];
    lines.forEach((line, li) => {
      let cur: Word[] = [];
      let curW = 0;
      line.forEach((w, wi) => {
        const ww = widths[li][wi] * k;
        const add = cur.length ? space * k + ww : ww;
        if (cur.length && curW + add > maxW) {
          out.push(cur);
          cur = [w];
          curW = ww;
        } else {
          cur.push(w);
          curW += add;
        }
      });
      out.push(cur);
    });
    return out;
  };

  const longest = Math.max(1, ...widths.flat());
  let size = Math.min(maxSize, (maxW / longest) * REF * 0.98);
  for (; size > minSize; size *= 0.96) {
    const wrapped = wrap(size);
    if (wrapped.length * size * lineHeight <= maxH) return { size, lines: wrapped };
  }
  return { size: minSize, lines: wrap(minSize) };
};

export interface RichTextProps {
  text: string;
  font?: FontFamily;
  weight?: number;
  /** box the text must fit inside (px). Defaults to the content area. */
  maxW?: number;
  maxH?: number;
  /** font size cap in layout units (×u) */
  maxSize?: number;
  minSize?: number;
  anim?: TextAnim;
  split?: SplitBy;
  align?: Align;
  /** frames before the first unit starts */
  delay?: number;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  style?: React.CSSProperties;
}

export const RichText: React.FC<RichTextProps> = ({
  text,
  font,
  weight = 750,
  maxW,
  maxH,
  maxSize = 150,
  minSize = 28,
  anim = "rise",
  split = "word",
  align = "center",
  delay = 0,
  color,
  lineHeight = 1.04,
  letterSpacing = -0.025,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const L = useLayout();
  const family = fontStack(font ?? theme.fonts.display);
  const W = maxW ?? L.contentW;
  const H = maxH ?? L.contentH * 0.5;

  const { size, lines } = useMemo(
    () =>
      fitParagraph({
        lines: parseRich(text),
        family,
        weight,
        letterSpacing,
        maxW: W,
        maxH: H,
        maxSize: maxSize * L.u,
        minSize: minSize * L.u,
        lineHeight,
      }),
    [text, family, weight, letterSpacing, W, H, maxSize, minSize, lineHeight, L.u],
  );

  const stagger = staggerFor(anim, split, fps);
  let unit = 0;

  return (
    <div
      style={{
        fontFamily: family,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        color: color ?? theme.colors.fg,
        textAlign: align,
        width: W,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        const lineDelay = delay + (split === "line" ? unit++ * stagger : 0);
        return (
          <div
            key={li}
            style={{
              whiteSpace: "nowrap",
              ...(split === "line" ? { ...enterStyle(anim, frame, fps, lineDelay, L.u), display: "block" } : {}),
            }}
          >
            {line.map((w, wi) => {
              const space = wi < line.length - 1 ? " " : "";
              let inner: React.ReactNode;
              let wordDelay = lineDelay;
              if (split === "char") {
                wordDelay = delay + unit * stagger;
                inner = Array.from(w.text).map((ch, ci) => (
                  <span
                    key={ci}
                    style={{ display: "inline-block", ...enterStyle(anim, frame, fps, delay + unit++ * stagger, L.u) }}
                  >
                    {ch}
                  </span>
                ));
              } else if (split === "word") {
                wordDelay = delay + unit++ * stagger;
                inner = w.text;
              } else {
                inner = w.text;
              }
              const wordStyle: React.CSSProperties =
                split === "word" ? { display: "inline-block", ...enterStyle(anim, frame, fps, wordDelay, L.u) } : { display: "inline-block" };
              return (
                <React.Fragment key={wi}>
                  <span style={{ position: "relative", ...wordStyle, color: w.hl ? theme.colors.accent : undefined }}>
                    {w.hl && <Marker start={wordDelay + fps * 0.25} />}
                    <span style={{ position: "relative" }}>{inner}</span>
                  </span>
                  {space}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** underline bar that sweeps in under highlighted words */
const Marker: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const theme = useTheme();
  const p = progress(frame, start, start + fps * 0.45);
  return (
    <span
      style={{
        position: "absolute",
        left: "-0.04em",
        right: "-0.04em",
        bottom: "0.02em",
        height: "0.13em",
        borderRadius: "0.1em",
        background: theme.colors.accent2,
        opacity: 0.85,
        transform: `scaleX(${p})`,
        transformOrigin: "left center",
      }}
    />
  );
};
