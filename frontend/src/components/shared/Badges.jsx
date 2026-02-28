import { T } from "../../theme/tokens";

export function Tag({ children, color }) {
  const c = color || T.secondary;
  return (
    <span style={{
      fontSize: 9, fontFamily: T.fontBody, fontWeight: 600,
      letterSpacing: "0.12em", textTransform: "uppercase",
      color: c, border: `1px solid ${c}44`,
      background: `${c}12`, padding: "2px 8px",
    }}>{children}</span>
  );
}

export function StatusPill({ status }) {
  const map = {
    active:      { label: "ACTIVE",      bg: T.successBg, color: T.success,  border: T.success },
    paused:      { label: "PAUSED",      bg: T.warningBg, color: T.warning,  border: T.warning },
    closed:      { label: "CLOSED",      bg: T.surfaceAlt,color: T.inkFaint, border: T.border },
    shortlisted: { label: "SHORTLISTED", bg: "#E8F0FF",   color: "#1A3AFF",  border: "#1A3AFF" },
    in_progress: { label: "IN PROGRESS", bg: T.warningBg, color: T.warning,  border: T.warning },
    pending:     { label: "PENDING",     bg: T.surfaceAlt,color: T.inkFaint, border: T.border },
    rejected:    { label: "REJECTED",    bg: T.dangerBg,  color: T.danger,   border: T.danger },
    hired:       { label: "HIRED",       bg: T.successBg, color: T.success,  border: T.success },
    live:        { label: "● LIVE",      bg: T.dangerBg,  color: T.danger,   border: T.danger },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      fontSize: 9, fontFamily: T.fontDisplay, fontWeight: 800,
      letterSpacing: "0.15em", textTransform: "uppercase",
      color: s.color, background: s.bg,
      border: `1px solid ${s.border}`,
      padding: "3px 8px",
    }}>{s.label}</span>
  );
}

export function ScoreBadge({ score }) {
  const color = score >= 90 ? T.success : score >= 75 ? T.warning : T.danger;
  return (
    <div style={{
      width: 44, height: 44, flexShrink: 0,
      background: `${color}15`, border: `2px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 16,
      color,
    }}>{score}</div>
  );
}
