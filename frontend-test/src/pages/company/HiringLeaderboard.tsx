import { useState } from "react";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { ScoreBadge, StatusPill, Tag } from "../../assets/components/shared/Badges";
import { Avatar } from "../../assets/components/shared/Avatar";
import { Btn } from "../../assets/components/shared/Btn";
import { MOCK_OPENINGS, MOCK_CANDIDATES } from "../../constants/data";

function CandidateRow({ candidate, rank, onViewInterview }: any) {
  const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className={[
      "flex items-center gap-3.5 px-5 py-3.5 border-b border-border-clr transition-all group",
      rank === 1 ? "bg-primary/[0.03]" : "hover:bg-surface-warm",
    ].join(" ")}
      style={{ borderLeft: rank <= 3 ? `4px solid ${rank === 1 ? "#E8521A" : "#DEDBD4"}` : "4px solid transparent" }}
    >
      {/* Rank */}
      <div className="w-9 text-center shrink-0">
        {medals[rank]
          ? <span className="text-xl">{medals[rank]}</span>
          : <span className="font-display font-black text-base text-ink-faint">{String(rank).padStart(2, "0")}</span>
        }
      </div>

      <Avatar initials={candidate.avatar} size={40}
        bg={rank === 1 ? "#E8521A" : rank === 2 ? "#888" : rank === 3 ? "#C07800" : "#1A1A1A"} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[3px] flex-wrap">
          <span className="font-display font-extrabold text-base uppercase text-secondary">{candidate.name}</span>
          <StatusPill status={candidate.status} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-[11px] text-ink-faint font-body">📍 {candidate.round}</span>
          <span className="text-[11px] text-ink-faint font-body">· {candidate.appliedDate}</span>
        </div>
        <div className="flex gap-[5px] mt-1.5 flex-wrap">
          {candidate.skills.map((s: string) => <Tag key={s}>{s}</Tag>)}
        </div>
      </div>

      {/* Score */}
      <ScoreBadge score={candidate.score} />

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Btn size="sm" variant="secondary" onClick={() => onViewInterview?.()}>View Report</Btn>
        {candidate.status === "shortlisted" && (
          <Btn size="sm">Hire ✓</Btn>
        )}
      </div>
    </div>
  );
}

export function HiringLeaderboard({ onNavigate }: any) {
  const [selectedOpening, setSelectedOpening] = useState(MOCK_OPENINGS[0]);

  const sorted = [...MOCK_CANDIDATES].sort((a: any, b: any) => b.score - a.score);

  return (
    <AppShell currentPage="leaderboard" onNavigate={onNavigate}>

      {/* Header */}
      <div className="fade-up mb-7">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">HR Only · Confidential</p>
            <h1 className="font-display font-black text-[clamp(1.8rem,3vw,2.8rem)] uppercase tracking-tight leading-none">
              HIRING LEADERBOARD
            </h1>
          </div>
          <Btn variant="secondary" onClick={() => onNavigate?.("pipeline")}>Edit Pipeline</Btn>
        </div>
      </div>

      {/* Opening selector */}
      <div className="fade-up mb-6">
        <SectionLabel>Select Job Opening</SectionLabel>
        <div className="flex gap-2.5 flex-wrap">
          {MOCK_OPENINGS.map((o: any) => (
            <button key={o.id}
              onClick={() => setSelectedOpening(o)}
              className={[
                "px-[18px] py-2.5 cursor-pointer font-display font-extrabold text-[13px] tracking-[0.05em] uppercase border-2 transition-colors",
                selectedOpening.id === o.id
                  ? "bg-primary border-primary text-white"
                  : "bg-surface border-secondary text-secondary",
              ].join(" ")}>
              {o.title}
              <span className={[
                "ml-2 text-[10px] px-1.5 py-px",
                selectedOpening.id === o.id ? "bg-white/25" : "bg-surface-alt",
              ].join(" ")}>{o.applicants}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-up grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applicants", val: selectedOpening.applicants, accent: true },
          { label: "Shortlisted",      val: selectedOpening.shortlisted },
          { label: "In Progress",      val: MOCK_CANDIDATES.filter((c: any) => c.status === "in_progress").length },
          { label: "Avg Score",        val: Math.round(MOCK_CANDIDATES.reduce((a: number, b: any) => a + b.score, 0) / MOCK_CANDIDATES.length) },
        ].map((s: any) => (
          <div key={s.label} className={[
            "border-2 border-secondary p-[18px_20px]",
            s.accent ? "bg-primary" : "bg-surface",
          ].join(" ")}>
            <div className={[
              "font-display font-black text-[32px] leading-none",
              s.accent ? "text-white" : "text-secondary",
            ].join(" ")}>{s.val}</div>
            <div className={[
              "font-display font-bold text-[10px] tracking-[0.15em] uppercase mt-[5px]",
              s.accent ? "text-white/75" : "text-ink-light",
            ].join(" ")}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="fade-up">
        <SectionLabel>Ranked Candidates — {selectedOpening.title}</SectionLabel>
        <Card>
          {/* Table header */}
          <div className="flex items-center gap-3.5 px-5 py-2.5 bg-secondary">
            {["RANK", "CANDIDATE", "", "CURRENT ROUND", "SCORE", "ACTIONS"].map((h, i) => (
              <span key={i} className="font-display font-extrabold text-[10px] text-white tracking-[0.15em] uppercase"
                style={{ flex: i === 1 ? 1 : "none", width: i === 0 ? 36 : i === 2 ? 40 : "auto" }}>{h}</span>
            ))}
          </div>

          {sorted.map((c: any, i: number) => (
            <CandidateRow
              key={c.id} candidate={c} rank={i + 1}
              onViewInterview={() => onNavigate?.("interview")}
            />
          ))}
        </Card>

        <p className="text-[11px] text-ink-faint mt-3 font-body text-right">
          🔒 This leaderboard is only visible to HR team members.
        </p>
      </div>
    </AppShell>
  );
}
