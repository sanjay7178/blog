import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";
import loadGoogleFonts, { type FontOptions } from "../loadGoogleFont";
import { BrandMark, OG, titleFontSize, truncate } from "./brand";

export default async (post: CollectionEntry<"blog">) => {
  const { title, author, description, tags, pubDatetime } = post.data;
  const date = new Date(pubDatetime).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const summary = truncate(description ?? "", 150);
  const shownTags = (tags ?? []).slice(0, 4);
  const fontText = [
    title,
    author,
    summary,
    date,
    SITE.title,
    "Immortal",
    "blog",
    shownTags.map(tag => `#${tag}`).join(" "),
  ].join(" ");

  return satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: OG.bg,
        backgroundImage:
          "radial-gradient(ellipse 70% 80% at 100% -10%, rgba(5, 206, 145, 0.22), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "56px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <BrandMark />
          <span
            style={{
              fontFamily: "Jost",
              fontSize: 22,
              color: OG.muted,
            }}
          >
            {date}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Instrument Serif",
              fontSize: titleFontSize(title),
              color: OG.text,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </div>
          {summary ? (
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontFamily: "Jost",
                fontSize: 26,
                color: OG.muted,
                lineHeight: 1.4,
              }}
            >
              {summary}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {shownTags.length > 0 && (
            <div style={{ display: "flex", marginBottom: 28 }}>
              {shownTags.map(tag => (
                <div
                  style={{
                    display: "flex",
                    marginRight: 12,
                    border: "1px solid rgba(5, 206, 145, 0.45)",
                    color: OG.accent,
                    fontFamily: "Jost",
                    fontSize: 20,
                    padding: "8px 16px",
                    borderRadius: 999,
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: `1px solid ${OG.line}`,
              paddingTop: 22,
              fontFamily: "Jost",
              fontSize: 22,
              color: OG.muted,
            }}
          >
            <span>{author}</span>
            <span style={{ color: OG.accent, fontWeight: 600 }}>
              Immortal's Blog
            </span>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: (await loadGoogleFonts(fontText)) as FontOptions[],
    }
  );
};
