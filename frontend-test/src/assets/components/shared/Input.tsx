import { useState } from "react";
import { T } from "../../../theme/tokens";

export function Input({ label, type = "text", placeholder, value, onChange, error, required }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {label && (
        <label style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 11,
          letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkLight }}>
          {label}{required && <span style={{ color: T.primary }}> *</span>}
        </label>
      )}
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          background: T.surface,
          border: `2px solid ${error ? T.danger : focus ? T.primary : T.borderDark}`,
          borderRadius: 0, padding: "11px 14px",
          fontSize: 14, color: T.secondary,
          fontFamily: T.fontBody, outline: "none",
          transition: "border-color 0.15s",
          width: "100%",
        }}
      />
      {error && <span style={{ fontSize: 11, color: T.danger, fontFamily: T.fontBody }}>{error}</span>}
    </div>
  );
}
