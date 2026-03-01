import { PublicNav } from "../../assets/components/layout/PublicNav";
import { Ticker } from "../../assets/components/layout/Ticker";
import { Btn } from "../../assets/components/shared/Btn";
import { useNavigate } from "react-router-dom";

type CandidatePoint = {
  icon: string;
  title: string;
  desc: string;
};

const CANDIDATE_POINTS = [
  { icon: "", title: "Apply Once, Reach Many", desc: "One profile connects you to hundreds of companies. No more filling the same form over and over." },
  { icon: "", title: "AI-Powered Matching", desc: "Our agents match your skills to roles that actually fit — not keyword bingo." },
  { icon: "", title: "Voice Interviews On Your Time", desc: "No scheduling headaches. Take the AI voice interview whenever you're ready, 24/7." },
  { icon: "", title: "Real Feedback, Always", desc: "Get a detailed score breakdown after every round — strengths, gaps, and next steps." },
  { icon: "", title: "Zero Bias, Pure Merit", desc: "Your demographics are hidden from scoring. You advance on skill alone." },
  { icon: "", title: "Hear Back Faster", desc: "No more ghosting. AI pipelines mean results in hours, not weeks." },
];

function PointCard({ point, index }: { point: CandidatePoint; index: number }) {
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

export function CandidateHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tertiary">
      <PublicNav />

      {/* Hero */}
      <section className="py-[72px] px-12 pb-14 border-b border-border-clr flex items-end justify-between flex-wrap gap-10">
        <div>
          <p className="font-body font-medium text-[11px] tracking-[0.25em] uppercase text-primary mb-3.5">
            Your Career, Accelerated by AI
          </p>
          <h1 className="font-display font-black text-[clamp(3rem,7vw,6.5rem)] leading-[0.88] uppercase text-secondary tracking-tight">
            STOP
            <br />
            WAITING.
            <br />
            <span className="text-primary">START.</span>
          </h1>
        </div>
        <div className="max-w-[380px]">
          <p className="font-body text-[15px] text-ink-light leading-relaxed border-l-[3px] border-primary pl-4 mb-6">
            The average applicant waits 24 days to hear back. With HR11, AI
            screens your resume instantly, interviews you on your schedule, and
            gives you real feedback — every single time.
          </p>
          <div className="flex gap-6">
            {[
              ["< 1 hr", "First Response"],
              ["100%", "Feedback Rate"],
              ["24/7", "Interview Anytime"],
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
          "APPLY ONCE",
          "AI MATCHING",
          "VOICE INTERVIEW",
          "REAL FEEDBACK",
          "ZERO BIAS",
          "FAST RESULTS",
        ]}
      />

      {/* Candidate points grid */}
      <section className="py-16 px-12">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.4rem)] uppercase tracking-tight text-secondary">
            WHY CANDIDATES LOVE HR11
          </h2>
          <div className="flex-1 h-0.5 bg-secondary" />
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
          {CANDIDATE_POINTS.map((p, i) => (
            <PointCard key={i} point={p} index={i} />
          ))}
        </div>
      </section>

      {/* How it works for candidates */}
      <section className="px-12 pb-[72px]">
        <h2 className="font-display font-black text-[clamp(1.6rem,3vw,2.4rem)] uppercase tracking-tight text-secondary mb-7">
          YOUR JOURNEY WITH HR11
        </h2>
        <div className="border-2 border-secondary overflow-hidden">
          {[
            ["01", "Create Your Profile", "Upload your resume and fill out your profile once. Our AI parses every detail."],
            ["02", "Get Matched to Roles", "AI agents connect you to openings that genuinely fit your skills and goals."],
            ["03", "Ace the AI Rounds", "Take aptitude tests, coding challenges, and voice interviews — all on your schedule."],
            ["04", "Receive Your Score", "Detailed feedback on every round: strengths, areas to improve, and an overall ranking."],
            ["05", "Land the Interview", "Top scorers are fast-tracked to human interviews. No gatekeeping, just merit."],
          ].map(([num, title, desc], i) => (
            <div
              key={i}
              className={[
                "flex items-start gap-5 p-6 border-t border-border-clr",
                i % 2 === 0 ? "bg-surface" : "bg-surface-alt",
              ].join(" ")}
            >
              <span className="font-display font-black text-3xl text-primary shrink-0 w-12">
                {num}
              </span>
              <div>
                <div className="font-display font-black text-base uppercase text-secondary mb-1">
                  {title}
                </div>
                <p className="font-body text-[13px] text-ink-light leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-[72px] px-12 text-center">
        <h2 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-white mb-4 leading-[0.9]">
          YOUR NEXT
          <br />
          <span className="text-primary">OPPORTUNITY</span>
          <br />
          STARTS HERE.
        </h2>
        <p className="font-body text-sm text-white/50 max-w-[400px] mx-auto mb-8">
          Create your free profile and let AI work for you.
        </p>
        <div className="flex gap-3 justify-center">
          <Btn onClick={() => navigate("/candidate-register")} style={{ fontSize: 15 }}>
            Create My Profile →
          </Btn>
          <Btn
            variant="secondary"
            style={{ borderColor: "#fff", color: "#fff", fontSize: 15 }}
            onClick={() => navigate("/candidate-login")}
          >
            Sign In
          </Btn>
        </div>
      </section>
    </div>
  );
}
