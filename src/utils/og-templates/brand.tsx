export const OG = {
  bg: "#16222c",
  text: "#ecf1f3",
  muted: "#94a3b8",
  accent: "#05ce91",
  line: "rgba(236, 241, 243, 0.12)",
};

export const BrandMark = () => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <span
      style={{
        fontFamily: "Jost",
        fontWeight: 600,
        fontSize: 28,
        color: OG.text,
      }}
    >
      Immortal
    </span>
    <div
      style={{
        display: "flex",
        marginLeft: 12,
        backgroundColor: OG.accent,
        color: OG.bg,
        fontFamily: "Jost",
        fontWeight: 600,
        fontSize: 16,
        lineHeight: 1,
        padding: "8px 10px",
        borderRadius: 4,
        transform: "rotate(12deg)",
      }}
    >
      blog
    </div>
  </div>
);

export function truncate(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

export function titleFontSize(title: string) {
  if (title.length > 80) return 46;
  if (title.length > 56) return 54;
  if (title.length > 36) return 62;
  return 72;
}
