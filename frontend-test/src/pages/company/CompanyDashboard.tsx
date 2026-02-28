import { T } from "../../theme/tokens";
import { AppShell } from "../../assets/components/layout/AppShell";
import { StatBox } from "../../assets/components/shared/StatBox";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { StatusPill, ScoreBadge, Tag } from "../../assets/components/shared/Badges";
import { Btn } from "../../assets/components/shared/Btn";
import { Avatar } from "../../assets/components/shared/Avatar";
import { MOCK_STATS, MOCK_OPENINGS, MOCK_CANDIDATES } from "../../constants/data";

function ActivityFeed() {
  const items = [
    { time: "2 min ago",  icon: "🎙️", text: "Arjun Mehta completed AI Voice Interview — Score: 94" },
    { time: "18 min ago", icon: "📄", text: "12 new resumes parsed for Senior Backend Engineer" },
    { time: "1 hr ago",   icon: "✅", text: "Priya Sharma shortlisted for Technical Interview" },
    { time: "3 hrs ago",  icon: "📡", text: "Job posting went live: Product Designer" },
    { time: "5 hrs ago",  icon: "🔍", text: "Background check cleared for Rohan Das" },
  ];
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: T.secondary, padding: "12px 20px" }}>
        <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 12,
          color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Live Activity Feed
        </span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          padding: "14px 20px", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none",
        }}>
          <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.secondary, lineHeight: 1.4 }}>
              {item.text}
            </p>
            <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>{item.time}</span>
          </div>
        </div>
      ))}
    </Card>
  );
}

function OpeningCard({ opening, onNavigate }) {
  return (
    <Card hover style={{ padding: "18px 20px" }} onClick={() => onNavigate?.("leaderboard")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 17,
            textTransform: "uppercase", color: T.secondary, marginBottom: 4 }}>
            {opening.title}
          </div>
          <Tag>{opening.department}</Tag>
        </div>
        <StatusPill status={opening.status} />
      </div>
      <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
        {[
          { label: "Applicants",   val: opening.applicants },
          { label: "Shortlisted",  val: opening.shortlisted },
          { label: "Posted",       val: opening.posted },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: T.secondary }}>{s.val}</div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 9,
              letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkFaint }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {opening.pipeline.slice(0, 4).map((r, i) => (
          <span key={r} style={{
            fontSize: 9, fontFamily: T.fontBody, fontWeight: 600,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: T.inkLight, background: T.surfaceAlt,
            border: `1px solid ${T.border}`, padding: "2px 7px",
          }}>
            {String(i + 1).padStart(2, "0")} {r.replace(/_/g, " ")}
          </span>
        ))}
        {opening.pipeline.length > 4 && (
          <span style={{ fontSize: 9, color: T.inkFaint, fontFamily: T.fontBody, padding: "2px 4px" }}>
            +{opening.pipeline.length - 4} more
          </span>
        )}
      </div>
    </Card>
  );
}

export function CompanyDashboard({ onNavigate }) {
  return (
    <AppShell currentPage="dashboard" onNavigate={onNavigate}>
      {/* Page header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, letterSpacing: "0.15em",
              textTransform: "uppercase", color: T.primary, marginBottom: 4 }}>
              Good morning, HR Team
            </p>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
              fontSize: "clamp(1.8rem,3vw,2.8rem)", textTransform: "uppercase",
              letterSpacing: "-0.01em", lineHeight: 1 }}>
              COMPANY DASHBOARD
            </h1>
          </div>
          <Btn onClick={() => onNavigate?.("pipeline")}>+ New Job Opening</Btn>
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 16, marginBottom: 28 }}>
        <StatBox label="Total Applicants" value={MOCK_STATS.totalApplicants} sub="Across all openings" accent />
        <StatBox label="Active Openings"  value={MOCK_STATS.activeOpenings}  sub="3 closing soon" />
        <StatBox label="Shortlisted"       value={MOCK_STATS.shortlisted}      sub="Ready for review" />
        <StatBox label="Hired This Month"  value={MOCK_STATS.hiredThisMonth}   sub="↑ 2 vs last month" />
        <StatBox label="Avg Time to Hire"  value={MOCK_STATS.avgTimeToHire}    sub="Industry avg: 28d" />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
        {/* Job Openings */}
        <div>
          <SectionLabel>Active Job Openings</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_OPENINGS.map(o => (
              <OpeningCard key={o.id} opening={o} onNavigate={onNavigate} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Recent candidates */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <SectionLabel>Top Candidates</SectionLabel>
              <span onClick={() => onNavigate?.("leaderboard")} style={{ fontSize: 12,
                color: T.primary, cursor: "pointer", fontFamily: T.fontBody, fontWeight: 600 }}>
                View All →
              </span>
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {MOCK_CANDIDATES.slice(0, 5).map((c, i) => (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderBottom: i < 4 ? `1px solid ${T.border}` : "none",
                }}>
                  <Avatar initials={c.avatar} size={36} rank={i + 1} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14,
                      textTransform: "uppercase", color: T.secondary }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.round}
                    </div>
                  </div>
                  <ScoreBadge score={c.score} />
                  <StatusPill status={c.status} />
                </div>
              ))}
            </Card>
          </div>

          <ActivityFeed />
        </div>
      </div>
    </AppShell>
  );
}
