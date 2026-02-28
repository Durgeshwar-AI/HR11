import { useState } from "react";
import {
  Card,
  SectionLabel,
  Divider,
} from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { Avatar } from "../../assets/components/shared/Avatar";
import {
  StatusPill,
  Tag,
  ScoreBadge,
} from "../../assets/components/shared/Badges";

const CANDIDATE = {
  name: "Arjun Mehta",
  role: "Senior Backend Engineer",
  location: "Bengaluru, India",
  email: "arjun@email.com",
  phone: "+91 98765 43210",
  avatar: "AM",
  bio: "Backend engineer with 5 years of experience in distributed systems, real-time applications, and cloud infrastructure. Previously at Zomato and Razorpay.",
  skills: [
    "Node.js",
    "Python",
    "Go",
    "AWS",
    "Redis",
    "Kafka",
    "Docker",
    "PostgreSQL",
    "System Design",
  ],
  applications: [
    {
      company: "TechCorp Inc.",
      role: "Senior Backend Engineer",
      status: "in_progress",
      score: 88,
      round: "AI Voice Interview",
      date: "Applied 2 days ago",
    },
    {
      company: "Flipkart",
      role: "Staff Engineer",
      status: "rejected",
      score: 72,
      round: "Coding Challenge",
      date: "Applied 2 weeks ago",
    },
    {
      company: "Swiggy",
      role: "Backend Lead",
      status: "shortlisted",
      score: 91,
      round: "Technical Interview",
      date: "Applied 1 week ago",
    },
  ],
  experience: [
    {
      company: "Zomato",
      role: "Senior Software Engineer",
      period: "2022–2024",
      desc: "Built real-time order tracking for 50k concurrent users using WebSockets and Redis pub/sub.",
    },
    {
      company: "Razorpay",
      role: "Backend Engineer",
      period: "2020–2022",
      desc: "Designed payment reconciliation microservice processing ₹2Cr/day with 99.99% uptime.",
    },
  ],
};

function ApplicationCard({ app, onNavigate }: any) {
  return (
    <Card hover onClick={() => onNavigate?.("interview-entry")}>
      <div className="flex justify-between items-start mb-2.5 px-5 py-4">
        <div>
          <div className="font-display font-extrabold text-base uppercase text-secondary mb-1">
            {app.role}
          </div>
          <div className="font-body text-[13px] text-ink-light">
            {app.company}
          </div>
        </div>
        <ScoreBadge score={app.score} />
      </div>
      <div className="flex items-center gap-2.5 justify-between px-5 pb-4">
        <div className="flex items-center gap-2">
          <StatusPill status={app.status} />
          <span className="text-[11px] text-ink-faint font-body">
            📍 {app.round}
          </span>
        </div>
        <span className="text-[11px] text-ink-faint font-body">{app.date}</span>
      </div>
    </Card>
  );
}

