import { useState, useEffect, useRef } from "react";
import { Btn } from "../../assets/components/shared/Btn";

const TRANSCRIPT = [
  { role: "ai",        text: "Hi Arjun, I've reviewed your resume and I'm excited to learn more about your work. Let's start with your experience at Zomato. You mentioned you built a real-time order tracking system. Can you walk me through the architecture decisions you made?" },
  { role: "candidate", text: "Sure! So the main challenge was sub-second latency for 50k concurrent orders. We ended up using a combination of WebSockets for the frontend connection and Redis pub/sub as the message broker between our delivery microservices." },
  { role: "ai",        text: "Interesting choice. Why Redis pub/sub over something like Kafka for that use case? What trade-offs did you consider?" },
  { role: "candidate", text: "Kafka would have been better for durability and replay, but for order tracking we prioritised lower latency and simpler ops overhead. Orders have a natural TTL so we didn't need long-term retention. Redis gave us sub-5ms message delivery which Kafka couldn't reliably match at that throughput." },
  { role: "ai",        text: "That's a solid reasoning. One follow-up — how did you handle the scenario where a Redis node goes down during peak traffic? Did you implement any failover strategy?" },
];

function VoiceWave({ active }: any) {
  return (
    <div className="flex gap-1 items-end h-10 justify-center">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i}
          className={["w-1 rounded-sm min-h-[4px]", active ? "bg-primary" : "bg-border-clr"].join(" ")}
          style={active ? { animation: `waveBar 0.6s ease ${i * 0.07}s infinite` } : { height: 8 }}
        />
      ))}
    </div>
  );
}

