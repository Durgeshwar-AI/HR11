import { useState } from "react";
import { PublicNav } from "../../assets/components/layout/PublicNav";
import { Ticker } from "../../assets/components/layout/Ticker";
import { Btn } from "../../assets/components/shared/Btn";
import { HOW_IT_WORKS_STEPS } from "../../constants/data";

type Step = (typeof HOW_IT_WORKS_STEPS)[number];

interface StepCardProps {
  step: Step;
  index: number;
  total: number;
}

interface NavigateProps {
  onNavigate?: (target: string) => void;
}

function StepCard({ step, index, total }: StepCardProps) {
  const isEven = index % 2 === 0;
  return (
    <div
      className="fade-up grid grid-cols-[1fr_60px_1fr] items-center"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Left — content if even, empty if odd */}
      <div
        className={[
          "p-8",
          isEven ? "bg-surface border-2 border-secondary shadow-brutal" : "",
        ].join(" ")}
        style={{ gridColumn: isEven ? 1 : 3, gridRow: 1 }}
      >
        {isEven && <StepContent step={step} />}
      </div>

      {/* Center — connector with number */}
      <div
        className="flex flex-col items-center relative"
        style={{ gridColumn: 2, gridRow: 1 }}
      >
        <div className="w-12 h-12 bg-primary flex items-center justify-center font-display font-black text-base text-white z-[1] border-2 border-secondary shrink-0">
          {step.num}
        </div>
        {index < total - 1 && (
          <div className="w-0.5 h-20 bg-border-clr absolute top-12" />
        )}
      </div>

      {/* Right — content if odd, empty if even */}
      <div
        className={[
          "p-8",
          !isEven ? "bg-surface border-2 border-secondary shadow-brutal" : "",
        ].join(" ")}
        style={{ gridColumn: !isEven ? 3 : 1, gridRow: 1 }}
      >
        {!isEven && <StepContent step={step} />}
      </div>
    </div>
  );
}

