import { useState } from "react";
import { T } from "../../../theme/tokens";

export function Card({ children, hover = false, shadow = false, style = {}, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.surface,
        border: `2px solid ${hover && hov ? T.primary : T.secondary}`,
        borderRadius: 0,
        transition: T.transBase,
        boxShadow: shadow || (hover && hov) ? (hover && hov ? T.shadowOrange : T.shadow) : "none",
        transform: hover && hov ? "translate(-2px,-2px)" : "translate(0,0)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <span style={{
        fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 11,
        letterSpacing: "0.2em", color: T.inkFaint, textTransform: "uppercase",
      }}>{children}</span>
      <div style={{ flex: 1, height: 2, background: T.secondary }} />
    </div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: T.border, width: "100%" }} />;
}