export function InterviewPage({ onNavigate }: any) {
  const [elapsed,     setElapsed]     = useState(0);
  const [aiTalking,   setAiTalking]   = useState(true);
  const [userTalking, setUserTalking] = useState(false);
  const [messages,    setMessages]    = useState([TRANSCRIPT[0]]);
  const [msgIdx,      setMsgIdx]      = useState(0);
  const [muted,       setMuted]       = useState(false);
  const [ended,       setEnded]       = useState(false);
  const [showReport,  setShowReport]  = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  /* Timer */
  useEffect(() => {
    if (ended) return;
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [ended]);

  /* Simulate conversation flow */
  useEffect(() => {
    if (msgIdx >= TRANSCRIPT.length - 1) return;
    const next = TRANSCRIPT[msgIdx + 1];
    const isAI = next.role === "ai";
    const delay = isAI ? 3200 : 2000;
    const timer = setTimeout(() => {
      setMessages(m => [...m, next]);
      setMsgIdx(i => i + 1);
      setAiTalking(isAI);
      setUserTalking(!isAI);
      if (!isAI) setTimeout(() => setUserTalking(false), 1800);
    }, delay);
    return () => clearTimeout(timer);
  }, [msgIdx]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  if (showReport) return <ReportView onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">

      {/* Top bar */}
      <div className="h-[60px] bg-secondary border-b border-white/10 flex items-center justify-between px-8 shrink-0">
        <div className="font-display font-black text-xl text-white">
          HR<span className="text-primary">11</span>
          <span className="text-[11px] text-white/50 font-body ml-3 font-normal">
            AI Voice Interview · Senior Backend Engineer
          </span>
        </div>
        <div className="flex items-center gap-5">
          {/* Live badge */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-display font-extrabold text-[11px] text-primary tracking-[0.15em]">LIVE</span>
          </div>
          {/* Timer */}
          <div className="font-mono text-base text-white bg-white/[0.08] py-1.5 px-3.5 border border-white/10">
            {fmt(elapsed)}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-[1fr_360px] overflow-hidden">

        {/* Left — AI agent + controls */}
        <div className="flex flex-col items-center justify-center p-10 gap-8 border-r border-white/[0.08]">

          {/* AI avatar */}
          <div className="text-center">
            <div className={[
              "w-[120px] h-[120px] mx-auto mb-5 rounded-full flex items-center justify-center text-[52px] transition-all duration-200",
              aiTalking ? "bg-primary border-[3px] border-primary shadow-[0_0_40px_rgba(232,82,26,0.27)]"
                        : "bg-white/[0.08] border-[3px] border-white/[0.15]",
            ].join(" ")}>🤖</div>
            <div className="font-display font-black text-lg text-white tracking-[0.05em] uppercase mb-1">
              HR11 AI Interviewer
            </div>
            <div className="font-body text-xs text-white/40">
              {aiTalking ? "Speaking…" : "Listening…"}
            </div>
          </div>

          {/* Voice wave */}
          <VoiceWave active={aiTalking} />

          {/* Divider */}
          <div className="w-[200px] h-px bg-white/[0.08]" />

          {/* Candidate status */}
          <div className="text-center">
            <div className={[
              "w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center font-display font-black text-2xl text-white transition-all duration-200",
              userTalking
                ? "bg-white/[0.15] border-2 border-white/50 shadow-[0_0_24px_rgba(255,255,255,0.15)]"
                : "bg-white/[0.05] border-2 border-white/10",
            ].join(" ")}>AM</div>
            <div className="font-display font-extrabold text-sm text-white uppercase mb-1">Arjun Mehta</div>
            <VoiceWave active={userTalking && !muted} />
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setMuted(m => !m)}
              className={[
                "w-[52px] h-[52px] rounded-full cursor-pointer text-xl flex items-center justify-center transition-all duration-200",
                muted ? "bg-danger-bg border-2 border-danger" : "bg-white/[0.08] border-2 border-white/20",
              ].join(" ")}>
              {muted ? "🔇" : "🎙️"}
            </button>

            <button
              onClick={() => { setEnded(true); setShowReport(true); }}
              className="px-6 h-[52px] bg-danger border-2 border-danger text-white cursor-pointer font-display font-extrabold text-[13px] tracking-[0.1em] uppercase">
              End Interview
            </button>
          </div>

          {/* Anti-cheat indicator */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] py-2 px-4 text-[11px]">
            <span className="text-primary">🔒</span>
            <span className="font-body text-white/[0.35] text-[11px]">Anti-cheat monitoring active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success ml-1" />
          </div>
        </div>

        {/* Right — transcript */}
        <div className="flex flex-col bg-white/[0.03]">
          <div className="py-3.5 px-5 border-b border-white/[0.08]">
            <span className="font-display font-extrabold text-[11px] text-white/50 tracking-[0.15em] uppercase">
              Live Transcript
            </span>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={["pop-in flex flex-col", msg.role === "ai" ? "items-start" : "items-end"].join(" ")}>
                <div className={[
                  "text-[9px] font-display font-extrabold tracking-[0.15em] uppercase mb-1.5",
                  msg.role === "ai" ? "text-primary" : "text-white/40",
                ].join(" ")}>
                  {msg.role === "ai" ? "HR11 AI" : "Arjun Mehta"}
                </div>
                <div className={[
                  "max-w-[90%] py-2.5 px-3.5 font-body text-[12.5px] leading-relaxed",
                  msg.role === "ai"
                    ? "bg-white/[0.07] border border-white/[0.08] text-white/[0.85]"
                    : "bg-primary/[0.13] border border-primary/[0.27] text-white/75",
                ].join(" ")}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            {aiTalking && msgIdx < TRANSCRIPT.length - 1 && (
              <div className="flex gap-1 py-2 px-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary opacity-50"
                    style={{ animation: `pulse 0.8s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Post-Interview Report ─── */
function ReportView({ onNavigate }: any) {
  const scores = [
    { label: "Technical Depth",          score: 88 },
    { label: "Communication Clarity",    score: 82 },
    { label: "Problem Solving",          score: 91 },
    { label: "Redis / Distributed Sys",  score: 94 },
    { label: "System Design",            score: 85 },
  ];

  return (
    <div className="min-h-screen bg-tertiary py-12 px-6">
      <div className="max-w-[720px] mx-auto">
        <div className="fade-up text-center mb-10">
          <div className="text-[56px] mb-3">✅</div>
          <h1 className="font-display font-black text-[clamp(2rem,4vw,3rem)] uppercase tracking-tight text-secondary mb-2 leading-none">
            INTERVIEW COMPLETE
          </h1>
          <p className="font-body text-sm text-ink-light">
            Your session has been analysed. Here's your performance summary.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Overall score */}
          <div className="bg-primary border-2 border-secondary p-7 text-center shadow-brutal">
            <div className="font-display font-black text-[72px] text-white leading-none">88</div>
            <div className="font-display font-extrabold text-[13px] text-white/80 tracking-[0.15em] uppercase mt-2">
              Overall Score
            </div>
            <div className="font-body text-xs text-white/60 mt-1">
              Top 8% of candidates
            </div>
          </div>

          {/* Category scores */}
          <div className="bg-surface border-2 border-secondary p-5">
            {scores.map(s => (
              <div key={s.label} className="mb-2.5">
                <div className="flex justify-between mb-0.5">
                  <span className="font-body text-xs text-secondary">{s.label}</span>
                  <span className="font-display font-black text-sm text-secondary">{s.score}</span>
                </div>
                <div className="h-[5px] bg-border-clr">
                  <div className={["h-full transition-[width] duration-1000", s.score >= 90 ? "bg-success" : "bg-primary"].join(" ")}
                    style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div className="bg-surface border-2 border-secondary p-5 mt-5">
          <div className="font-display font-extrabold text-[13px] tracking-[0.15em] uppercase text-secondary mb-3.5">
            Anti-Cheat &amp; Flags
          </div>
          <div className="flex gap-3 flex-wrap">
            {[
              { icon: "✅", text: "No scripted reading detected",      ok: true },
              { icon: "✅", text: "No external audio source detected", ok: true },
              { icon: "⚠️", text: "1 long pause on Redis question",   ok: false },
            ].map((f, i) => (
              <div key={i} className={[
                "flex items-center gap-2 py-1.5 px-3 text-xs font-body border",
                f.ok ? "bg-success-bg border-success text-success" : "bg-warning-bg border-warning text-warning",
              ].join(" ")}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Btn variant="secondary" onClick={() => onNavigate?.("candidate-profile")}>Back to Profile</Btn>
          <Btn onClick={() => onNavigate?.("interview-entry")}>View Full Report</Btn>
        </div>
      </div>
    </div>
  );
}