function StepContent({ step }: { step: Step }) {
  return (
    <>
      <span className="text-[32px] block mb-3">{step.icon}</span>
      <div className="font-display font-black text-xl uppercase text-secondary mb-2 leading-tight">
        {step.title}
      </div>
      <p className="font-body text-[13px] text-ink-light leading-relaxed">
        {step.desc}
      </p>
    </>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-2 border-secondary mb-2 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className={[
          "w-full flex items-center justify-between py-4 px-5 border-none cursor-pointer transition-colors text-left",
          open ? "bg-secondary" : "bg-surface",
        ].join(" ")}
      >
        <span
          className={[
            "font-display font-extrabold text-[15px] uppercase tracking-[0.02em]",
            open ? "text-white" : "text-secondary",
          ].join(" ")}
        >
          {q}
        </span>
        <span
          className={[
            "font-display font-black text-lg shrink-0 ml-3",
            open ? "text-primary" : "text-secondary",
          ].join(" ")}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="py-4 px-5 bg-surface-alt border-t border-border-clr">
          <p className="font-body text-[13px] text-ink-light leading-relaxed">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export function HowItWorksPage({ onNavigate }: NavigateProps) {
  return (
    <div className="min-h-screen bg-tertiary">
      <PublicNav onNavigate={onNavigate} currentPage="how" />

      {/* Hero */}
      <section className="py-[72px] px-12 border-b border-border-clr text-center">
        <p className="font-body font-medium text-[11px] tracking-[0.25em] uppercase text-primary mb-3.5">
          End-to-End Pipeline
        </p>
        <h1 className="font-display font-black text-[clamp(3rem,7vw,6rem)] leading-[0.9] uppercase text-secondary tracking-tight mb-6">
          HOW HR11
          <br />
          <span className="text-primary">WORKS</span>
        </h1>
        <p className="font-body text-[15px] text-ink-light max-w-[560px] mx-auto leading-relaxed">
          From the moment a job goes live to the final hire decision — every
          step is automated, auditable, and bias-free.
        </p>
      </section>

      <Ticker
        items={[
          "DESIGN PIPELINE",
          "POST JOB",
          "AI SCREENS",
          "AGENTS DEBATE",
          "VOICE INTERVIEW",
          "LEADERBOARD",
          "ONE-CLICK HIRE",
        ]}
      />

      {/* Steps */}
      <section className="py-[72px] px-20 max-w-[1000px] mx-auto">
        <div className="flex flex-col gap-10">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              total={HOW_IT_WORKS_STEPS.length}
            />
          ))}
        </div>
      </section>

      {/* Tech stack strip */}
      <section className="bg-surface-alt border-y-2 border-secondary py-10 px-12">
        <div className="flex items-center gap-8 flex-wrap justify-center">
          <span className="font-display font-extrabold text-[11px] tracking-[0.2em] uppercase text-ink-faint">
            POWERED BY
          </span>
          {[
            { name: "LlamaParse", icon: "", desc: "Resume parsing" },
            { name: "Vapi", icon: "", desc: "Voice interviews" },
            { name: "Multi-Agent", icon: "", desc: "AI debate engine" },
            { name: "Google Calendar", icon: "", desc: "Auto scheduling" },
            { name: "Streamlit", icon: "", desc: "HR dashboard" },
          ].map((t) => (
            <div
              key={t.name}
              className="flex items-center gap-2 bg-surface border-2 border-secondary py-2.5 px-4"
            >
              <span className="text-lg">{t.icon}</span>
              <div>
                <div className="font-display font-extrabold text-[13px] uppercase text-secondary">
                  {t.name}
                </div>
                <div className="font-body text-[10px] text-ink-faint">
                  {t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-12 max-w-[800px] mx-auto">
        <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.4rem)] uppercase text-secondary mb-7">
          FREQUENTLY ASKED
        </h2>
        {[
          {
            q: "Is the AI interview actually fair?",
            a: "Yes. Demographic data including name, gender, and location is redacted before any AI agent scores a candidate. Evaluation is based entirely on technical responses, project depth, and communication clarity.",
          },
          {
            q: "Can candidates game the system?",
            a: "Our anti-cheat layer analyses audio patterns, response consistency, and timing. It detects scripted reading, text-to-speech voices, and unusual pauses. Flagged sessions are escalated to human review.",
          },
          {
            q: "How long does the full process take?",
            a: "A typical 5-round pipeline from application to final shortlist takes 3–5 days, compared to the industry average of 28 days. Scheduling and scoring are fully automated.",
          },
          {
            q: "Do I need technical expertise to set up pipelines?",
            a: "No. The drag-and-drop Pipeline Builder requires no coding. Pick your rounds, order them, and deploy. Your AI pipeline goes live in under 5 minutes.",
          },
          {
            q: "What integrations are available?",
            a: "HR11 integrates with Google Calendar, Outlook, LinkedIn, major ATS platforms, and exposes a full REST API for custom integrations.",
          },
        ].map((f, i) => (
          <FAQItem key={i} {...f} />
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="bg-secondary py-16 px-12 text-center">
        <h2 className="font-display font-black text-[clamp(2rem,4vw,3.5rem)] uppercase text-white tracking-tight mb-6 leading-[0.9]">
          YOUR PIPELINE.
          <br />
          <span className="text-primary">LIVE IN 5 MINUTES.</span>
        </h2>
        <div className="flex gap-3 justify-center">
          <Btn onClick={() => onNavigate?.("register-company")}>
            Get Started Free →
          </Btn>
          <Btn
            variant="secondary"
            style={{ borderColor: "rgba(255,255,255,0.33)", color: "#fff" }}
            onClick={() => onNavigate?.("why")}
          >
            Why HR11
          </Btn>
        </div>
      </section>
    </div>
  );
}
