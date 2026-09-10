import satori from "satori";
import { SITE } from "@config";
import loadGoogleFonts, { type FontOptions } from "../loadGoogleFont";

export default async () => {
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
          justifyContent: "center",
          alignItems: "flex-start",
          margin: "72px",
          width: "88%",
          height: "78%",
          borderLeft: "2px solid #05ce91",
          paddingLeft: "48px",
        }}
      >
        <p
          style={{
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "#05ce91",
            fontFamily: "Jost",
            marginBottom: "16px",
          }}
        >
          Writing
        </p>
        <p
          style={{
            fontSize: 84,
            fontFamily: "Instrument Serif",
            color: "#e4e4e7",
            lineHeight: 1.1,
          }}
        >
          {SITE.title}
        </p>
        {SITE.desc ? (
          <p
            style={{
              fontSize: 28,
              color: "#a1a1aa",
              fontFamily: "Jost",
              marginTop: "20px",
            }}
          >
            {SITE.desc}
          </p>
        ) : null}
        <p
          style={{
            fontSize: 22,
            color: "#71717a",
            fontFamily: "Jost",
            marginTop: "40px",
          }}
        >
          {new URL(SITE.website).hostname}
        </p>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: (await loadGoogleFonts(
        SITE.title + SITE.desc + SITE.website + "Writing"
      )) as FontOptions[],
    }
  );
};
