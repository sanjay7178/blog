import satori from "satori";
import type { CollectionEntry } from "astro:content";
import { SITE } from "@config";
import loadGoogleFonts, { type FontOptions } from "../loadGoogleFont";

export default async (post: CollectionEntry<"blog">) => {
  return satori(
    <div
      style={{
        background: "#16222c",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: "72px",
          width: "88%",
          height: "78%",
          borderLeft: "2px solid #05ce91",
          paddingLeft: "48px",
        }}
      >
        <p
          style={{
            fontSize: 68,
            fontFamily: "Instrument Serif",
            color: "#e4e4e7",
            lineHeight: 1.15,
            maxHeight: "78%",
            overflow: "hidden",
          }}
        >
          {post.data.title}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 24,
            color: "#94a3b8",
            fontFamily: "Jost",
          }}
        >
          <span>{post.data.author}</span>
          <span style={{ color: "#05ce91" }}>{SITE.title}</span>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: (await loadGoogleFonts(
        post.data.title + post.data.author + SITE.title
      )) as FontOptions[],
    }
  );
};
