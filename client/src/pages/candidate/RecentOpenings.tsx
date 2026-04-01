import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStoredUser,
  clearAuth,
  candidateApi,
  type ActiveJob,
} from "../../services/api";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { Tag } from "../../assets/components/shared/Badges";
import { Btn } from "../../assets/components/shared/Btn";
import { Avatar } from "../../assets/components/shared/Avatar";
import { initJobPipeline, STAGE_ROUTE_MAP } from "../../services/pipeline";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Opening {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  totalRounds: number;
  deadline: string | null;
  createdAt: string;
  pipeline: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30)
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function RecentOpenings() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const userName = typeof user?.name === "string" ? user.name : "";
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState(true); // optimistic default

  /* Check if candidate has uploaded a resume */
  useEffect(() => {
    (async () => {
      try {
        const me = await candidateApi.me();
        setHasResume(!!me.resumeUrl);
      } catch {
        // If profile fetch fails, allow apply (backend will catch it)
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setFetchError(null);
        const jobs: ActiveJob[] = await candidateApi.activeJobs();
        if (cancelled) return;
        setOpenings(
          jobs.map((j) => ({
            id: j.id,
            title: j.title,
            company:
              typeof j.company === "string"
                ? j.company
                : String(j.company || "Company"),
            description: typeof j.description === "string" ? j.description : "",
            skills: Array.isArray(j.skills)
              ? j.skills.map((s: unknown) =>
                  typeof s === "string" ? s : String(s),
                )
              : [],
            totalRounds: j.totalRounds,
            deadline: j.deadline,
            createdAt: j.createdAt,
            pipeline: (j.pipeline || []).map((s: unknown) =>
              typeof s === "string"
                ? s
                : (s as { stageType?: string })?.stageType || "unknown",
            ),
          })),
        );

        // Store each job's pipeline in localStorage for round navigation
        jobs.forEach((j) => {
          if (j.pipeline?.length) {
            initJobPipeline(
              j.id,
              j.pipeline.map((stageType, idx) => ({
                stageType,
                order: idx + 1,
              })),
            );
          }
        });
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            err instanceof Error ? err.message : "Failed to load jobs",
          );
          setOpenings([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = search.toLowerCase();
  const filtered = openings.filter(
    (o) =>
      (o.title ?? "").toLowerCase().includes(q) ||
      (o.company ?? "").toLowerCase().includes(q) ||
      (o.skills ?? []).some((t) => (t ?? "").toLowerCase().includes(q)),
  );

  const handleSignOut = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-tertiary">
      {/* ── Top Nav ────────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-10 h-[60px] bg-tertiary border-b-2 border-secondary sticky top-0 z-30">
        <div
          onClick={() => navigate("/")}
          className="font-display font-black text-xl text-secondary cursor-pointer select-none"
        >
          Prompt<span className="text-primary">Hire</span>
        </div>

        <div className="flex items-center gap-3">
          <Btn
            size="sm"
            variant="ghost"
            onClick={() => navigate("/candidate-profile")}
          >
            <span className="inline-flex items-center gap-2">
              <Avatar
                initials={((user?.name as string) || "U")[0].toUpperCase()}
                size={24}
              />
              <span className="hidden sm:inline normal-case font-body font-medium text-xs tracking-normal">
                {userName || "Profile"}
              </span>
            </span>
          </Btn>
          <Btn size="sm" variant="secondary" onClick={handleSignOut}>
            Sign Out
          </Btn>
        </div>
      </nav>

      {/* ── Hero / Welcome ─────────────────────────────────────── */}
      <header className="bg-surface-warm border-b-2 border-border-clr">
        <div className="max-w-[1080px] mx-auto px-8 py-10 fade-up">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">
            Candidate Portal
          </p>
          <h1 className="font-display font-black text-[32px] uppercase text-secondary leading-tight">
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1.5 font-body text-sm text-ink-light">
            Browse the latest openings and apply with one click.
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-md">
            <input
              type="text"
              placeholder="Search by role, company or skill…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-secondary rounded-none font-body text-sm text-secondary bg-surface placeholder:text-ink-faint focus:outline-none focus:border-primary transition"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </header>

      {/* ── Job Listings ───────────────────────────────────────── */}
      <main className="max-w-[1080px] mx-auto px-8 py-8">
        <div className="mb-6">
          <SectionLabel>
            {filtered.length} Open Position{filtered.length !== 1 ? "s" : ""}
          </SectionLabel>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : fetchError ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3"></div>
            <p className="font-display font-black text-xl uppercase text-secondary">
              Unable to load jobs
            </p>
            <p className="font-body text-sm text-ink-faint mt-1 mb-4">
              {fetchError}
            </p>
            <Btn size="sm" onClick={() => window.location.reload()}>
              Retry
            </Btn>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3"></div>
            <p className="font-display font-black text-xl uppercase text-secondary">
              {openings.length === 0
                ? "No open positions right now"
                : "No openings found"}
            </p>
            <p className="font-body text-sm text-ink-faint mt-1">
              {openings.length === 0
                ? "Check back later for new opportunities."
                : "Try a different search term."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => {
              // Use the first stage of the job's pipeline, or fallback to resume-screening
              const firstStage = job.pipeline?.[0];
              const firstStagePath = firstStage
                ? STAGE_ROUTE_MAP[firstStage] || "/round/resume-screening"
                : "/round/resume-screening";
              const applyUrl = `${firstStagePath}?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`;
              const handleApply = (e?: React.MouseEvent) => {
                e?.stopPropagation();
                if (!hasResume) {
                  alert(
                    "Please upload your resume on your profile before applying to jobs.",
                  );
                  navigate("/candidate-profile");
                  return;
                }
                navigate(applyUrl);
              };
              return (
                <Card key={job.id} hover onClick={() => handleApply()}>
                  <div className="px-5 py-[18px]">
                    {/* Company & posted */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-secondary text-white flex items-center justify-center font-display font-black text-sm">
                          {job.company[0]}
                        </div>
                        <div>
                          <p className="font-body text-xs font-semibold text-secondary leading-tight">
                            {job.company}
                          </p>
                          <p className="text-[11px] font-body text-ink-faint">
                            {timeAgo(job.createdAt)}
                          </p>
                        </div>
                      </div>
                      {job.totalRounds > 0 && (
                        <span className="font-display font-extrabold text-[9px] tracking-[0.1em] uppercase text-primary border border-primary/20 bg-primary/[0.06] px-2 py-0.5">
                          {job.totalRounds} rounds
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-extrabold text-[17px] uppercase text-secondary leading-snug mb-1">
                      {job.title}
                    </h3>

                    {/* Description snippet */}
                    {job.description && (
                      <p className="font-body text-xs text-ink-light mb-2 line-clamp-2">
                        {job.description}
                      </p>
                    )}

                    {/* Deadline */}
                    {job.deadline && (
                      <p className="font-body text-[11px] text-warning font-semibold mb-2">
                        ⏰ Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString()}
                      </p>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 4).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="font-body text-[10px] text-ink-faint">
                          +{job.skills.length - 4}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <Btn
                        fullWidth
                        size="sm"
                        onClick={(e: React.MouseEvent) => handleApply(e)}
                      >
                        {hasResume ? "Apply Now →" : "Upload Resume to Apply"}
                      </Btn>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
