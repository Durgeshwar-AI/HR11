import { T } from "../../theme/tokens";

const NAV_ITEMS = [
  { key: "dashboard",   icon: "⊞", label: "Dashboard" },
  { key: "openings",    icon: "📋", label: "Job Openings" },
  { key: "pipeline",    icon: "⚙️", label: "Pipeline Builder" },
  { key: "leaderboard", icon: "🏆", label: "Leaderboard" },
  { key: "candidates",  icon: "👥", label: "Candidates" },
  { key: "profile",     icon: "👤", label: "Profile" },
];

export function Sidebar({ currentPage, onNavigate, collapsed }) {
  const w = collapsed ? 60 : 220;

  return (
    <aside style={{
      width: w, minHeight: "100vh",
      background: T.secondary, color: "#fff",
      borderRight: `2px solid ${T.secondary}`,
      display: "flex", flexDirection: "column",
      flexShrink: 0, transition: "width 0.2s ease",
      position: "sticky", top: 0, alignSelf: "flex-start",
    }}>
      {/* Logo */}
      <div style={{
        height: 62, display: "flex", alignItems: "center",
        padding: collapsed ? "0 16px" : "0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        gap: 8,
      }}>
        <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: "#fff" }}>
          HR<span style={{ color: T.primary }}>11</span>
        </span>
        {!collapsed && (
          <span style={{ background: T.primary, color: "#fff", fontSize: 8, fontWeight: 800,
            padding: "1px 5px", letterSpacing: "0.1em" }}>AI</span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        {NAV_ITEMS.map(item => {
          const active = currentPage === item.key;
          return (
            <div key={item.key} onClick={() => onNavigate?.(item.key)}
              style={{
                display: "flex", alignItems: "center",
                gap: 12, padding: collapsed ? "12px 16px" : "12px 20px",
                cursor: "pointer",
                background: active ? T.primary : "transparent",
                borderLeft: active ? `3px solid #fff` : "3px solid transparent",
                transition: T.transBase,
                fontSize: 18,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  fontFamily: T.fontDisplay, fontWeight: 700,
                  fontSize: 13, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "#fff",
                }}>{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 4px", cursor: "pointer", opacity: 0.6,
        }}>
          <span>🚪</span>
          {!collapsed && (
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 700,
              fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
              Logout
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
