import { useState } from "react";
import { T } from "../../theme/tokens";
import { Card, SectionLabel, Divider } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Avatar } from "../../components/shared/Avatar";
import { StatusPill, Tag, ScoreBadge } from "../../components/shared/Badges";

const CANDIDATE = {
  name: "Arjun Mehta", role: "Senior Backend Engineer", location: "Bengaluru, India",
  email: "arjun@email.com", phone: "+91 98765 43210", avatar: "AM",
  bio: "Backend engineer with 5 years of experience in distributed systems, real-time applications, and cloud infrastructure. Previously at Zomato and Razorpay.",
  skills: ["Node.js", "Python", "Go", "AWS", "Redis", "Kafka", "Docker", "PostgreSQL", "System Design"],
  applications: [
    { company: "TechCorp Inc.", role: "Senior Backend Engineer", status: "in_progress", score: 88, round: "AI Voice Interview", date: "Applied 2 days ago" },
    { company: "Flipkart",       role: "Staff Engineer",          status: "rejected",    score: 72, round: "Coding Challenge",   date: "Applied 2 weeks ago" },
    { company: "Swiggy",         role: "Backend Lead",            status: "shortlisted", score: 91, round: "Technical Interview",date: "Applied 1 week ago" },
  ],
  experience: [
    { company: "Zomato",   role: "Senior Software Engineer", period: "2022–2024", desc: "Built real-time order tracking for 50k concurrent users using WebSockets and Redis pub/sub." },
    { company: "Razorpay", role: "Backend Engineer",         period: "2020–2022", desc: "Designed payment reconciliation microservice processing ₹2Cr/day with 99.99% uptime." },
  ],
};

function ApplicationCard({ app, onNavigate }) {
  return (
    <Card hover style={{ padding: "16px 20px" }} onClick={() => onNavigate?.("interview-entry")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 16,
            textTransform: "uppercase", color: T.secondary, marginBottom: 3 }}>{app.role}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight }}>{app.company}</div>
        </div>
        <ScoreBadge score={app.score} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StatusPill status={app.status} />
          <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>📍 {app.round}</span>
        </div>
        <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>{app.date}</span>
      </div>
    </Card>
  );
}

export function CandidateProfile({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("applications");

  return (
    <div style={{ minHeight: "100vh", background: T.tertiary }}>

      {/* Minimal nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60,
        background: T.tertiary, borderBottom: `2px solid ${T.secondary}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: T.secondary }}>
          HR<span style={{ color: T.primary }}>11</span>
          <span style={{ background: T.primary, color: "#fff", fontSize: 8, padding: "1px 5px", marginLeft: 6 }}>AI</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn size="sm" variant="secondary" onClick={() => onNavigate?.("login-candidate")}>Sign Out</Btn>
        </div>
      </nav>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>

          {/* Left — profile card */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: "28px", textAlign: "center" }}>
              <Avatar initials={CANDIDATE.avatar} size={80} style={{ margin: "0 auto 16px" }} />
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20,
                textTransform: "uppercase", color: T.secondary, marginBottom: 4 }}>{CANDIDATE.name}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.primary, fontWeight: 600, marginBottom: 4 }}>
                {CANDIDATE.role}
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.inkFaint, marginBottom: 16 }}>
                📍 {CANDIDATE.location}
              </div>
              <Divider />
              <div style={{ marginTop: 16, textAlign: "left", display: "flex", flexDirection: "column", gap: 8 }}>
                {[["📧", CANDIDATE.email], ["📞", CANDIDATE.phone]].map(([icon, val]) => (
                  <div key={val} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 14 }}>{icon}</span>
                    <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.inkLight }}>{val}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Skills */}
            <Card style={{ padding: "20px" }}>
              <SectionLabel>Skills</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {CANDIDATE.skills.map(s => <Tag key={s}>{s}</Tag>)}
              </div>
            </Card>

            {/* Quick stats */}
            <Card style={{ padding: "20px" }}>
              <SectionLabel>Stats</SectionLabel>
              {[
                { label: "Applications", val: CANDIDATE.applications.length },
                { label: "Shortlisted",  val: CANDIDATE.applications.filter(a => a.status === "shortlisted").length },
                { label: "Avg Score",    val: Math.round(CANDIDATE.applications.reduce((a,b)=>a+b.score,0)/CANDIDATE.applications.length) },
              ].map(s => (
                <div key={s.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "8px 0", borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.inkLight }}>{s.label}</span>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 18, color: T.secondary }}>{s.val}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Right — tabs */}
          <div>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: `2px solid ${T.secondary}`, marginBottom: 24 }}>
              {[
                { key: "applications", label: "My Applications" },
                { key: "experience",   label: "Experience" },
                { key: "resume",       label: "Resume" },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  background: activeTab === t.key ? T.secondary : "transparent",
                  border: "none", borderBottom: "none",
                  color: activeTab === t.key ? "#fff" : T.secondary,
                  padding: "12px 24px", cursor: "pointer",
                  fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 12,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  transition: T.transColor,
                }}>{t.label}</button>
              ))}
            </div>

            {/* Applications */}
            {activeTab === "applications" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 11,
                    letterSpacing: "0.15em", color: T.inkFaint, textTransform: "uppercase" }}>
                    {CANDIDATE.applications.length} Active Applications
                  </span>
                  <Btn size="sm" onClick={() => onNavigate?.("interview-entry")}>Browse Jobs</Btn>
                </div>
                {CANDIDATE.applications.map((app, i) => (
                  <ApplicationCard key={i} app={app} onNavigate={onNavigate} />
                ))}
              </div>
            )}

            {/* Experience */}
            {activeTab === "experience" && (
              <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontFamily: T.fontBody, fontSize: 14, color: T.inkLight, lineHeight: 1.6,
                  padding: "0 0 16px", borderBottom: `1px solid ${T.border}` }}>
                  {CANDIDATE.bio}
                </div>
                {CANDIDATE.experience.map((e, i) => (
                  <Card key={i} style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 17,
                          textTransform: "uppercase", color: T.secondary }}>{e.role}</div>
                        <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.primary, fontWeight: 600 }}>{e.company}</div>
                      </div>
                      <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.inkFaint,
                        background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "3px 8px" }}>
                        {e.period}
                      </span>
                    </div>
                    <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight, lineHeight: 1.6 }}>{e.desc}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Resume */}
            {activeTab === "resume" && (
              <div className="fade-up">
                <Card style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>📄</div>
                  <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 22,
                    textTransform: "uppercase", color: T.secondary, marginBottom: 8 }}>
                    Arjun_Mehta_Resume.pdf
                  </div>
                  <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight, marginBottom: 24 }}>
                    Parsed and indexed by LlamaParse · Last updated 3 days ago
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <Btn variant="secondary">Download PDF</Btn>
                    <Btn>Upload New Resume</Btn>
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
