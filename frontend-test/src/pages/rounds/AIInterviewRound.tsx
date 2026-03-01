import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import {
  startRound,
  completeRound,
  getNextRoundPath,
  getNextRoundLabel,
} from "../../services/pipeline";

const CANDIDATE = {
  name: "Arjun Mehta",
  avatar: "AM",
  role: "Senior Backend Engineer",
};

const AI_QUESTIONS = [
  "Tell me about your experience with distributed systems at Zomato.",
  "How would you design a real-time notification system at scale?",
  "Explain a time you debug-ged a production issue under pressure.",
  "What's your approach to writing testable backend code?",
  "Walk me through a system you designed end-to-end.",
  "How do you decide between SQL and NoSQL for a new service?",
];

export function AIInterviewRound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [ended, setEnded] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: string; text: string }[]
  >([]);
  const chatRef = useRef<HTMLDivElement>(null);

  /* mark pipeline */
  useEffect(() => {
    startRound("ai-interview");
  }, []);

  /* timer */
  useEffect(() => {
    if (!started || ended) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [started, ended]);

  /* simulate AI asking questions */
  useEffect(() => {
    if (!started || ended) return;
    const t = setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        { role: "ai", text: AI_QUESTIONS[currentQ] },
      ]);
      setAiSpeaking(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [started, currentQ, ended]);

  /* auto-scroll chat */
  useEffect(() => {
    chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [transcript]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const handleRespond = () => {
    setTranscript((prev) => [
      ...prev,
      { role: "candidate", text: "(Your spoken response was recorded)" },
    ]);
    if (currentQ < AI_QUESTIONS.length - 1) {
      setTimeout(() => {
        setAiSpeaking(true);
        setCurrentQ((c) => c + 1);
      }, 1200);
    } else {
      setTimeout(() => setEnded(true), 1200);
    }
  };

  /* ── Lobby – before starting ── */
  if (!started) {
    return (
      <div className="h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="text-center max-w-[520px]">
          <div className="text-5xl mb-4"></div>
          <div className="font-display font-black text-3xl uppercase tracking-tight mb-3">
            AI VOICE INTERVIEW
          </div>
          <div className="font-body text-sm text-[#999] mb-6 leading-relaxed">
            You'll be interviewed by our AI agent. It will ask{" "}
            {AI_QUESTIONS.length} adaptive questions based on your resume. Speak
            naturally — your responses are analysed for technical depth,
            communication, and confidence.
          </div>

          <div className="bg-[#222] border border-[#333] p-5 mb-6 text-left">
            <div className="font-display font-bold text-xs tracking-[0.1em] uppercase text-[#888] mb-3">
              Interview Setup
            </div>
            {[
              ["Duration", "20–30 min"],
              ["Questions", `${AI_QUESTIONS.length} adaptive`],
              ["Anti-Cheat", "Active monitoring"],
              ["Recording", "Audio only"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between py-1.5 border-b border-[#333] last:border-0"
              >
                <span className="font-body text-xs text-[#888]">{k}</span>
                <span className="font-display font-bold text-xs text-white">
                  {v}
                </span>
              </div>
            ))}
          </div>

          <Btn
            onClick={() => {
              setAiSpeaking(true);
              setStarted(true);
            }}
          >
            Start Interview →
          </Btn>
        </div>
      </div>
    );
  }

  /* ── Ended ── */
  if (ended) {
    return (
      <div className="h-screen bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="text-center max-w-[480px]">
          <div className="text-5xl mb-4"></div>
          <div className="font-display font-black text-3xl uppercase tracking-tight mb-2">
            Interview Complete
          </div>
          <div className="font-body text-sm text-[#999] mb-6">
            Duration: {mm}:{ss} · {AI_QUESTIONS.length} questions answered
          </div>
          <div className="border border-[#1A8917] bg-[#1A8917]/10 p-5 mb-6">
            <div className="font-display font-extrabold text-sm uppercase text-[#4ec94e] mb-1">
              Selected for next round
            </div>
            <div className="font-body text-xs text-[#999]">
              AI Score: 88/100 · Communication: 9.1/10 · Technical Depth: 8.7/10
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Btn
              variant="secondary"
              onClick={() => navigate("/candidate-profile")}
            >
              Back to Profile
            </Btn>
            <Btn
              onClick={() => {
                completeRound("ai-interview");
                const next = getNextRoundPath(jobId, "ai_voice_interview");
                navigate(next || "/candidate-profile");
              }}
            >
              {getNextRoundLabel(jobId, "ai_voice_interview")
                ? `Next: ${getNextRoundLabel(jobId, "ai_voice_interview")} →`
                : "Back to Profile"}
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  /* ── Meet-like interview ── */
  return (
    <div className="h-screen flex flex-col bg-[#111] overflow-hidden">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-[52px] bg-[#1a1a1a] border-b border-[#333] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-display font-black text-lg text-white">
            HR<span className="text-primary">11</span>
          </span>
          <span className="text-xs font-display font-bold text-[#666] uppercase tracking-[0.1em]">
            AI Interview
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#888] font-display font-bold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            REC {mm}:{ss}
          </span>
          <span className="text-xs text-[#666] font-body">
            Q{currentQ + 1}/{AI_QUESTIONS.length}
          </span>
        </div>
      </nav>

      {/* Video area */}
      <div className="flex-1 flex items-center justify-center gap-6 p-8">
        {/* Candidate box */}
        <div className="w-[400px] h-[400px] bg-[#1e1e1e] border-2 border-[#333] flex flex-col items-center justify-center relative">
          {videoOff ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 bg-secondary flex items-center justify-center font-display font-black text-3xl text-white">
                {CANDIDATE.avatar}
              </div>
              <div className="font-display font-bold text-sm text-white">
                {CANDIDATE.name}
              </div>
              <div className="text-xs text-[#666] font-body">Camera off</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-black text-4xl text-white relative">
                {CANDIDATE.avatar}
                {/* fake video frame indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50" />
              </div>
              <div className="font-display font-bold text-sm text-white">
                {CANDIDATE.name}
              </div>
              <div className="text-xs text-primary font-body font-semibold">
                {CANDIDATE.role}
              </div>
            </div>
          )}
          {/* Label */}
          <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 text-[10px] font-display font-bold text-white uppercase">
            You
          </div>
          {muted && (
            <div className="absolute top-3 right-3 bg-red-500/80 px-2 py-1 text-[10px] font-bold text-white">
              Muted
            </div>
          )}
        </div>

        {/* AI box */}
        <div className="w-[400px] h-[400px] bg-[#1e1e1e] border-2 border-[#333] flex flex-col items-center justify-center relative">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all duration-300 ${
              aiSpeaking
                ? "bg-primary/20 scale-110 animate-pulse"
                : "bg-[#252526]"
            }`}
          ></div>
          <div className="font-display font-bold text-sm text-white mt-3">
            PromptHire AI Interviewer
          </div>
          <div className="text-xs text-[#888] font-body mt-1">
            {aiSpeaking ? "Speaking…" : "Listening…"}
          </div>

          {/* Current question display */}
          {transcript.length > 0 && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 px-3 py-2">
              <div className="text-[11px] text-white font-body leading-snug line-clamp-2">
                "
                {transcript[transcript.length - 1]?.role === "ai"
                  ? transcript[transcript.length - 1].text
                  : AI_QUESTIONS[currentQ]}
                "
              </div>
            </div>
          )}

          {/* Label */}
          <div className="absolute top-3 left-3 bg-primary/80 px-2 py-1 text-[10px] font-display font-bold text-white uppercase">
            AI Interviewer
          </div>
        </div>
      </div>

      {/* Transcript sidebar */}
      <div className="absolute right-0 top-[52px] bottom-[72px] w-[280px] bg-[#1a1a1a] border-l border-[#333] flex flex-col">
        <div className="px-4 py-3 border-b border-[#333]">
          <span className="font-display font-extrabold text-xs text-[#888] uppercase tracking-[0.1em]">
            Live Transcript
          </span>
        </div>
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto p-3 flex flex-col gap-2"
        >
          {transcript.map((msg, i) => (
            <div
              key={i}
              className={`p-2 text-xs font-body leading-snug ${
                msg.role === "ai"
                  ? "bg-primary/10 border-l-2 border-primary text-[#ccc]"
                  : "bg-[#252526] border-l-2 border-[#555] text-[#999]"
              }`}
            >
              <div className="text-[10px] font-display font-bold uppercase mb-0.5 opacity-60">
                {msg.role === "ai" ? "AI" : "You"}
              </div>
              {msg.text}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="h-[72px] bg-[#1a1a1a] border-t border-[#333] flex items-center justify-center gap-4 shrink-0 z-20">
        <button
          onClick={() => setMuted(!muted)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-colors ${
            muted
              ? "bg-red-500 text-white"
              : "bg-[#333] text-white hover:bg-[#444]"
          }`}
        >
          {muted ? "" : ""}
        </button>
        <button
          onClick={() => setVideoOff(!videoOff)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl cursor-pointer transition-colors ${
            videoOff
              ? "bg-red-500 text-white"
              : "bg-[#333] text-white hover:bg-[#444]"
          }`}
        >
          {videoOff ? "" : ""}
        </button>

        {/* Respond button */}
        <button
          onClick={handleRespond}
          disabled={aiSpeaking}
          className={`px-8 py-3 font-display font-extrabold text-xs tracking-[0.1em] uppercase border-2 cursor-pointer transition-all ${
            aiSpeaking
              ? "border-[#333] bg-[#222] text-[#555] cursor-not-allowed"
              : "border-primary bg-primary text-white hover:bg-[#c44013]"
          }`}
        >
          {aiSpeaking ? "AI is speaking…" : " I'm done responding"}
        </button>

        <button
          onClick={() => setEnded(true)}
          className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg cursor-pointer hover:bg-red-700 transition-colors"
        ></button>
      </div>
    </div>
  );
}
