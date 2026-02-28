import { useState, useEffect, useRef } from "react";
import { T } from "../../theme/tokens";
import { Btn } from "../../assets/components/shared/Btn";

const TRANSCRIPT = [
  { role: "ai",        text: "Hi Arjun, I've reviewed your resume and I'm excited to learn more about your work. Let's start with your experience at Zomato. You mentioned you built a real-time order tracking system. Can you walk me through the architecture decisions you made?" },
  { role: "candidate", text: "Sure! So the main challenge was sub-second latency for 50k concurrent orders. We ended up using a combination of WebSockets for the frontend connection and Redis pub/sub as the message broker between our delivery microservices." },
  { role: "ai",        text: "Interesting choice. Why Redis pub/sub over something like Kafka for that use case? What trade-offs did you consider?" },
  { role: "candidate", text: "Kafka would have been better for durability and replay, but for order tracking we prioritised lower latency and simpler ops overhead. Orders have a natural TTL so we didn't need long-term retention. Redis gave us sub-5ms message delivery which Kafka couldn't reliably match at that throughput." },
  { role: "ai",        text: "That's a solid reasoning. One follow-up — how did you handle the scenario where a Redis node goes down during peak traffic? Did you implement any failover strategy?" },
];

function VoiceWave({ active }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 40, justifyContent: "center" }}>
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: active ? T.primary : T.border,
          animation: active ? `waveBar 0.6s ease ${i * 0.07}s infinite` : "none",
          height: active ? undefined : 8,
          minHeight: 4,
        }} />
      ))}
    </div>
  );
}

