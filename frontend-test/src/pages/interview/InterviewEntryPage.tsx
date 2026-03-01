import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { Tag, StatusPill } from "../../assets/components/shared/Badges";

const JOB = {
  title: "Senior Backend Engineer",
  company: "TechCorp Inc.",
  round: "AI Voice Interview",
  roundNum: 4,
  totalRounds: 5,
  duration: "20–30 minutes",
  skills: ["Node.js", "AWS", "System Design", "Databases"],
  interviewer: "HR11 AI — Adaptive Voice Agent",
  notes: [
    "Your microphone and camera will be accessed.",
    "Questions are generated from your specific resume projects.",
    "The session is recorded and analysed for technical depth.",
    "Anti-cheat monitoring is active throughout.",
    "You can ask for clarification at any time.",
  ],
};

export function InterviewEntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") ?? "";
  const [micOk, setMicOk] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const testMic = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicOk(true);
    } catch {
      setMicError("Microphone access denied. Please allow mic access and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-tertiary">
      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-10 h-[60px] bg-secondary border-b-2 border-secondary">
        <div
          className="font-display font-black text-xl text-white cursor-pointer"
          onClick={() => navigate("/candidate-profile")}
        >
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[8px] px-1.5 py-px ml-1.5 tracking-[0.1em]">
            AI
          </span>
        </div>
        <StatusPill status="live" />
      </nav>

      {/* Content */}
      <div className="max-w-[800px] mx-auto py-12 px-6">
        {/* Top label */}
        <div className="fade-up text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-primary border border-primary/20 bg-primary/[0.06] px-3.5 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Interview Waiting Room
          </div>
          <h1 className="font-display font-black text-[clamp(2rem,4vw,3rem)] uppercase tracking-tight text-secondary leading-none mb-2">
            READY TO BEGIN?
          </h1>
          <p className="font-body text-sm text-ink-light">
            Review the details below before starting your interview
          </p>
        </div>

        <div className="grid grid-cols-[1.2fr_1fr] gap-5">
          {/* Left — job + round info */}
          <div className="flex flex-col gap-4">
            {/* Job card */}
            <Card>
              <div className="p-6">
                <div className="border-l-4 border-primary pl-3.5 mb-5">
                  <div className="font-display font-black text-[22px] uppercase text-secondary mb-1">
                    {JOB.title}
                  </div>
                  <div className="font-body text-[13px] text-ink-light">
                    {JOB.company}
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4 flex-wrap">
                  {JOB.skills.map((s) => (
                    <Tag key={s}>{s}</Tag>
                  ))}
                </div>

                {/* Round progress */}
                <div className="bg-surface-alt border border-border-clr p-3 px-3.5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-secondary">
                      Round {JOB.roundNum} of {JOB.totalRounds}
                    </span>
                    <span className="font-display font-black text-sm text-primary">
                      {JOB.round}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-border-clr w-full">
                    <div
                      className="h-full bg-primary transition-[width] duration-500"
                      style={{
                        width: `${(JOB.roundNum / JOB.totalRounds) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Interview details */}
            <Card>
              <div className="p-5">
                <div className="font-display font-extrabold text-[13px] tracking-[0.15em] uppercase text-secondary mb-3.5">
                  Session Details
                </div>
                {[
                  { icon: "⏱", label: "Duration", val: JOB.duration },
                  { icon: "", label: "Interviewer", val: JOB.interviewer },
                  {
                    icon: "",
                    label: "Format",
                    val: "Real-time voice conversation",
                  },
                  {
                    icon: "",
                    label: "Evaluation",
                    val: "Technical depth + communication clarity",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-2.5 py-2 border-b border-border-clr"
                  >
                    <span className="text-base shrink-0 w-6 text-center">
                      {item.icon}
                    </span>
                    <div>
                      <div className="font-display font-bold text-[10px] tracking-[0.12em] uppercase text-ink-faint">
                        {item.label}
                      </div>
                      <div className="font-body text-[13px] text-secondary mt-px">
                        {item.val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right — checklist + start */}
          <div className="flex flex-col gap-4">
            <Card>
              <div className="p-5">
                <div className="font-display font-extrabold text-[13px] tracking-[0.15em] uppercase text-secondary mb-3.5">
                  Before You Start
                </div>
                <div className="flex flex-col gap-2">
                  {JOB.notes.map((n, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className="w-[18px] h-[18px] bg-primary shrink-0 mt-px flex items-center justify-center font-display font-black text-[9px] text-white">
                        {i + 1}
                      </div>
                      <p className="font-body text-xs text-ink-light leading-snug">
                        {n}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Mic check */}
            <Card>
              <div className="p-5">
                <div className="font-display font-extrabold text-[13px] tracking-[0.15em] uppercase text-secondary mb-3">
                  Mic Check
                </div>
                <button
                  onClick={testMic}
                  className={[
                    "w-full py-3 border-2 cursor-pointer font-display font-extrabold text-[13px] tracking-[0.1em] uppercase transition-colors flex items-center justify-center gap-2",
                    micOk
                      ? "bg-success-bg border-success text-success"
                      : "bg-surface-alt border-border-clr text-secondary",
                  ].join(" ")}
                >
                  {micOk ? " Microphone Ready" : " Test Microphone"}
                </button>
                {micError && (
                  <p className="text-xs text-danger font-body mt-2">{micError}</p>
                )}
                {micOk && (
                  <div className="flex gap-[3px] items-end h-8 mt-2.5 justify-center">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-sm"
                        style={{
                          animation: `waveBar 0.8s ease ${i * 0.1}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Start button */}
            <Btn
              fullWidth
              onClick={() => navigate(`/interview${jobId ? `?jobId=${jobId}` : ""}`)}
              disabled={!micOk}
              style={{ padding: "18px", fontSize: 16 }}
            >
              {micOk ? "START INTERVIEW →" : "COMPLETE MIC CHECK FIRST"}
            </Btn>

            <p className="text-[11px] text-ink-faint font-body text-center leading-snug">
              Once started, you cannot pause the session.
              <br />
              Ensure you're in a quiet environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
