import { useState } from "react";
import { PublicNav } from "../../assets/components/layout/PublicNav";
import { Ticker } from "../../assets/components/layout/Ticker";
import { Btn } from "../../assets/components/shared/Btn";
import { useNavigate } from "react-router-dom";

/* ── plan data ── */
const PLANS = [
  {
    name: "Basic",
    tag: "Free Trial",
    price: "0",
    period: "1 Job Listing",
    highlight: false,
    features: [
      { label: "Job Listings", value: "1" },
      { label: "Total Applicants", value: "2,000" },
      { label: "Max Rounds", value: "3" },
      { label: "AI Resume Screening", value: true },
      { label: "Aptitude Test", value: true },
      { label: "Coding Challenge", value: true },
      { label: "AI Voice Interview", value: false },
      { label: "Technical Interview", value: false },
      { label: "Custom Rounds", value: false },
      { label: "Priority Support", value: false },
      { label: "WhatsApp Job Creation", value: false },
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Intermediate",
    tag: "Most Popular",
    price: "4,999",
    period: "/month",
    highlight: true,
    features: [
      { label: "Job Listings", value: "10" },
      { label: "Total Applicants", value: "5,000" },
      { label: "Max Rounds", value: "5" },
      { label: "AI Resume Screening", value: true },
      { label: "Aptitude Test", value: true },
      { label: "Coding Challenge", value: true },
      { label: "AI Voice Interview", value: true },
      { label: "Technical Interview", value: true },
      { label: "Custom Rounds", value: false },
      { label: "Priority Support", value: true },
      { label: "WhatsApp Job Creation", value: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Advanced",
    tag: "Enterprise",
    price: "14,999",
    period: "/month",
    highlight: false,
    features: [
      { label: "Job Listings", value: "Unlimited" },
      { label: "Total Applicants", value: "10,000" },
      { label: "Max Rounds", value: "5 + Custom" },
      { label: "AI Resume Screening", value: true },
      { label: "Aptitude Test", value: true },
      { label: "Coding Challenge", value: true },
      { label: "AI Voice Interview", value: true },
      { label: "Technical Interview", value: true },
      { label: "Custom Rounds", value: true },
      { label: "Priority Support", value: true },
      { label: "WhatsApp Job Creation", value: true },
    ],
    cta: "Contact Sales",
  },
] as const;

/* ── FAQ data ── */
const FAQS = [
  {
    q: "Can I upgrade my plan mid-cycle?",
    a: "Yes. When you upgrade, the new limits apply immediately and you only pay the prorated difference for the remaining days in your billing cycle.",
  },
  {
    q: "What happens when I hit the applicant limit?",
    a: "New applications are queued but not screened until the next billing cycle resets or you upgrade your plan. Existing candidates in the pipeline are unaffected.",
  },
  {
    q: "What counts as a 'round'?",
    a: "Each pipeline stage counts as one round: Resume Screening, Aptitude Test, Coding Challenge, AI Voice Interview, Technical Interview, and Custom Round.",
  },
  {
    q: "Is the Basic plan really free?",
    a: "Yes. The Basic plan gives you a full trial with 1 job listing and up to 2,000 applicants across 3 rounds, with no credit card required.",
  },
  {
    q: "Do Custom Rounds cost extra?",
    a: "No. Custom Rounds are included in the Advanced plan at no additional charge. They let you design your own evaluation stages.",
  },
];

/* ── check / cross icons (pure CSS) ── */
function Check() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary/10 border border-primary text-primary text-[11px] font-black">
      &#10003;
    </span>
  );
}
function Cross() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 bg-surface-alt border border-border-clr text-ink-faint text-[11px] font-black">
      &#10005;
    </span>
  );
}

