import { T } from "../../theme/tokens";

export function Avatar({ initials, size = 40, bg, rank }) {
  const bgColor = bg || T.primary;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size,
        background: bgColor, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.fontDisplay, fontWeight: 900,
        fontSize: size * 0.35,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}>{initials}</div>
      {rank && (
        <div style={{
          position: "absolute", top: -6, right: -6,
          width: 18, height: 18, background: T.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.fontDisplay, fontWeight: 900,
          fontSize: 9, color: "#fff",
        }}>{rank}</div>
      )}
    </div>
  );
}
