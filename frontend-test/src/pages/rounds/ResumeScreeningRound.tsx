import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import { Card } from "../../assets/components/shared/Card";

/* ── mock resume data pulled from "profile" ── */
const PROFILE_RESUME = {
  name: "Arjun Mehta",
  email: "arjun@email.com",
  role: "Senior Backend Engineer",
  skills: ["Node.js", "Python", "Go", "AWS", "Redis", "Kafka", "Docker", "PostgreSQL", "System Design"],
  experience: "5 years — Zomato, Razorpay",
  fileName: "Arjun_Mehta_Resume.pdf",
};

type Phase = "idle" | "submitting" | "analysing" | "done";
type Result = { selected: boolean; score: number; summary: string; strengths: string[]; weaknesses: string[] } | null;

export function ResumeScreeningRound() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result>(null);

  /* auto-submit on mount after a short delay */
  useEffect(() => {
    const t = setTimeout(() => {
      setPhase("submitting");
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "submitting") {
      const t = setTimeout(() => setPhase("analysing"), 1400);
      return () => clearTimeout(t);
    }
    if (phase === "analysing") {
      const t = setTimeout(() => {
        setResult({
          selected: true,
          score: 91,
          summary:
            "Strong backend profile with relevant distributed systems experience. Skills align well with the Senior Backend Engineer opening. Project depth at Zomato and Razorpay demonstrates scalability expertise.",
          strengths: [
            "5 years of relevant backend experience",
            "Strong distributed systems skills (Kafka, Redis)",
            "Production-scale exposure at high-traffic companies",
            "System design competency",
          ],
          weaknesses: [
            "No frontend/full-stack exposure listed",
            "Missing cloud certifications",
          ],
        });
        setPhase("done");
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  /* ── progress bar helper ── */
  const progressPct =
    phase === "idle" ? 0 : phase === "submitting" ? 33 : phase === "analysing" ? 66 : 100;

  return (
    <div className="min-h-screen bg-tertiary flex flex-col">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-10 h-[60px] bg-tertiary border-b-2 border-secondary sticky top-0 z-10">
        <div className="font-display font-black text-xl text-secondary cursor-pointer" onClick={() => navigate("/candidate-profile")}>
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[8px] px-1.5 py-px ml-1.5">AI</span>
        </div>
        <div className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-ink-faint">
          Round 1 — Resume Screening
        </div>
        <Btn size="sm" variant="secondary" onClick={() => navigate("/candidate-profile")}>
          ← Back to Profile
        </Btn>
      </nav>

      <div className="flex-1 flex items-start justify-center py-12 px-6">
        <div className="w-full max-w-[720px] flex flex-col gap-6">
          {/* Resume card */}
          <Card>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="font-display font-extrabold text-base uppercase text-secondary">
                    {PROFILE_RESUME.fileName}
                  </div>
                  <div className="font-body text-xs text-ink-faint">
                    Auto-fetched from your profile
                  </div>
                </div>
              </div>

              {/* Mini resume preview */}
              <div className="bg-surface-alt border border-border-clr p-4 mb-4">
                <div className="font-display font-black text-lg text-secondary">{PROFILE_RESUME.name}</div>
                <div className="font-body text-xs text-primary font-semibold mb-1">{PROFILE_RESUME.role}</div>
                <div className="font-body text-xs text-ink-light mb-2">{PROFILE_RESUME.experience}</div>
                <div className="flex flex-wrap gap-1.5">
                  {PROFILE_RESUME.skills.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-body font-semibold tracking-[0.05em] bg-surface border border-border-clr px-2 py-px text-ink-light"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-display font-bold tracking-[0.1em] uppercase text-ink-faint mb-1.5">
                  <span>
                    {phase === "idle" && "Preparing…"}
                    {phase === "submitting" && "Submitting resume…"}
                    {phase === "analysing" && "AI agents analysing…"}
                    {phase === "done" && "Analysis complete ✓"}
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-alt border border-border-clr">
                  <div
                    className="h-full bg-primary transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {phase !== "done" && (
                <div className="flex gap-2 items-center mt-3 text-xs text-ink-faint font-body">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  AI Resume Parser & Bias Filter are working…
                </div>
              )}
            </div>
          </Card>

          {/* Result */}
          {phase === "done" && result && (
            <div className="fade-up flex flex-col gap-4">
              {/* Status banner */}
              <div
                className={`border-2 px-6 py-5 flex items-center gap-4 ${
                  result.selected
                    ? "border-[#1A8917] bg-[#f0fdf0]"
                    : "border-[#c00] bg-[#fff5f5]"
                }`}
              >
                <span className="text-3xl">{result.selected ? "✅" : "❌"}</span>
                <div>
                  <div className="font-display font-black text-xl uppercase text-secondary">
                    {result.selected ? "SELECTED FOR NEXT ROUND" : "NOT SELECTED"}
                  </div>
                  <div className="font-body text-sm text-ink-light">
                    Resume Score: <strong className="text-secondary">{result.score}/100</strong>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <Card>
                <div className="px-6 py-5">
                  <div className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-primary mb-3">
                    AI Analysis Summary
                  </div>
                  <p className="font-body text-sm text-ink-light leading-relaxed mb-4">
                    {result.summary}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-display font-bold text-[11px] tracking-[0.1em] uppercase text-[#1A8917] mb-2">
                        Strengths
                      </div>
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex gap-2 mb-1.5">
                          <span className="text-[#1A8917] text-xs shrink-0">✓</span>
                          <span className="font-body text-xs text-ink-light">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-display font-bold text-[11px] tracking-[0.1em] uppercase text-[#c00] mb-2">
                        Areas to Improve
                      </div>
                      {result.weaknesses.map((w, i) => (
                        <div key={i} className="flex gap-2 mb-1.5">
                          <span className="text-[#c00] text-xs shrink-0">△</span>
                          <span className="font-body text-xs text-ink-light">{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Next step */}
              {result.selected && (
                <div className="flex justify-end">
                  <Btn onClick={() => navigate("/round/aptitude-test")}>
                    Proceed to Aptitude Test →
                  </Btn>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
