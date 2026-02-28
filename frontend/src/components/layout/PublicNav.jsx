import { useState } from "react";
import { T } from "../../theme/tokens";
import { Btn } from "../shared/Btn";

export function PublicNav({ onNavigate, currentPage }) {
  const links = [
    { key: "why",     label: "Why HR11" },
    { key: "how",     label: "How It Works" },
    { key: "pricing", label: "Pricing" },
  ];

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 48px", height: 62,
      background: T.tertiary, borderBottom: `2px solid ${T.secondary}`,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div
        onClick={() => onNavigate?.("home")}
        style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 22,
          color: T.secondary, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
        HR<span style={{ color: T.primary }}>11</span>
        <span style={{ background: T.primary, color: "#fff", fontSize: 9, fontWeight: 800,
          padding: "2px 6px", letterSpacing: "0.1em", marginLeft: 4, marginBottom: 2, alignSelf: "flex-end" }}>AI</span>
      </div>

      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {links.map(l => (
          <span key={l.key} onClick={() => onNavigate?.(l.key)}
            style={{
              fontFamily: T.fontBody, fontWeight: 500, fontSize: 13,
              color: currentPage === l.key ? T.primary : T.inkLight,
              cursor: "pointer", borderBottom: currentPage === l.key ? `2px solid ${T.primary}` : "2px solid transparent",
              paddingBottom: 2, transition: T.transColor,
            }}>{l.label}</span>
        ))}
        <div style={{ width: 1, height: 20, background: T.border }} />
        <Btn size="sm" variant="secondary" onClick={() => onNavigate?.("login-company")}>Company Login</Btn>
        <Btn size="sm" onClick={() => onNavigate?.("register-company")}>Get Started Free</Btn>
      </div>
    </nav>
  );
}
