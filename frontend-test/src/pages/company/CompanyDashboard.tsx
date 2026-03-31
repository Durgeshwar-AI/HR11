import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../assets/components/layout/AppShell";
import { StatBox } from "../../assets/components/shared/StatBox";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import {
  StatusPill,
  Tag,
} from "../../assets/components/shared/Badges";
import { Btn } from "../../assets/components/shared/Btn";
import { jobsApi, interviewsApi, isLoggedIn } from "../../services/api";

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

type BackendJob = {
  _id: string;
  title: string;
  description?: string;
  applicantCount?: number;
  shortlistedCount?: number;
  status?: string;
  createdAt?: string;
  pipeline?: Array<string | { stageType?: string; stageName?: string }>;
};

type BackendInterview = {
  _id: string;
  status?: string;
  overallScore?: number;
  currentRound?: string;
  createdAt?: string;
  candidateId?: { _id?: string; name?: string; email?: string } | string;
  candidateName?: string;
  name?: string;
  skills?: string[];
};

type DashboardCandidate = {
  id: string;
  name: string;
  score: number;
  status: string;
  round: string;
  avatar: string;
  skills: string[];
  appliedDate: string;
};

function ActivityFeed() {
  const items: Array<{ time: string; icon: string; text: string }> = [];
  
  if (items.length === 0) {
    return (
      <Card>
        <div className="bg-secondary px-5 py-3">
          <span className="font-display font-extrabold text-xs text-white tracking-[0.15em] uppercase">
            Live Activity Feed
          </span>
        </div>
        <div className="px-5 py-6 text-center text-ink-faint text-sm">
          No activity yet. Create a job opening to get started.
        </div>
      </Card>
    );
  }
  
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
            const label =
              typeof r === "string"
                ? r
                : ((r as { stageType?: string; stageName?: string })
                    ?.stageType ?? String(r));
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
  const [openings, setOpenings] = useState<DashboardOpening[]>([]);
  const [topCandidates, setTopCandidates] = useState<DashboardCandidate[]>([]);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    activeOpenings: 0,
    shortlisted: 0,
    hiredThisMonth: 0,
    avgTimeToHire: "—",
    pipelineHealth: 0,
  });

  /* Redirect to login if not authenticated */
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/company-login");
    }
  }, [navigate]);

  const refreshDashboard = async () => {
    try {
      const jobs = (await jobsApi.list()) as BackendJob[];
      if (!Array.isArray(jobs) || jobs.length === 0) {
        setOpenings([]);
        setTopCandidates([]);
        setStats({
          totalApplicants: 0,
          activeOpenings: 0,
          shortlisted: 0,
          hiredThisMonth: 0,
          avgTimeToHire: "—",
          pipelineHealth: 0,
        });
        return;
      }

      const mappedOpenings = jobs.map((j) => ({
        id: j._id,
        title: j.title,
        department:
          typeof j.description === "string" ? j.description : "Engineering",
        applicants: j.applicantCount ?? 0,
        shortlisted: j.shortlistedCount ?? 0,
        status: j.status || "active",
        posted: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "—",
        pipeline: (j.pipeline || []).map((s) =>
          typeof s === "string" ? s : s?.stageType || "unknown",
        ),
      }));

      setOpenings(mappedOpenings);
      setStats((prev) => ({
        ...prev,
        activeOpenings: jobs.filter((j) => j.status === "active" || !j.status).length,
        totalApplicants: jobs.reduce((sum, j) => sum + (j.applicantCount ?? 0), 0),
        shortlisted: jobs.reduce((sum, j) => sum + (j.shortlistedCount ?? 0), 0),
      }));

      const activeJobId =
        mappedOpenings.find((job) => job.status === "active")?.id ??
        mappedOpenings[0]?.id;

      if (!activeJobId) {
        setTopCandidates([]);
        return;
      }

      const interviews = (await interviewsApi.getByJob(String(activeJobId))) as BackendInterview[];
      const ranked = Array.isArray(interviews)
        ? interviews
            .filter((iv) => iv.status === "Evaluated" || typeof iv.overallScore === "number")
            .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
            .slice(0, 5)
            .map((iv, index) => {
              const candidateRecord = typeof iv.candidateId === "object" ? iv.candidateId : null;
              const candidateName = iv.candidateName || iv.name || candidateRecord?.name || `Candidate ${index + 1}`;
              const avatar = candidateName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return {
                id: iv._id,
                name: candidateName,
                score: iv.overallScore ?? 0,
                status: iv.status || "in_progress",
                round: iv.currentRound || "AI Voice Interview",
                avatar: avatar || "CN",
                skills: iv.skills || [],
                appliedDate: iv.createdAt ? new Date(iv.createdAt).toLocaleDateString() : "",
              };
            })
        : [];

      setTopCandidates(ranked);
    } catch {
      // Keep the dashboard usable even if a refresh fails.
    }
  };

  /* Try fetching real jobs and interview data from backend */
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void refreshDashboard();
    }, 0);
    const interval = window.setInterval(refreshDashboard, 15000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
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
              {topCandidates.length === 0 ? (
                <div className="px-4 py-6 text-center text-ink-faint text-sm">
                  No evaluated candidates yet. This will update automatically after an interview completes.
                </div>
              ) : (
                topCandidates.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className={[
                      "flex items-center gap-3 px-4 py-3",
                      index < topCandidates.length - 1 ? "border-b border-border-clr" : "",
                    ].join(" ")}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white font-display font-black text-xs flex items-center justify-center">
                      {candidate.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-extrabold text-sm uppercase text-secondary">
                        {candidate.name}
                      </div>
                      <div className="text-[11px] text-ink-faint font-body truncate">
                        {candidate.round}
                      </div>
                    </div>
                    <div className="font-display font-black text-lg text-secondary">
                      {candidate.score}
                    </div>
                  </div>
                ))
              )}
            </Card>
          </div>

          <ActivityFeed />
        </div>
      </div>
    </AppShell>
  );
}
