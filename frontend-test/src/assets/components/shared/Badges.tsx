export function Tag({ children, color }: any) {
  const c = color || "#1A1A1A";
  return (
    <span
      className="text-[9px] font-body font-semibold tracking-[0.12em] uppercase py-[2px] px-2"
      style={{ color: c, border: `1px solid ${c}44`, background: `${c}12` }}
    >
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  active:      { label: "ACTIVE",      bg: "#EAF5EA", color: "#2A7A2A", border: "#2A7A2A" },
  paused:      { label: "PAUSED",      bg: "#FFF8E8", color: "#C07800", border: "#C07800" },
  closed:      { label: "CLOSED",      bg: "#EDE8DF", color: "#B0A898", border: "#D5CFC4" },
  shortlisted: { label: "SHORTLISTED", bg: "#E8F0FF", color: "#1A3AFF", border: "#1A3AFF" },
  in_progress: { label: "IN PROGRESS", bg: "#FFF8E8", color: "#C07800", border: "#C07800" },
  pending:     { label: "PENDING",     bg: "#EDE8DF", color: "#B0A898", border: "#D5CFC4" },
  rejected:    { label: "REJECTED",    bg: "#FFF0F0", color: "#B22222", border: "#B22222" },
  hired:       { label: "HIRED",       bg: "#EAF5EA", color: "#2A7A2A", border: "#2A7A2A" },
  live:        { label: "● LIVE",      bg: "#FFF0F0", color: "#B22222", border: "#B22222" },
};

export function StatusPill({ status }: any) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span
      className="text-[9px] font-display font-extrabold tracking-[0.15em] uppercase py-[3px] px-2"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

export function ScoreBadge({ score }: any) {
  const color = score >= 90 ? "#2A7A2A" : score >= 75 ? "#C07800" : "#B22222";
  return (
    <div
      className="w-11 h-11 shrink-0 flex items-center justify-center font-display font-black text-base"
      style={{ background: `${color}15`, border: `2px solid ${color}`, color }}
    >
      {score}
    </div>
  );
}
