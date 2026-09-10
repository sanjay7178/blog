import satori from "satori";
import { SITE } from "@config";
import loadGoogleFonts, { type FontOptions } from "../loadGoogleFont";
import { BrandMark, OG } from "./brand";

export default async () => {
  const host = new URL(SITE.website).hostname;
  const fontText = `Immortal blog Immortal's Blog ${SITE.desc} ${host} Writing`;

  return satori(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: OG.bg,
        backgroundImage:
          "radial-gradient(ellipse 80% 70% at 0% 100%, rgba(5, 206, 145, 0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(5, 206, 145, 0.2), transparent 50%)",
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
        <BrandMark />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span
              style={{
                fontFamily: "Jost",
                fontWeight: 700,
                fontSize: 84,
                color: OG.text,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Immortal's{" "}
            </span>
            <span
              style={{
                fontFamily: "Jost",
                fontWeight: 700,
                fontSize: 84,
                color: OG.accent,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Blog
            </span>
          </div>
          {SITE.desc ? (
            <div
              style={{
                display: "flex",
                marginTop: 24,
                maxWidth: 900,
                fontFamily: "Jost",
                fontSize: 30,
                color: OG.muted,
                lineHeight: 1.4,
              }}
            >
              {SITE.desc}
            </div>
          ) : null}
        </div>

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
          <span>{host}</span>
          <span style={{ color: OG.accent, fontWeight: 600 }}>Writing</span>
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
