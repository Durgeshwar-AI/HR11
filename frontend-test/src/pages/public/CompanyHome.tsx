import { PublicNav } from "../../assets/components/layout/PublicNav";
import { Ticker } from "../../assets/components/layout/Ticker";
import { Btn } from "../../assets/components/shared/Btn";
import { WHY_POINTS } from "../../constants/data";
import { useNavigate } from "react-router-dom";

type WhyPoint = (typeof WHY_POINTS)[number];

function WhyCard({ point, index }: { point: WhyPoint; index: number }) {
  return (
    <div
      className="fade-up bg-surface border-2 border-secondary p-7 transition-all duration-200 hover:shadow-brutal-orange hover:-translate-x-0.5 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="text-4xl mb-3.5">{point.icon}</div>
      <div className="font-display font-black text-xl uppercase text-secondary mb-2.5 leading-tight">
        {point.title}
      </div>
      <p className="font-body text-[13px] text-ink-light leading-relaxed">
        {point.desc}
      </p>
    </div>
  );
}

export function CompanyHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tertiary">
      <PublicNav />

      {/* Hero */}
      <section className="py-[72px] px-12 pb-14 border-b border-border-clr flex items-end justify-between flex-wrap gap-10">
        <div>
          <p className="font-body font-medium text-[11px] tracking-[0.25em] uppercase text-primary mb-3.5">
            The Case for Autonomous Hiring
          </p>
          <h1 className="font-display font-black text-[clamp(3rem,7vw,6.5rem)] leading-[0.88] uppercase text-secondary tracking-tight">
            TRADITIONAL
            <br />
            HIRING IS
            <br />
            <span className="text-primary">BROKEN.</span>
          </h1>
        </div>
        <div className="max-w-[380px]">
          <p className="font-body text-[15px] text-ink-light leading-relaxed border-l-[3px] border-primary pl-4 mb-6">
            The average hire takes 28 days and involves 14 hours of manual
            screening per role. PromptHire replaces that with an autonomous
            pipeline that runs 24/7 — with zero bias.
          </p>
          <div className="flex gap-6">
            {[
              ["28d→14d", "Time to Hire"],
              ["100%", "Bias Removed"],
              ["10×", "More Candidates"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="border-l-[3px] border-primary pl-2.5">
                <div className="font-display font-black text-[22px] text-secondary">
                  {val}
                </div>
                <div className="font-display font-bold text-[9px] tracking-[0.15em] uppercase text-ink-faint">
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Ticker
        items={[
          "10× FASTER",
          "ZERO BIAS",
          "VOICE AI",
          "ANTI-CHEAT",
          "AUTO SCHEDULE",
          "FULL REPORTS",
        ]}
      />

      {/* Why points grid */}
      <section className="py-16 px-12">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.4rem)] uppercase tracking-tight text-secondary">
            SIX REASONS COMPANIES SWITCH
          </h2>
          <div className="flex-1 h-0.5 bg-secondary" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {WHY_POINTS.map((p, i) => (
            <WhyCard key={i} point={p} index={i} />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-12 pb-[72px]">
        <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.4rem)] uppercase tracking-tight text-secondary mb-7">
          PROMPTHIRE VS TRADITIONAL HIRING
        </h2>
        <div className="border-2 border-secondary overflow-hidden">
          <div className="grid grid-cols-3 bg-secondary">
            {["", "Traditional Hiring", "PromptHire AI"].map((h, i) => (
              <div
                key={i}
                className={[
                  "py-3.5 px-5 font-display font-extrabold text-[13px] tracking-[0.12em] uppercase",
                  i === 2 ? "text-primary" : "text-white",
                  i > 0 ? "border-l border-white/10" : "",
                ].join(" ")}
              >
                {h}
              </div>
            ))}
          </div>
          {[
            ["Time to First Interview", "3–5 days", "< 1 hour"],
            ["Resume Screening", "Manual (hours)", "Instant AI"],
            ["Bias Risk", "High", "Eliminated"],
            ["Cost per Hire", "$4,000+", "< $200"],
            ["Scales with volume", "No", "Yes — unlimited"],
            ["Interview scheduling", "Back-and-forth", "Auto calendar sync"],
          ].map(([metric, trad, ai], i) => (
            <div
              key={i}
              className={[
                "grid grid-cols-3 border-t border-border-clr",
                i % 2 === 0 ? "bg-surface" : "bg-surface-alt",
              ].join(" ")}
            >
              {[metric, trad, ai].map((val, j) => (
                <div
                  key={j}
                  className={[
                    "py-3 px-5 text-[13px]",
                    j === 0
                      ? "font-body font-medium text-secondary"
                      : "font-display font-extrabold",
                    j === 2 ? "text-primary" : j === 1 ? "text-secondary" : "",
                    j > 0 ? "border-l border-border-clr" : "",
                  ].join(" ")}
                >
                  {val}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-[72px] px-12 text-center">
        <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-white mb-4 leading-[0.9]">
          READY TO
          <br />
          <span className="text-primary">TRANSFORM</span>
          <br />
          YOUR HIRING?
        </h2>
        <p className="font-body text-sm text-white/50 max-w-[400px] mx-auto mb-8">
          Join 1,000+ companies hiring smarter with PromptHire.
        </p>
        <div className="flex gap-3 justify-center">
          <Btn
            onClick={() => navigate("/company-register")}
            style={{ fontSize: 15 }}
          >
            Start Free Trial →
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
