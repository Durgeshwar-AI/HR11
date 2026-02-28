import { T } from "../../theme/tokens";
import { PublicNav } from "../../components/layout/PublicNav";
import { Ticker } from "../../components/layout/Ticker";
import { Btn } from "../../components/shared/Btn";
import { HOW_IT_WORKS_STEPS } from "../../constants/data";

function StepCard({ step, index, total }) {
  const isEven = index % 2 === 0;
  return (
    <div className="fade-up" style={{
      display: "grid", gridTemplateColumns: "1fr 60px 1fr",
      alignItems: "center", gap: 0,
      animationDelay: `${index * 0.1}s`,
    }}>
      {/* Left — content if even, spacer if odd */}
      <div style={{ padding: "32px", background: isEven ? T.surface : "transparent",
        border: isEven ? `2px solid ${T.secondary}` : "none",
        boxShadow: isEven ? T.shadow : "none",
        gridColumn: isEven ? 1 : 3,
        gridRow: 1,
      }}>
        {isEven && <StepContent step={step} />}
      </div>

      {/* Center — connector with number */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gridColumn: 2, gridRow: 1, position: "relative",
      }}>
        <div style={{
          width: 48, height: 48, background: T.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 16,
          color: "#fff", zIndex: 1, border: `2px solid ${T.secondary}`,
          flexShrink: 0,
        }}>{step.num}</div>
        {index < total - 1 && (
          <div style={{ width: 2, height: 80, background: T.border, position: "absolute", top: 48 }} />
        )}
      </div>

      {/* Right — content if odd, spacer if even */}
      <div style={{
        padding: "32px", background: !isEven ? T.surface : "transparent",
        border: !isEven ? `2px solid ${T.secondary}` : "none",
        boxShadow: !isEven ? T.shadow : "none",
        gridColumn: !isEven ? 3 : 1,
        gridRow: 1,
      }}>
        {!isEven && <StepContent step={step} />}
      </div>
    </div>
  );
}

function StepContent({ step }) {
  return (
    <>
      <span style={{ fontSize: 32, display: "block", marginBottom: 12 }}>{step.icon}</span>
      <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20,
        textTransform: "uppercase", color: T.secondary, marginBottom: 8, lineHeight: 1.1 }}>
        {step.title}
      </div>
      <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight, lineHeight: 1.65 }}>
        {step.desc}
      </p>
    </>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${T.secondary}`, marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px", background: open ? T.secondary : T.surface,
        border: "none", cursor: "pointer", transition: T.transColor,
        textAlign: "left",
      }}>
        <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 15,
          textTransform: "uppercase", letterSpacing: "0.02em",
          color: open ? "#fff" : T.secondary }}>{q}</span>
        <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 18,
          color: open ? T.primary : T.secondary, flexShrink: 0, marginLeft: 12 }}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div style={{ padding: "16px 20px", background: T.surfaceAlt,
          borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight, lineHeight: 1.65 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// useState needed for FAQ
import { useState } from "react";

export function HowItWorksPage({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: T.tertiary }}>
      <PublicNav onNavigate={onNavigate} currentPage="how" />

      {/* Hero */}
      <section style={{
        padding: "72px 48px 56px",
        borderBottom: `1px solid ${T.border}`,
        textAlign: "center",
      }}>
        <p style={{ fontFamily: T.fontBody, fontWeight: 500, fontSize: 11,
          letterSpacing: "0.25em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>
          End-to-End Pipeline
        </p>
        <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
          fontSize: "clamp(3rem,7vw,6rem)", lineHeight: 0.9,
          textTransform: "uppercase", color: T.secondary, letterSpacing: "-0.02em", marginBottom: 24 }}>
          HOW HR11<br /><span style={{ color: T.primary }}>WORKS</span>
        </h1>
        <p style={{ fontFamily: T.fontBody, fontSize: 15, color: T.inkLight,
          maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
          From the moment a job goes live to the final hire decision —
          every step is automated, auditable, and bias-free.
        </p>
      </section>

      <Ticker items={["DESIGN PIPELINE", "POST JOB", "AI SCREENS", "AGENTS DEBATE", "VOICE INTERVIEW", "LEADERBOARD", "ONE-CLICK HIRE"]} />

      {/* Steps */}
      <section style={{ padding: "72px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} total={HOW_IT_WORKS_STEPS.length} />
          ))}
        </div>
      </section>

      {/* Tech stack strip */}
      <section style={{ background: T.surfaceAlt, borderTop: `2px solid ${T.secondary}`, borderBottom: `2px solid ${T.secondary}`, padding: "40px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 11,
            letterSpacing: "0.2em", textTransform: "uppercase", color: T.inkFaint }}>
            POWERED BY
          </span>
          {[
            { name: "LlamaParse",    icon: "🦙", desc: "Resume parsing" },
            { name: "Vapi",          icon: "🎙️", desc: "Voice interviews" },
            { name: "Multi-Agent",   icon: "🤖", desc: "AI debate engine" },
            { name: "Google Calendar",icon:"🗓️", desc: "Auto scheduling" },
            { name: "Streamlit",     icon: "📊", desc: "HR dashboard" },
          ].map(t => (
            <div key={t.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              background: T.surface, border: `2px solid ${T.secondary}`,
              padding: "10px 16px",
            }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                  textTransform: "uppercase", color: T.secondary }}>{t.name}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.inkFaint }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 48px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "clamp(1.6rem,3vw,2.4rem)",
          textTransform: "uppercase", color: T.secondary, marginBottom: 28 }}>
          FREQUENTLY ASKED
        </h2>
        {[
          { q: "Is the AI interview actually fair?", a: "Yes. Demographic data including name, gender, and location is redacted before any AI agent scores a candidate. Evaluation is based entirely on technical responses, project depth, and communication clarity." },
          { q: "Can candidates game the system?", a: "Our anti-cheat layer analyses audio patterns, response consistency, and timing. It detects scripted reading, text-to-speech voices, and unusual pauses. Flagged sessions are escalated to human review." },
          { q: "How long does the full process take?", a: "A typical 5-round pipeline from application to final shortlist takes 3–5 days, compared to the industry average of 28 days. Scheduling and scoring are fully automated." },
          { q: "Do I need technical expertise to set up pipelines?", a: "No. The drag-and-drop Pipeline Builder requires no coding. Pick your rounds, order them, and deploy. Your AI pipeline goes live in under 5 minutes." },
          { q: "What integrations are available?", a: "HR11 integrates with Google Calendar, Outlook, LinkedIn, major ATS platforms, and exposes a full REST API for custom integrations." },
        ].map((f, i) => <FAQItem key={i} {...f} />)}
      </section>

      {/* Bottom CTA */}
      <section style={{ background: T.secondary, padding: "64px 48px", textAlign: "center" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
          fontSize: "clamp(2rem,4vw,3.5rem)", textTransform: "uppercase",
          color: "#fff", letterSpacing: "-0.02em", marginBottom: 24, lineHeight: 0.9 }}>
          YOUR PIPELINE.<br /><span style={{ color: T.primary }}>LIVE IN 5 MINUTES.</span>
        </h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={() => onNavigate?.("register-company")}>Get Started Free →</Btn>
          <Btn variant="secondary" style={{ borderColor: "#fff5", color: "#fff" }}
            onClick={() => onNavigate?.("why")}>Why HR11</Btn>
        </div>
      </section>
    </div>
  );
}