export function CandidateProfile({ onNavigate }: any) {
  const [activeTab, setActiveTab] = useState("applications");

  return (
    <div className="min-h-screen bg-tertiary">
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-10 h-[60px] bg-tertiary border-b-2 border-secondary sticky top-0 z-10">
        <div className="font-display font-black text-xl text-secondary">
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[8px] px-1.5 py-px ml-1.5">
            AI
          </span>
        </div>
        <div className="flex gap-3">
          <Btn
            size="sm"
            variant="secondary"
            onClick={() => onNavigate?.("login-candidate")}
          >
            Sign Out
          </Btn>
        </div>
      </nav>

      <div className="max-w-[980px] mx-auto py-9 px-6">
        <div className="grid grid-cols-[300px_1fr] gap-6 items-start">
          {/* Left — profile card */}
          <div className="flex flex-col gap-4">
            <Card>
              <div className="p-7 text-center">
                <Avatar
                  initials={CANDIDATE.avatar}
                  size={80}
                  style={{ margin: "0 auto 16px" }}
                />
                <div className="font-display font-black text-xl uppercase text-secondary mb-1">
                  {CANDIDATE.name}
                </div>
                <div className="font-body text-[13px] text-primary font-semibold mb-1">
                  {CANDIDATE.role}
                </div>
                <div className="font-body text-xs text-ink-faint mb-4">
                  📍 {CANDIDATE.location}
                </div>
                <Divider />
                <div className="mt-4 text-left flex flex-col gap-2">
                  {[
                    ["📧", CANDIDATE.email],
                    ["📞", CANDIDATE.phone],
                  ].map(([icon, val]) => (
                    <div key={val} className="flex gap-2 items-center">
                      <span className="text-sm">{icon}</span>
                      <span className="font-body text-xs text-ink-light">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card>
              <div className="p-5">
                <SectionLabel>Skills</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  {CANDIDATE.skills.map((s: string) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick stats */}
            <Card>
              <div className="p-5">
                <SectionLabel>Stats</SectionLabel>
                {[
                  { label: "Applications", val: CANDIDATE.applications.length },
                  {
                    label: "Shortlisted",
                    val: CANDIDATE.applications.filter(
                      (a) => a.status === "shortlisted",
                    ).length,
                  },
                  {
                    label: "Avg Score",
                    val: Math.round(
                      CANDIDATE.applications.reduce((a, b) => a + b.score, 0) /
                        CANDIDATE.applications.length,
                    ),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between items-center py-2 border-b border-border-clr"
                  >
                    <span className="font-body text-xs text-ink-light">
                      {s.label}
                    </span>
                    <span className="font-display font-black text-lg text-secondary">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right — tabs */}
          <div>
            {/* Tab bar */}
            <div className="flex border-b-2 border-secondary mb-6">
              {[
                { key: "applications", label: "My Applications" },
                { key: "experience", label: "Experience" },
                { key: "resume", label: "Resume" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    "border-none py-3 px-6 cursor-pointer font-display font-extrabold text-xs tracking-[0.1em] uppercase transition-colors",
                    activeTab === t.key
                      ? "bg-secondary text-white"
                      : "bg-transparent text-secondary",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Applications */}
            {activeTab === "applications" && (
              <div className="fade-up flex flex-col gap-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display font-bold text-[11px] tracking-[0.15em] text-ink-faint uppercase">
                    {CANDIDATE.applications.length} Active Applications
                  </span>
                  <Btn
                    size="sm"
                    onClick={() => onNavigate?.("interview-entry")}
                  >
                    Browse Jobs
                  </Btn>
                </div>
                {CANDIDATE.applications.map((app, i) => (
                  <ApplicationCard key={i} app={app} onNavigate={onNavigate} />
                ))}
              </div>
            )}

            {/* Experience */}
            {activeTab === "experience" && (
              <div className="fade-up flex flex-col gap-4">
                <div className="font-body text-sm text-ink-light leading-relaxed pb-4 border-b border-border-clr">
                  {CANDIDATE.bio}
                </div>
                {CANDIDATE.experience.map((e, i) => (
                  <Card key={i}>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-display font-extrabold text-[17px] uppercase text-secondary">
                            {e.role}
                          </div>
                          <div className="font-body text-[13px] text-primary font-semibold">
                            {e.company}
                          </div>
                        </div>
                        <span className="font-body text-xs text-ink-faint bg-surface-alt border border-border-clr px-2 py-[3px]">
                          {e.period}
                        </span>
                      </div>
                      <p className="font-body text-[13px] text-ink-light leading-relaxed">
                        {e.desc}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Resume */}
            {activeTab === "resume" && (
              <div className="fade-up">
                <Card>
                  <div className="p-10 text-center">
                    <div className="text-[52px] mb-4">📄</div>
                    <div className="font-display font-black text-[22px] uppercase text-secondary mb-2">
                      Arjun_Mehta_Resume.pdf
                    </div>
                    <p className="font-body text-[13px] text-ink-light mb-6">
                      Parsed and indexed by LlamaParse · Last updated 3 days ago
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Btn variant="secondary">Download PDF</Btn>
                      <Btn>Upload New Resume</Btn>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
