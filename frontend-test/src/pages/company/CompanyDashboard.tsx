import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../assets/components/layout/AppShell";
import { StatBox } from "../../assets/components/shared/StatBox";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import {
  StatusPill,
  ScoreBadge,
  Tag,
} from "../../assets/components/shared/Badges";
import { Btn } from "../../assets/components/shared/Btn";
import { Avatar } from "../../assets/components/shared/Avatar";
import {
  MOCK_STATS,
  MOCK_OPENINGS,
  MOCK_CANDIDATES,
} from "../../constants/data";
import { jobsApi, isLoggedIn } from "../../services/api";

type DashboardOpening = {
  id: string | number;
  title: string;
  department: string;
  applicants: number;
  shortlisted: number;
  status: string;
  posted: string;
  pipeline: unknown[];
};

type DashboardCandidate = (typeof MOCK_CANDIDATES)[number];

type BackendJob = {
  _id: string;
  title: string;
  description?: string;
  applicantCount?: number;
  shortlistedCount?: number;
  status?: string;
  createdAt?: string;
  pipeline?: string[];
};

function ActivityFeed() {
  const items = [
    {
      time: "2 min ago",
      icon: "",
      text: "Arjun Mehta completed AI Voice Interview — Score: 94",
    },
    {
      time: "18 min ago",
      icon: "",
      text: "12 new resumes parsed for Senior Backend Engineer",
    },
    {
      time: "1 hr ago",
      icon: "",
      text: "Priya Sharma shortlisted for Technical Interview",
    },
    {
      time: "3 hrs ago",
      icon: "",
      text: "Job posting went live: Product Designer",
    },
    {
      time: "5 hrs ago",
      icon: "",
      text: "Background check cleared for Rohan Das",
    },
  ];
  return (
    <Card>
      <div className="bg-secondary px-5 py-3">
        <span className="font-display font-extrabold text-xs text-white tracking-[0.15em] uppercase">
          Live Activity Feed
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className={[
            "flex items-start gap-3 px-5 py-3.5",
            i < items.length - 1 ? "border-b border-border-clr" : "",
          ].join(" ")}
        >
          <span className="text-base shrink-0 mt-px">{item.icon}</span>
          <div className="flex-1">
            <p className="font-body text-[13px] text-secondary leading-snug">
              {item.text}
            </p>
            <span className="text-[11px] text-ink-faint font-body">
              {item.time}
            </span>
          </div>
        </div>
      ))}
    </Card>
  );
}

function OpeningCard({ opening }: { opening: DashboardOpening }) {
  const navigate = useNavigate();
  return (
    <Card hover onClick={() => navigate("/leaderboard")}>
      <div className="px-5 py-[18px]">
        <div className="flex justify-between items-start mb-2.5">
          <div>
            <div className="font-display font-extrabold text-[17px] uppercase text-secondary mb-1">
              {opening.title}
            </div>
            <Tag>{opening.department}</Tag>
          </div>
          <StatusPill status={opening.status} />
        </div>
        <div className="flex gap-5 mb-3.5">
          {[
            { label: "Applicants", val: opening.applicants },
            { label: "Shortlisted", val: opening.shortlisted },
            { label: "Posted", val: opening.posted },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display font-black text-xl text-secondary">
                {s.val}
              </div>
              <div className="font-display font-bold text-[9px] tracking-[0.15em] uppercase text-ink-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {opening.pipeline.slice(0, 4).map((r: unknown, i: number) => {
            const label = typeof r === "string" ? r : (r as { id?: string; label?: string })?.label ?? String(r);
            return (
              <span
                key={label + i}
                className="text-[9px] font-body font-semibold tracking-[0.1em] uppercase text-ink-light bg-surface-alt border border-border-clr px-[7px] py-[2px]"
              >
                {String(i + 1).padStart(2, "0")} {label.replace(/_/g, " ")}
              </span>
            );
          })}
          {opening.pipeline.length > 4 && (
            <span className="text-[9px] text-ink-faint font-body px-1 py-[2px]">
              +{opening.pipeline.length - 4} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export function CompanyDashboard() {
  const navigate = useNavigate();
  const [openings, setOpenings] = useState<DashboardOpening[]>(MOCK_OPENINGS as DashboardOpening[]);
  const [stats, setStats] = useState(MOCK_STATS);

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/company-login");
    }
  }, [navigate]);

  /* Try fetching real jobs from backend, fallback to mock */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const jobs = (await jobsApi.list()) as BackendJob[];
        if (!cancelled && Array.isArray(jobs) && jobs.length) {
          setOpenings(
            jobs.map((j) => ({
              id: j._id,
              title: j.title,
              department: j.description || "Engineering",
              applicants: j.applicantCount ?? 0,
              shortlisted: j.shortlistedCount ?? 0,
              status: j.status || "active",
              posted: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "—",
              pipeline: j.pipeline || ["resume_screening"],
            })),
          );
          setStats((prev) => ({
            ...prev,
            activeOpenings: jobs.filter((j) => j.status === "active" || !j.status).length,
            totalApplicants: jobs.reduce((sum, j) => sum + (j.applicantCount ?? 0), 0),
          }));
        }
      } catch {
        /* keep mock data */
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return (
    <AppShell currentPage="dashboard">
      {/* Page header */}
      <div className="fade-up mb-7">
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">
              Good morning, HR Team
            </p>
            <h1 className="font-display font-black text-[clamp(1.8rem,3vw,2.8rem)] uppercase tracking-tight leading-none">
              COMPANY DASHBOARD
            </h1>
          </div>
          <Btn onClick={() => navigate("/pipeline")}>+ New Job Opening</Btn>
        </div>
      </div>

      {/* Stats row */}
      <div className="fade-up grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mb-7">
        <StatBox
          label="Total Applicants"
          value={stats.totalApplicants}
          sub="Across all openings"
          accent
        />
        <StatBox
          label="Active Openings"
          value={stats.activeOpenings}
          sub="3 closing soon"
        />
        <StatBox
          label="Shortlisted"
          value={stats.shortlisted}
          sub="Ready for review"
        />
        <StatBox
          label="Hired This Month"
          value={stats.hiredThisMonth}
          sub="↑ 2 vs last month"
        />
        <StatBox
          label="Avg Time to Hire"
          value={stats.avgTimeToHire}
          sub="Industry avg: 28d"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-6 mb-7">
        {/* Job Openings */}
        <div>
          <SectionLabel>Active Job Openings</SectionLabel>
          <div className="flex flex-col gap-3">
            {openings.map((o) => (
              <OpeningCard key={o.id} opening={o} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Recent candidates */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <SectionLabel>Top Candidates</SectionLabel>
              <span
                onClick={() => navigate("/leaderboard")}
                className="text-xs text-primary cursor-pointer font-body font-semibold"
              >
                View All →
              </span>
            </div>
            <Card>
              {MOCK_CANDIDATES.slice(0, 5).map((c: DashboardCandidate, i: number) => (
                <div
                  key={c.id}
                  className={[
                    "flex items-center gap-3 px-4 py-3",
                    i < 4 ? "border-b border-border-clr" : "",
                  ].join(" ")}
                >
                  <Avatar initials={c.avatar} size={36} rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-extrabold text-sm uppercase text-secondary">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-ink-faint font-body truncate">
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
