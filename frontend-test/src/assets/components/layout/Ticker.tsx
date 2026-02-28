import { T } from "../../../theme/tokens";

export function Ticker({ items }) {
  const all = [...items, ...items];
  return (
    <div style={{
      background: T.secondary, overflow: "hidden",
      padding: "9px 0", whiteSpace: "nowrap",
      borderTop: `1px solid ${T.secondary}`,
      borderBottom: `1px solid ${T.secondary}`,
    }}>
      <div style={{ display: "inline-flex", animation: "marquee 22s linear infinite" }}>
        {all.map((item, i) => (
          <span key={i} style={{
            fontFamily: T.fontDisplay, fontWeight: 900,
            fontSize: 13, color: "#fff",
            letterSpacing: "0.15em", textTransform: "uppercase",
            marginRight: 48,
          }}>
            {item}
            <span style={{ color: T.primary, marginLeft: 48 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
