import { useState } from "react";
import { T } from "../../theme/tokens";
import { Card } from "../../components/shared/Card";
import { Btn } from "../../components/shared/Btn";
import { Tag, StatusPill } from "../../components/shared/Badges";

const JOB = {
  title:       "Senior Backend Engineer",
  company:     "TechCorp Inc.",
  round:       "AI Voice Interview",
  roundNum:    4,
  totalRounds: 5,
  duration:    "20–30 minutes",
  skills:      ["Node.js", "AWS", "System Design", "Databases"],
  interviewer: "HR11 AI — Adaptive Voice Agent",
  notes: [
    "Your microphone and camera will be accessed.",
    "Questions are generated from your specific resume projects.",
    "The session is recorded and analysed for technical depth.",
    "Anti-cheat monitoring is active throughout.",
    "You can ask for clarification at any time.",
  ],
};

export function InterviewEntryPage({ onNavigate }) {
  const [ready, setReady] = useState(false);
  const [micOk, setMicOk] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: T.tertiary }}>

      {/* Minimal nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60,
        background: T.secondary, borderBottom: `2px solid ${T.secondary}`,
      }}>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20, color: "#fff" }}>
          HR<span style={{ color: T.primary }}>11</span>
          <span style={{ background: T.primary, color: "#fff", fontSize: 8, padding: "1px 5px", marginLeft: 6, letterSpacing: "0.1em" }}>AI</span>
        </div>
        <StatusPill status="live" />
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>

        {/* Top label */}
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            color: T.primary, border: `1px solid ${T.primary}33`,
            background: `${T.primary}10`, padding: "4px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.primary,
              animation: "pulse 1.5s infinite" }} />
            Interview Waiting Room
          </div>
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
            fontSize: "clamp(2rem,4vw,3rem)", textTransform: "uppercase",
            letterSpacing: "-0.01em", color: T.secondary, lineHeight: 1, marginBottom: 8 }}>
            READY TO BEGIN?
          </h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.inkLight }}>
            Review the details below before starting your interview
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>

          {/* Left — job + round info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Job card */}
            <Card style={{ padding: "24px" }}>
              <div style={{ borderLeft: `4px solid ${T.primary}`, paddingLeft: 14, marginBottom: 20 }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 22,
                  textTransform: "uppercase", color: T.secondary, marginBottom: 4 }}>{JOB.title}</div>
                <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight }}>{JOB.company}</div>
              </div>

              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                {JOB.skills.map(s => <Tag key={s}>{s}</Tag>)}
              </div>

              {/* Round progress */}
              <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 12,
                    letterSpacing: "0.15em", textTransform: "uppercase", color: T.secondary }}>
                    Round {JOB.roundNum} of {JOB.totalRounds}
                  </span>
                  <span style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 14, color: T.primary }}>
                    {JOB.round}
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 6, background: T.border, width: "100%" }}>
                  <div style={{ height: "100%", background: T.primary, width: `${(JOB.roundNum / JOB.totalRounds) * 100}%`, transition: "width 0.5s" }} />
                </div>
              </div>
            </Card>

            {/* Interview details */}
            <Card style={{ padding: "20px" }}>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                letterSpacing: "0.15em", textTransform: "uppercase", color: T.secondary, marginBottom: 14 }}>
                Session Details
              </div>
              {[
                { icon: "⏱", label: "Duration",     val: JOB.duration },
                { icon: "🤖", label: "Interviewer",  val: JOB.interviewer },
                { icon: "🎙️", label: "Format",       val: "Real-time voice conversation" },
                { icon: "📊", label: "Evaluation",   val: "Technical depth + communication clarity" },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", gap: 10, padding: "8px 0",
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0, width: 24, textAlign: "center" }}>{item.icon}</span>
                  <div>
                    <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 10,
                      letterSpacing: "0.12em", textTransform: "uppercase", color: T.inkFaint }}>{item.label}</div>
                    <div style={{ fontFamily: T.fontBody, fontSize: 13, color: T.secondary, marginTop: 1 }}>{item.val}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Right — checklist + start */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ padding: "20px" }}>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                letterSpacing: "0.15em", textTransform: "uppercase", color: T.secondary, marginBottom: 14 }}>
                Before You Start
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {JOB.notes.map((n, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 18, height: 18, background: T.primary, flexShrink: 0, marginTop: 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 9, color: "#fff" }}>
                      {i + 1}
                    </div>
                    <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.inkLight, lineHeight: 1.5 }}>{n}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mic check */}
            <Card style={{ padding: "20px" }}>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                letterSpacing: "0.15em", textTransform: "uppercase", color: T.secondary, marginBottom: 12 }}>
                Mic Check
              </div>
              <button
                onClick={() => setMicOk(true)}
                style={{
                  width: "100%", padding: "12px",
                  background: micOk ? T.successBg : T.surfaceAlt,
                  border: `2px solid ${micOk ? T.success : T.border}`,
                  cursor: "pointer", fontFamily: T.fontDisplay, fontWeight: 800,
                  fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: micOk ? T.success : T.secondary, transition: T.transColor,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {micOk ? "✓ Microphone Ready" : "🎙️ Test Microphone"}
              </button>
              {micOk && (
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32, marginTop: 10, justifyContent: "center" }}>
                  {[0,1,2,3,4,5,6].map(i => (
                    <div key={i} style={{
                      width: 4, background: T.primary, borderRadius: 2,
                      animation: `waveBar 0.8s ease ${i * 0.1}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </Card>

            {/* Start button */}
            <Btn fullWidth onClick={() => onNavigate?.("interview")} disabled={!micOk}
              style={{ padding: "18px", fontSize: 16 }}>
              {micOk ? "START INTERVIEW →" : "COMPLETE MIC CHECK FIRST"}
            </Btn>

            <p style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody, textAlign: "center", lineHeight: 1.5 }}>
              Once started, you cannot pause the session.<br />Ensure you're in a quiet environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
