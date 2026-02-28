import { useState } from "react";
import { T } from "../../theme/tokens";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card, SectionLabel, Divider } from "../../assets/components/shared/Card";
import { ScoreBadge, StatusPill, Tag } from "../../assets/components/shared/Badges";
import { Avatar } from "../../assets/components/shared/Avatar";
import { Btn } from "../../assets/components/shared/Btn";
import { MOCK_OPENINGS, MOCK_CANDIDATES } from "../../constants/data";

function CandidateRow({ candidate, rank, onViewInterview }) {
  const [hov, setHov] = useState(false);
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px",
        background: rank === 1 ? `${T.primary}08` : hov ? T.surfaceWarm : T.surface,
        borderLeft: rank <= 3 ? `4px solid ${rank === 1 ? T.primary : T.border}` : `4px solid transparent`,
        transition: T.transBase,
        borderBottom: `1px solid ${T.border}`,
      }}
    >
      {/* Rank */}
      <div style={{ width: 36, textAlign: "center", flexShrink: 0 }}>
        {medals[rank]
          ? <span style={{ fontSize: 20 }}>{medals[rank]}</span>
          : <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 16, color: T.inkFaint }}>
              {String(rank).padStart(2, "0")}
            </span>
        }
      </div>

      <Avatar initials={candidate.avatar} size={40}
        bg={rank === 1 ? T.primary : rank === 2 ? "#888" : rank === 3 ? "#C07800" : T.secondary} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 16,
            textTransform: "uppercase", color: T.secondary }}>{candidate.name}</span>
          <StatusPill status={candidate.status} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>
            📍 {candidate.round}
          </span>
          <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>
            · {candidate.appliedDate}
          </span>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          {candidate.skills.map(s => <Tag key={s}>{s}</Tag>)}
        </div>
      </div>

      {/* Score */}
      <ScoreBadge score={candidate.score} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, opacity: hov ? 1 : 0, transition: "opacity 0.15s" }}>
        <Btn size="sm" variant="secondary" onClick={() => onViewInterview?.()}>View Report</Btn>
        {candidate.status === "shortlisted" && (
          <Btn size="sm">Hire ✓</Btn>
        )}
      </div>
    </div>
  );
}

export function HiringLeaderboard({ onNavigate }) {
  const [selectedOpening, setSelectedOpening] = useState(MOCK_OPENINGS[0]);

  const scoreMap = { shortlisted: 0, in_progress: 1, pending: 2, rejected: 3 };
  const sorted = [...MOCK_CANDIDATES].sort((a, b) => b.score - a.score);

  return (
    <AppShell currentPage="leaderboard" onNavigate={onNavigate}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, letterSpacing: "0.15em",
              textTransform: "uppercase", color: T.primary, marginBottom: 4 }}>HR Only · Confidential</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
              fontSize: "clamp(1.8rem,3vw,2.8rem)", textTransform: "uppercase",
              letterSpacing: "-0.01em", lineHeight: 1 }}>
              HIRING LEADERBOARD
            </h1>
          </div>
          <Btn variant="secondary" onClick={() => onNavigate?.("pipeline")}>Edit Pipeline</Btn>
        </div>
      </div>

      {/* Opening selector */}
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <SectionLabel>Select Job Opening</SectionLabel>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {MOCK_OPENINGS.map(o => (
            <button key={o.id}
              onClick={() => setSelectedOpening(o)}
              style={{
                background: selectedOpening.id === o.id ? T.primary : T.surface,
                border: `2px solid ${selectedOpening.id === o.id ? T.primary : T.secondary}`,
                color: selectedOpening.id === o.id ? "#fff" : T.secondary,
                padding: "10px 18px", cursor: "pointer",
                fontFamily: T.fontDisplay, fontWeight: 800,
                fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase",
                transition: T.transColor,
              }}>
              {o.title}
              <span style={{
                marginLeft: 8, fontSize: 10,
                background: selectedOpening.id === o.id ? "rgba(255,255,255,0.25)" : T.surfaceAlt,
                padding: "1px 6px",
              }}>{o.applicants}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total Applicants", val: selectedOpening.applicants, accent: true },
          { label: "Shortlisted",      val: selectedOpening.shortlisted },
          { label: "In Progress",      val: MOCK_CANDIDATES.filter(c => c.status === "in_progress").length },
          { label: "Avg Score",        val: Math.round(MOCK_CANDIDATES.reduce((a, b) => a + b.score, 0) / MOCK_CANDIDATES.length) },
        ].map(s => (
          <div key={s.label} style={{
            background: s.accent ? T.primary : T.surface,
            border: `2px solid ${T.secondary}`,
            padding: "18px 20px",
          }}>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 900,
              fontSize: 32, color: s.accent ? "#fff" : T.secondary, lineHeight: 1 }}>
              {s.val}
            </div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 700,
              fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
              color: s.accent ? "rgba(255,255,255,0.75)" : T.inkLight, marginTop: 5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="fade-up">
        <SectionLabel>Ranked Candidates — {selectedOpening.title}</SectionLabel>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "10px 20px", background: T.secondary,
          }}>
            {["RANK", "CANDIDATE", "", "CURRENT ROUND", "SCORE", "ACTIONS"].map((h, i) => (
              <span key={i} style={{
                fontFamily: T.fontDisplay, fontWeight: 800,
                fontSize: 10, color: "#fff",
                letterSpacing: "0.15em", textTransform: "uppercase",
                flex: i === 1 ? 1 : "none",
                width: i === 0 ? 36 : i === 2 ? 40 : "auto",
              }}>{h}</span>
            ))}
          </div>

          {sorted.map((c, i) => (
            <CandidateRow
              key={c.id} candidate={c} rank={i + 1}
              onViewInterview={() => onNavigate?.("interview")}
            />
          ))}
        </Card>

        <p style={{ fontSize: 11, color: T.inkFaint, marginTop: 12,
          fontFamily: T.fontBody, textAlign: "right" }}>
          🔒 This leaderboard is only visible to HR team members.
        </p>
      </div>
    </AppShell>
  );
}
