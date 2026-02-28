import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, clearAuth, isLoggedIn } from "../../services/api";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { Tag } from "../../assets/components/shared/Badges";
import { Btn } from "../../assets/components/shared/Btn";
import { Avatar } from "../../assets/components/shared/Avatar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Opening {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // Full-time, Part-time, Remote…
  posted: string; // e.g. "2 days ago"
  tags: string[];
  salary?: string;
}

/* ------------------------------------------------------------------ */
/*  Mock data (used when API isn't available)                           */
/* ------------------------------------------------------------------ */
const MOCK_OPENINGS: Opening[] = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    company: "TechCorp Inc.",
    location: "Bangalore, India",
    type: "Full-time · Remote",
    posted: "2 days ago",
    tags: ["React", "TypeScript", "Tailwind"],
    salary: "₹18–25 LPA",
  },
  {
    id: "2",
    title: "Backend Developer",
    company: "DataWave",
    location: "Hyderabad, India",
    type: "Full-time · Hybrid",
    posted: "5 days ago",
    tags: ["Node.js", "PostgreSQL", "Docker"],
    salary: "₹14–20 LPA",
  },
  {
    id: "3",
    title: "AI/ML Engineer",
    company: "NeuralPath AI",
    location: "Mumbai, India",
    type: "Full-time · On-site",
    posted: "1 day ago",
    tags: ["Python", "PyTorch", "LLMs"],
    salary: "₹22–32 LPA",
  },
  {
    id: "4",
    title: "Full-Stack Intern",
    company: "StartupXYZ",
    location: "Remote",
    type: "Internship · Remote",
    posted: "3 days ago",
    tags: ["React", "Express", "MongoDB"],
    salary: "₹15–25K/mo",
  },
  {
    id: "5",
    title: "DevOps Engineer",
    company: "CloudNine Solutions",
    location: "Pune, India",
    type: "Full-time · Hybrid",
    posted: "6 days ago",
    tags: ["AWS", "Kubernetes", "Terraform"],
    salary: "₹16–22 LPA",
  },
  {
    id: "6",
    title: "Product Designer",
    company: "DesignFirst Studio",
    location: "Bangalore, India",
    type: "Full-time · Remote",
    posted: "4 days ago",
    tags: ["Figma", "UI/UX", "Design Systems"],
    salary: "₹12–18 LPA",
  },
  {
    id: "7",
    title: "Mobile Developer (React Native)",
    company: "AppForge",
    location: "Chennai, India",
    type: "Full-time · On-site",
    posted: "1 week ago",
    tags: ["React Native", "TypeScript", "Firebase"],
    salary: "₹10–16 LPA",
  },
  {
    id: "8",
    title: "Data Analyst",
    company: "InsightMetrics",
    location: "Delhi, India",
    type: "Full-time · Hybrid",
    posted: "3 days ago",
    tags: ["SQL", "Python", "Tableau"],
    salary: "₹8–14 LPA",
  },
];

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

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/candidate-login");
      return;
    }
    // Try API first, fallback to mock
    const load = async () => {
      try {
        // const res = await jobsApi.list();
        // setOpenings(res);
        setOpenings(MOCK_OPENINGS);
      } catch {
        setOpenings(MOCK_OPENINGS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const filtered = openings.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()) ||
      o.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
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
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[8px] px-1.5 py-px ml-1.5">
            AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Btn
            size="sm"
            variant="ghost"
            onClick={() => navigate("/candidate-profile")}
          >
            <span className="inline-flex items-center gap-2">
              <Avatar
                initials={(user?.name || "U")[0].toUpperCase()}
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
            Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""} 👋
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display font-black text-xl uppercase text-secondary">
              No openings found
            </p>
            <p className="font-body text-sm text-ink-faint mt-1">
              Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <Card key={job.id} hover onClick={() => navigate(`/interview-entry`)}>
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
                          {job.posted}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-extrabold text-[17px] uppercase text-secondary leading-snug mb-1">
                    {job.title}
                  </h3>

                  {/* Location & type */}
                  <p className="font-body text-xs text-ink-light">
                    📍 {job.location} &nbsp;·&nbsp; {job.type}
                  </p>

                  {/* Salary */}
                  {job.salary && (
                    <p className="font-body text-xs font-semibold text-success mt-1.5">
                      💰 {job.salary}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-4">
                    <Btn fullWidth size="sm">
                      Apply Now →
                    </Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