export function InterviewPage({ onNavigate }) {
  const [elapsed,     setElapsed]     = useState(0);
  const [aiTalking,   setAiTalking]   = useState(true);
  const [userTalking, setUserTalking] = useState(false);
  const [messages,    setMessages]    = useState([TRANSCRIPT[0]]);
  const [msgIdx,      setMsgIdx]      = useState(0);
  const [muted,       setMuted]       = useState(false);
  const [ended,       setEnded]       = useState(false);
  const [showReport,  setShowReport]  = useState(false);
  const chatRef = useRef(null);

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

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  if (showReport) return <ReportView onNavigate={onNavigate} />;

  return (
    <div style={{ minHeight: "100vh", background: T.secondary, display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{
        height: 60, background: T.secondary,
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", flexShrink: 0,
      }}>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: "#fff" }}>
          HR<span style={{ color: T.primary }}>11</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: T.fontBody, marginLeft: 12, fontWeight: 400 }}>
            AI Voice Interview · Senior Backend Engineer
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary,
              animation: "pulse 1.5s infinite" }} />
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 11,
              color: T.primary, letterSpacing: "0.15em" }}>LIVE</span>
          </div>
          {/* Timer */}
          <div style={{ fontFamily: T.fontMono, fontSize: 16, color: "#fff",
            background: "rgba(255,255,255,0.08)", padding: "6px 14px",
            border: "1px solid rgba(255,255,255,0.1)" }}>
            {fmt(elapsed)}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", overflow: "hidden" }}>

        {/* Left — AI agent + controls */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "40px", gap: 32,
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}>

          {/* AI avatar */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 120, height: 120, margin: "0 auto 20px",
              background: aiTalking ? T.primary : "rgba(255,255,255,0.08)",
              border: `3px solid ${aiTalking ? T.primary : "rgba(255,255,255,0.15)"}`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 52,
              boxShadow: aiTalking ? `0 0 40px ${T.primary}44` : "none",
              transition: T.transBase,
            }}>🤖</div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 18,
              color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
              HR11 AI Interviewer
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              {aiTalking ? "Speaking…" : "Listening…"}
            </div>
          </div>

          {/* Voice wave */}
          <VoiceWave active={aiTalking} />

          {/* Divider */}
          <div style={{ width: 200, height: 1, background: "rgba(255,255,255,0.08)" }} />

          {/* Candidate status */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, margin: "0 auto 12px",
              background: userTalking ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
              border: `2px solid ${userTalking ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 24, color: "#fff",
              boxShadow: userTalking ? "0 0 24px rgba(255,255,255,0.15)" : "none",
              transition: T.transBase,
            }}>AM</div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14,
              color: "#fff", textTransform: "uppercase", marginBottom: 4 }}>Arjun Mehta</div>
            <VoiceWave active={userTalking && !muted} />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => setMuted(m => !m)}
              style={{
                width: 52, height: 52,
                background: muted ? T.dangerBg : "rgba(255,255,255,0.08)",
                border: `2px solid ${muted ? T.danger : "rgba(255,255,255,0.2)"}`,
                borderRadius: "50%", cursor: "pointer", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: T.transBase,
              }}>
              {muted ? "🔇" : "🎙️"}
            </button>

            <button
              onClick={() => { setEnded(true); setShowReport(true); }}
              style={{
                padding: "0 24px", height: 52,
                background: T.danger, border: `2px solid ${T.danger}`,
                color: "#fff", cursor: "pointer",
                fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
              End Interview
            </button>
          </div>

          {/* Anti-cheat indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "8px 16px", fontSize: 11,
          }}>
            <span style={{ color: T.primary }}>🔒</span>
            <span style={{ fontFamily: T.fontBody, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              Anti-cheat monitoring active
            </span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.success, marginLeft: 4 }} />
          </div>
        </div>

        {/* Right — transcript */}
        <div style={{
          display: "flex", flexDirection: "column",
          background: "rgba(255,255,255,0.03)",
        }}>
          <div style={{
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 11,
              color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Live Transcript
            </span>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px",
            display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} className="pop-in" style={{
                display: "flex", flexDirection: "column",
                alignItems: msg.role === "ai" ? "flex-start" : "flex-end",
              }}>
                <div style={{
                  fontSize: 9, fontFamily: T.fontDisplay, fontWeight: 800,
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  color: msg.role === "ai" ? T.primary : "rgba(255,255,255,0.4)",
                  marginBottom: 5,
                }}>
                  {msg.role === "ai" ? "HR11 AI" : "Arjun Mehta"}
                </div>
                <div style={{
                  maxWidth: "90%", padding: "10px 14px",
                  background: msg.role === "ai" ? "rgba(255,255,255,0.07)" : `${T.primary}22`,
                  border: `1px solid ${msg.role === "ai" ? "rgba(255,255,255,0.08)" : `${T.primary}44`}`,
                  fontFamily: T.fontBody, fontSize: 12.5, lineHeight: 1.6,
                  color: msg.role === "ai" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.75)",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            {aiTalking && msgIdx < TRANSCRIPT.length - 1 && (
              <div style={{ display: "flex", gap: 4, padding: "8px 4px" }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: T.primary, opacity: 0.5,
                    animation: `pulse 0.8s ease ${i*0.2}s infinite`,
                  }} />
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
function ReportView({ onNavigate }) {
  const scores = [
    { label: "Technical Depth",          score: 88 },
    { label: "Communication Clarity",    score: 82 },
    { label: "Problem Solving",          score: 91 },
    { label: "Redis / Distributed Sys",  score: 94 },
    { label: "System Design",            score: 85 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.tertiary, padding: "48px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)",
            textTransform: "uppercase", letterSpacing: "-0.01em", color: T.secondary, marginBottom: 8 }}>
            INTERVIEW COMPLETE
          </h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.inkLight }}>
            Your session has been analysed. Here's your performance summary.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Overall score */}
          <div style={{
            background: T.primary, border: `2px solid ${T.secondary}`,
            padding: "28px", textAlign: "center",
            boxShadow: T.shadow,
          }}>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 72,
              color: "#fff", lineHeight: 1 }}>88</div>
            <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
              color: "rgba(255,255,255,0.8)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 8 }}>
              Overall Score
            </div>
            <div style={{ fontFamily: T.fontBody, fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              Top 8% of candidates
            </div>
          </div>

          {/* Category scores */}
          <div style={{ background: T.surface, border: `2px solid ${T.secondary}`, padding: "20px" }}>
            {scores.map(s => (
              <div key={s.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 12, color: T.secondary }}>{s.label}</span>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 14, color: T.secondary }}>{s.score}</span>
                </div>
                <div style={{ height: 5, background: T.border }}>
                  <div style={{ height: "100%", background: s.score >= 90 ? T.success : T.primary, width: `${s.score}%`, transition: "width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        <div style={{ background: T.surface, border: `2px solid ${T.secondary}`, padding: "20px", marginTop: 20 }}>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13, letterSpacing: "0.15em",
            textTransform: "uppercase", color: T.secondary, marginBottom: 14 }}>Anti-Cheat & Flags</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { icon: "✅", text: "No scripted reading detected",      ok: true },
              { icon: "✅", text: "No external audio source detected", ok: true },
              { icon: "⚠️", text: "1 long pause on Redis question",   ok: false },
            ].map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 7,
                background: f.ok ? T.successBg : T.warningBg,
                border: `1px solid ${f.ok ? T.success : T.warning}`,
                padding: "6px 12px", fontSize: 12, fontFamily: T.fontBody,
                color: f.ok ? T.success : T.warning,
              }}>
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn variant="secondary" onClick={() => onNavigate?.("candidate-profile")}>Back to Profile</Btn>
          <Btn onClick={() => onNavigate?.("interview-entry")}>View Full Report</Btn>
        </div>
      </div>
    </div>
  );
}
