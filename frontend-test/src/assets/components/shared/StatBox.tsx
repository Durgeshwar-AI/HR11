import { T } from "../../../theme/tokens";

export function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{
      background: accent ? T.primary : T.surface,
      border: `2px solid ${T.secondary}`,
      padding: "20px 24px",
      borderRadius: 0,
    }}>
      <div style={{
        fontFamily: T.fontDisplay, fontWeight: 900,
        fontSize: "clamp(1.8rem,3vw,2.6rem)",
        color: accent ? "#fff" : T.secondary,
        lineHeight: 1, letterSpacing: "-0.02em",
      }}>{value}</div>
      <div style={{
        fontFamily: T.fontDisplay, fontWeight: 700,
        fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase",
        color: accent ? "rgba(255,255,255,0.8)" : T.inkLight,
        marginTop: 6,
      }}>{label}</div>
      {sub && (
        <div style={{ fontSize: 11, color: accent ? "rgba(255,255,255,0.6)" : T.inkFaint, marginTop: 4, fontFamily: T.fontBody }}>
          {sub}
        </div>
      )}
    </div>
  );
}