/* ── plan card ── */
function PlanCard({
  plan,
  index,
}: {
  plan: (typeof PLANS)[number];
  index: number;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={[
        "fade-up flex flex-col border-2 transition-all duration-200",
        plan.highlight
          ? "border-primary bg-white shadow-brutal-orange -translate-y-2 relative z-10"
          : "border-secondary bg-surface hover:shadow-brutal hover:-translate-x-0.5 hover:-translate-y-0.5",
      ].join(" ")}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* tag strip */}
      <div
        className={[
          "py-2 px-6 text-center font-display font-extrabold text-[10px] tracking-[0.2em] uppercase",
          plan.highlight
            ? "bg-primary text-white"
            : "bg-secondary text-white",
        ].join(" ")}
      >
        {plan.tag}
      </div>

      {/* header */}
      <div className="px-7 pt-7 pb-5 border-b border-border-clr">
        <h3 className="font-display font-black text-[28px] uppercase text-secondary leading-none mb-1">
          {plan.name}
        </h3>
        <div className="flex items-end gap-1 mt-3">
          <span className="font-display font-black text-[42px] leading-none text-secondary">
            {plan.price === "0" ? "Free" : <>&#8377;{plan.price}</>}
          </span>
          {plan.price !== "0" && (
            <span className="font-body text-[13px] text-ink-faint mb-1">
              {plan.period}
            </span>
          )}
        </div>
        {plan.price === "0" && (
          <span className="font-body text-[13px] text-ink-faint">
            {plan.period}
          </span>
        )}
      </div>

      {/* feature list */}
      <div className="px-7 py-6 flex-1">
        <ul className="space-y-3">
          {plan.features.map((f) => (
            <li key={f.label} className="flex items-center gap-3">
              {typeof f.value === "boolean" ? (
                f.value ? (
                  <Check />
                ) : (
                  <Cross />
                )
              ) : (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-[10px] font-black border border-primary">
                  {f.value.length > 3 ? "#" : f.value.charAt(0)}
                </span>
              )}
              <span className="font-body text-[13px] text-secondary">
                {f.label}
                {typeof f.value === "string" && (
                  <span className="text-ink-faint ml-1">— {f.value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-7 pb-7">
        <Btn
          fullWidth
          variant={plan.highlight ? "primary" : "secondary"}
          onClick={() => navigate("/company-register")}
        >
          {plan.cta}
        </Btn>
      </div>
    </div>
  );
}

/* ── comparison table ── */
function ComparisonTable() {
  const featureLabels = PLANS[0].features.map((f) => f.label);

  return (
    <div className="border-2 border-secondary overflow-hidden">
      {/* header row */}
      <div className="grid grid-cols-4 bg-secondary">
        {["Feature", "Basic", "Intermediate", "Advanced"].map((h, i) => (
          <div
            key={h}
            className={[
              "py-3.5 px-5 font-display font-extrabold text-[12px] tracking-[0.12em] uppercase",
              i === 0 ? "text-white" : i === 2 ? "text-primary" : "text-white",
              i > 0 ? "border-l border-white/10" : "",
            ].join(" ")}
          >
            {h}
          </div>
        ))}
      </div>

      {/* rows */}
      {featureLabels.map((label, ri) => (
        <div
          key={label}
          className={[
            "grid grid-cols-4 border-t border-border-clr",
            ri % 2 === 0 ? "bg-surface" : "bg-surface-alt",
          ].join(" ")}
        >
          <div className="py-3 px-5 font-body font-medium text-[13px] text-secondary">
            {label}
          </div>
          {PLANS.map((plan) => {
            const feat = plan.features.find((f) => f.label === label);
            const val = feat?.value;
            return (
              <div
                key={plan.name}
                className="py-3 px-5 border-l border-border-clr font-display font-extrabold text-[13px] text-center"
              >
                {typeof val === "boolean" ? (
                  val ? (
                    <span className="text-primary">Yes</span>
                  ) : (
                    <span className="text-ink-faint">--</span>
                  )
                ) : (
                  <span className="text-secondary">{val}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── FAQ accordion ── */
function FaqItem({ faq, index }: { faq: (typeof FAQS)[number]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="fade-up border-2 border-secondary bg-surface transition-all duration-150"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-display font-bold text-[15px] uppercase text-secondary">
          {faq.q}
        </span>
        <span
          className={[
            "font-display font-black text-primary text-xl transition-transform duration-200",
            open ? "rotate-45" : "",
          ].join(" ")}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-border-clr pt-4">
          <p className="font-body text-[13px] text-ink-light leading-relaxed">
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export function PricingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tertiary">
      <PublicNav />

      {/* Hero */}
      <section className="py-[72px] px-12 pb-10 border-b border-border-clr text-center">
        <p className="font-body font-medium text-[11px] tracking-[0.25em] uppercase text-primary mb-3.5">
          Simple, Transparent Pricing
        </p>
        <h1 className="font-display font-black text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.88] uppercase text-secondary tracking-tight mb-5">
          PICK YOUR
          <br />
          <span className="text-primary">PLAN.</span>
        </h1>
        <p className="font-body text-[15px] text-ink-light max-w-[500px] mx-auto leading-relaxed">
          Start with a free trial. Scale when you need to. Every plan includes
          AI-powered resume screening, automated assessments, and smart
          candidate ranking.
        </p>
      </section>

      <Ticker
        items={[
          "FREE TRIAL",
          "NO CREDIT CARD",
          "CANCEL ANYTIME",
          "AI SCREENING",
          "VOICE INTERVIEW",
          "RANKED SHORTLIST",
        ]}
      />

      {/* Plan cards */}
      <section className="py-16 px-12">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6 max-w-[1080px] mx-auto">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-12 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display font-black text-[clamp(1.4rem,2.5vw,2rem)] uppercase tracking-tight text-secondary">
            DETAILED COMPARISON
          </h2>
          <div className="flex-1 h-0.5 bg-secondary" />
        </div>
        <ComparisonTable />
      </section>

      {/* FAQ */}
      <section className="px-12 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display font-black text-[clamp(1.4rem,2.5vw,2rem)] uppercase tracking-tight text-secondary">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="flex-1 h-0.5 bg-secondary" />
        </div>
        <div className="space-y-3 max-w-[740px]">
          {FAQS.map((faq, i) => (
            <FaqItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-[72px] px-12 text-center">
        <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-white mb-4 leading-[0.9]">
          START
          <br />
          <span className="text-primary">HIRING SMARTER</span>
          <br />
          TODAY.
        </h2>
        <p className="font-body text-sm text-white/50 max-w-[420px] mx-auto mb-8">
          Begin with the free Basic plan — no credit card required. Upgrade
          anytime as your hiring scales.
        </p>
        <div className="flex gap-3 justify-center">
          <Btn
            onClick={() => navigate("/company-register")}
            style={{ fontSize: 15 }}
          >
            Start Free Trial
          </Btn>
          <Btn
            variant="secondary"
            style={{ borderColor: "#fff", color: "#fff", fontSize: 15 }}
            onClick={() => navigate("/company-login")}
          >
            Sign In
          </Btn>
        </div>
      </section>
    </div>
  );
}
