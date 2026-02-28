import { useState } from "react";
import { T } from "../../../theme/tokens";
import { Sidebar } from "./Sidebar";

export function AppShell({ children, currentPage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.tertiary }}>
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} collapsed={collapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        {/* Top bar */}
        <div style={{
          height: 62, display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          background: T.surface,
          borderBottom: `2px solid ${T.secondary}`,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: "transparent", border: `2px solid ${T.secondary}`,
              width: 36, height: 36, cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.fontDisplay,
            }}>☰</button>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              fontFamily: T.fontBody, fontSize: 13, color: T.inkLight,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              padding: "6px 14px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>🔔</span>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 10,
                background: T.primary, color: "#fff", padding: "1px 5px" }}>3</span>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              padding: "6px 14px", cursor: "pointer",
            }}>
              <div style={{ width: 28, height: 28, background: T.primary, color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 12 }}>HR</div>
              <span style={{ fontFamily: T.fontBody, fontWeight: 500, fontSize: 13, color: T.secondary }}>
                TechCorp Inc.
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, padding: "32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
