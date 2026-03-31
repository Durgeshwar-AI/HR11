import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Conversation } from "@11labs/client";
import { Btn } from "../../assets/components/shared/Btn";
import { interviewSessionApi, candidateApi } from "../../services/api";

// ─── SDK patch ────────────────────────────────────────────────────────────────
if (typeof window !== "undefined") {
  const _nativeSend = WebSocket.prototype.send;
  WebSocket.prototype.send = function (
    this: WebSocket,
    data: string | ArrayBufferLike | Blob | ArrayBufferView,
  ) {
    if (this.readyState !== WebSocket.OPEN) return; // drop silently
    _nativeSend.call(this, data);
  };
}
// ─────────────────────────────────────────────────────────────────────────────

type Role = "ai" | "candidate";

interface Message {
  role: Role;
  text: string;
}

/* ─── Animated voice bars ─── */
function VoiceWave({ active, bars = 9, color = "primary" }: { active: boolean; bars?: number; color?: string }) {
  const colorClass = color === "white" ? "bg-white/60" : "bg-primary";
  const idleClass = color === "white" ? "bg-white/20" : "bg-border-clr";
  return (
    <div className="flex gap-[3px] items-center h-8 justify-center">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-200 ${active ? colorClass : idleClass}`}
          style={
            active
              ? { animation: `waveBar 0.7s ease ${i * 0.06}s infinite` }
              : { height: 6 }
          }
        />
      ))}
    </div>
  );
}

/* ─── Status indicator dot ─── */
function StatusDot({ status }: { status: "connecting" | "live" | "ended" }) {
  const cls =
    status === "connecting"
      ? "bg-amber-400 animate-pulse"
      : status === "live"
        ? "bg-emerald-400 animate-pulse"
        : "bg-white/30";
  return <span className={`w-2 h-2 rounded-full inline-block ${cls}`} />;
}

/* ─── Main Interview Page ─── */
export function InterviewPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") ?? "";

  const [elapsed, setElapsed] = useState(0);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [muted, setMuted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [interviewId, setInterviewId] = useState("");
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<ReturnType<typeof Conversation.startSession> extends Promise<infer T> ? T : never>(null);
  const startedRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const isEndingRef = useRef(false);
  const attemptRef = useRef(1); // tracks which connection attempt we're on

  /* Timer */
  useEffect(() => {
    if (ended || connecting) return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [ended, connecting]);

  /* Auto-scroll transcript */
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  // Keep messagesRef in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  /* Safely end session exactly once */
  const safeEndSession = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    try {
      await conversationRef.current?.endSession();
    } catch {
      // WebSocket may already be closed — swallow
    }
  }, []);

  /* Start ElevenLabs session — prevent double invocation */
  const startConversation = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      setConnecting(true);
      setError(null);

      // Get signed URL + prompt overrides from our backend
      const {
        signedUrl,
        systemPrompt,
        firstMessage,
        candidateName,
        jobTitle,
        questions,
        interviewId,  // FIX 2: destructure interviewId from response
      } = await interviewSessionApi.startSession(jobId);
      setInterviewId(interviewId);

      // Read JWT token from localStorage (same key used by saveAuth)
      const token = localStorage.getItem("prompthire_token");

      // ElevenLabs enforces a hard limit on prompt override length via signed
      // URL sessions (~2000 chars is safe). Build a minimal prompt that stays
      // under the limit rather than embedding the full question list, which can
      // easily exceed it. The agent's dashboard prompt handles the full script;
      // we only inject the candidate name + job title so the greeting is correct.
      const PROMPT_CHAR_LIMIT = 1800;
      const minimalPrompt =
        `You are conducting an AI voice interview. ` +
        `The candidate's name is ${candidateName ?? "the candidate"}. ` +
        `The role is: ${jobTitle ?? "the open position"}. ` +
        `Greet them by name, then work through the interview questions you have been configured with. ` +
        `Be professional, concise, and encouraging.`;

      // Use the full system prompt only if it fits; otherwise fall back to the
      // minimal one.
      const safeSystemPrompt =
        systemPrompt.length <= PROMPT_CHAR_LIMIT ? systemPrompt : minimalPrompt;

      let stepIndex = 0;
      const questionList: Array<{ id: number; text: string; category: string }> = questions ?? [];

      const fallbackQuestions = [
        "Tell me about yourself and what has prepared you for this role.",
        "What interested you in this role and our company?",
        "Which skills or experiences make you a strong fit for this position?",
        "Can you walk me through a project or achievement that best shows your impact?",
        "Tell me about a time you handled a difficult challenge or conflict at work.",
        "How do you collaborate with teammates when priorities or opinions differ?",
        "How do you handle feedback, ambiguity, or pressure in day-to-day work?",
        "What would you want to accomplish in your first 90 days if you joined us?",
        "Where do you see your career heading over the next few years, and how does this role fit that plan?",
        "What compensation expectations do you have for this role?",
      ];

      const baseSessionConfig = {
        signedUrl,
        clientTools: {
          fetch_candidate_context: () =>
            JSON.stringify({
              name: candidateName ?? "Candidate",
              jobTitle: jobTitle ?? "the open position",
              resumeSummary: "",
              skills: [],
            }),

          fetch_next_question: () => {
            if (stepIndex < questionList.length) {
              const q = questionList[stepIndex++];
              return JSON.stringify({
                id: q.id,
                text: q.text,
                category: q.category,
                allowFollowUp: true,
                enableHint: false,
              });
            }
            const fb = fallbackQuestions[(stepIndex++ - questionList.length) % fallbackQuestions.length];
            return JSON.stringify({
              id: stepIndex,
              text: fb,
              category: "general",
              allowFollowUp: true,
              enableHint: false,
            });
          },

          // FIX 1+2+3: token, interviewId, and fresh messages all correctly resolved
          conclude_interview: async (params: { transcript?: string; hintsUsed?: string[] }) => {
            try {
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
              };
              if (token) headers["Authorization"] = `Bearer ${token}`;

              // FIX 3: use messagesRef.current — never stale
              const fallbackTranscript = messagesRef.current
                .map((m) => `${m.role}: ${m.text}`)
                .join("\n");

              await fetch("/api/agent/conclude", {
                method: "POST",
                headers,
                body: JSON.stringify({
                  interviewId,
                  fullTranscript: params?.transcript ?? fallbackTranscript,
                  hintsUsed: params?.hintsUsed ?? [],
                }),
              });
            } catch (e) {
              console.error("Failed to save transcript:", e);
            }
            return JSON.stringify({ status: "concluded" });
          },
        },
      };

      // Track which attempt we're on so onDisconnect can decide what to do.
      // attempt 1 → with prompt override
      // attempt 2 → no overrides at all (dashboard defaults)

      const sharedCallbacks = {
        onConnect: () => {
          setConnecting(false);
        },
        onDisconnect: () => {
          isEndingRef.current = true;

          // Session closed with zero messages = server silently rejected our
          // overrides (prompt too long, override permission disabled, or
          // transient error). On attempt 1, automatically retry with NO
          // overrides so the agent uses its dashboard-configured prompt.
          if (messagesRef.current.length === 0) {
            if (attemptRef.current === 1) {
              attemptRef.current = 2;
              isEndingRef.current = false;
              startedRef.current = false;
              setTimeout(() => startConversation(), 300);
              return;
            }
            // Both attempts failed
            startedRef.current = false;
            isEndingRef.current = false;
            setConnecting(false);
            setError(
              "Could not connect to the AI interviewer. Please check your microphone permissions and retry.",
            );
            return;
          }

          setEnded(true);
          setShowReport(true);
        },
        onModeChange: ({ mode }: { mode: string }) => {
          setAgentSpeaking(mode === "speaking");
          setUserSpeaking(mode === "listening");
        },
        onMessage: ({ message, source }: { message: string; source: string }) => {
          setMessages((prev) => [
            ...prev,
            { role: source === "ai" ? "ai" : "candidate", text: message },
          ]);
        },
        onError: (err: unknown) => {
          console.error("ElevenLabs error:", err);
          setError(typeof err === "string" ? err : "Connection error");
        },
      };

      // Attempt 1: override only the system prompt (stay under char limit).
      // If the server drops the connection silently, onDisconnect auto-retries
      // with no overrides (attempt 2) — using whatever the dashboard has.
      const sessionOptions =
        attemptRef.current === 1
          ? {
              ...baseSessionConfig,
              overrides: {
                agent: {
                  prompt: { prompt: safeSystemPrompt },
                  firstMessage: firstMessage || undefined,
                },
              },
              ...sharedCallbacks,
            }
          : { ...baseSessionConfig, ...sharedCallbacks }; // no overrides

      const conversation = await Conversation.startSession(sessionOptions);

      if (!conversation) {
        throw new Error("Failed to initialize conversation session");
      }

      conversationRef.current = conversation;
    } catch (err) {
      console.error("Failed to start interview session:", err);
      startedRef.current = false;
      setConnecting(false);
      setError(err instanceof Error ? err.message : "Failed to start session");
    }
  }, [jobId]);

  useEffect(() => {
    startConversation();
    return () => {
      // FIX 4: safeEndSession is idempotent — safe to call from cleanup
      safeEndSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeEndSession]);

  /* Mute / unmute — guard against calling on closed session */
  useEffect(() => {
    if (!conversationRef.current || isEndingRef.current) return;
    try {
      conversationRef.current.setVolume({ volume: muted ? 0 : 1 });
    } catch {
      // WebSocket may be closing — swallow
    }
  }, [muted]);

  const handleEnd = async () => {
    setEnded(true);
    await safeEndSession(); // FIX 4: use the guarded helper
    setShowReport(true);
  };

  const handleRetry = () => {
    setError(null);
    isEndingRef.current = false;
    startedRef.current = false;
    attemptRef.current = 1;
    startConversation();
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const connectionStatus = ended ? "ended" : connecting ? "connecting" : "live";

  if (showReport) return <ReportView interviewId={interviewId} />;

  return (
    <div className="h-screen bg-[#0d0f14] flex flex-col overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="h-[56px] bg-[#0d0f14] border-b border-white/[0.06] flex items-center justify-between px-7 shrink-0">
        <div className="flex items-center gap-4">
          <div className="font-display font-black text-lg text-white select-none">
            HR<span className="text-primary">11</span>
          </div>
          <div className="w-px h-5 bg-white/10" />
          <span className="font-body text-[11px] text-white/35 tracking-wider uppercase">
            AI Voice Interview
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-full py-1.5 px-3.5">
            <StatusDot status={connectionStatus} />
            <span className="font-display font-extrabold text-[10px] tracking-[0.15em] uppercase text-white/60">
              {connectionStatus === "connecting" ? "CONNECTING" : connectionStatus === "live" ? "LIVE" : "ENDED"}
            </span>
          </div>
          <div className="font-mono text-sm text-white/70 bg-white/[0.04] border border-white/[0.07] rounded py-1.5 px-3 tabular-nums">
            {fmt(elapsed)}
          </div>
        </div>
      </header>

      {/* ── Error banner ────────────────────────────────────── */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/30 text-red-400 text-sm font-body text-center py-2.5 px-4 flex items-center justify-center gap-3">
          <span>⚠️ {error}</span>
          <button
            className="underline cursor-pointer font-bold text-red-300 hover:text-red-200 transition-colors"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────── */}
      <div className="flex-1 min-h-0 grid grid-cols-[1fr_380px] overflow-hidden">
        {/* Left — Interview stage */}
        <div className="flex flex-col items-center justify-center p-10 gap-6 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: agentSpeaking
                ? "radial-gradient(circle at 50% 40%, rgba(232,82,26,0.06) 0%, transparent 60%)"
                : "radial-gradient(circle at 50% 40%, rgba(255,255,255,0.02) 0%, transparent 60%)",
              transition: "background 0.5s ease",
            }}
          />

          {/* AI avatar */}
          <div className="relative z-10 text-center">
            <div
              className={[
                "w-[130px] h-[130px] mx-auto mb-5 rounded-full flex items-center justify-center transition-all duration-300 relative",
                agentSpeaking
                  ? "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40"
                  : "bg-white/[0.04] border-2 border-white/[0.08]",
              ].join(" ")}
            >
              {agentSpeaking && (
                <div className="absolute inset-[-8px] rounded-full border-2 border-primary/20 animate-ping" />
              )}
              <span className="text-[52px]">🤖</span>
            </div>
            <h2 className="font-display font-black text-base text-white tracking-[0.08em] uppercase mb-1">
              HR11 AI Interviewer
            </h2>
            <p className="font-body text-[11px] text-white/30">
              {connecting ? "Establishing connection…" : agentSpeaking ? "Speaking…" : "Listening to you…"}
            </p>
          </div>

          <VoiceWave active={agentSpeaking} bars={11} />

          <div className="flex items-center gap-3 w-[200px]">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] text-white/20 font-display tracking-[0.2em] uppercase">vs</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Candidate status */}
          <div className="relative z-10 text-center">
            <div
              className={[
                "w-[72px] h-[72px] mx-auto mb-2.5 rounded-full flex items-center justify-center font-display font-black text-lg text-white transition-all duration-300",
                userSpeaking
                  ? "bg-white/[0.1] border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                  : "bg-white/[0.03] border-2 border-white/[0.06]",
              ].join(" ")}
            >
              YOU
            </div>
            <p className="font-display font-bold text-[11px] text-white/40 uppercase tracking-[0.1em] mb-1.5">
              Candidate
            </p>
            <VoiceWave active={userSpeaking && !muted} bars={7} color="white" />
          </div>

          {/* Controls */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setMuted((m) => !m)}
              title={muted ? "Unmute" : "Mute"}
              className={[
                "w-12 h-12 rounded-full cursor-pointer text-lg flex items-center justify-center transition-all duration-200",
                muted
                  ? "bg-red-500/15 border-2 border-red-500/40 hover:bg-red-500/25"
                  : "bg-white/[0.05] border-2 border-white/10 hover:bg-white/[0.08]",
              ].join(" ")}
            >
              {muted ? "\uD83D\uDD07" : "\uD83C\uDF99\uFE0F"}
            </button>

            <button
              onClick={handleEnd}
              disabled={connecting || ended}
              className="h-12 px-7 bg-red-600 hover:bg-red-700 border-0 text-white cursor-pointer rounded-full font-display font-extrabold text-[12px] tracking-[0.12em] uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              End Interview
            </button>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] rounded-full py-1.5 px-4">
            <span className="text-[10px] text-primary">🔒</span>
            <span className="font-body text-white/25 text-[10px]">
              Anti-cheat monitoring active
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          </div>
        </div>

        {/* Right — transcript panel */}
        <div className="flex flex-col min-h-0 bg-white/[0.02] border-l border-white/[0.06]">
          <div className="py-3.5 px-5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="font-display font-extrabold text-[10px] text-white/40 tracking-[0.18em] uppercase">
              Live Transcript
            </span>
            <span className="font-mono text-[10px] text-white/20">
              {messages.length} messages
            </span>
          </div>

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto py-5 px-4 flex flex-col gap-3.5"
          >
            {messages.length === 0 && !error && (
              <div className="text-center mt-12 px-4">
                <div className="text-3xl mb-3 opacity-30">🎙️</div>
                <p className="font-body text-sm text-white/20">
                  {connecting
                    ? "Connecting to AI interviewer…"
                    : "Waiting for the conversation to begin…"}
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={[
                  "pop-in flex flex-col",
                  msg.role === "ai" ? "items-start" : "items-end",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[9px] font-display font-extrabold tracking-[0.15em] uppercase mb-1",
                    msg.role === "ai" ? "text-primary/70" : "text-white/25",
                  ].join(" ")}
                >
                  {msg.role === "ai" ? "PromptHire AI" : "You"}
                </span>
                <div
                  className={[
                    "max-w-[88%] py-2.5 px-3.5 rounded font-body text-[12.5px] leading-relaxed",
                    msg.role === "ai"
                      ? "bg-white/[0.05] border border-white/[0.06] text-white/80"
                      : "bg-primary/10 border border-primary/20 text-white/65",
                  ].join(" ")}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {agentSpeaking && (
              <div className="flex gap-1.5 py-2 px-1 items-center">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary/60"
                    style={{ animation: `pulse 1s ease ${i * 0.15}s infinite` }}
                  />
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
function ReportView({ interviewId }: { interviewId: string }) {
  const navigate = useNavigate();
  const [result, setResult] = useState<{
    status: string;
    overallScore?: number;
    technicalAccuracy?: number;
    communicationScore?: number;
    hintRelianceScore?: number;
    questionBreakdown?: Array<{
      stepNumber?: number;
      questionText?: string;
      level?: string;
      candidateAnswerSummary?: string;
      score?: number;
      hintWasUsed?: boolean;
      keyConceptsCovered?: string[];
    }>;
    strengths?: string[];
    weaknesses?: string[];
    completedAt?: string;
    evaluatedAt?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!interviewId) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const loadResult = async () => {
      try {
        const data = await candidateApi.interviewResult(interviewId);
        if (cancelled) return;
        setResult(data);

        if (data.status !== "Evaluated") {
          timer = window.setTimeout(() => {
            void loadResult();
          }, 4000);
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "Failed to load interview result");
      }
    };

    void loadResult();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [interviewId]);

  const loading = Boolean(interviewId) && (!result || result.status !== "Evaluated") && !errorMessage;
  const fetchError = !interviewId ? "Interview ID is missing." : errorMessage;

  const scoreCards = result?.questionBreakdown?.length
    ? result.questionBreakdown.map((item) => ({
        label: item.questionText || `Question ${item.stepNumber ?? ""}`,
        score: item.score ?? 0,
      }))
    : [
        { label: "Technical Depth", score: result?.technicalAccuracy ? Math.round(result.technicalAccuracy * 10) : 0 },
        { label: "Communication Clarity", score: result?.communicationScore ? Math.round(result.communicationScore * 10) : 0 },
        { label: "Hint Reliance", score: result?.hintRelianceScore ? Math.round(result.hintRelianceScore * 10) : 0 },
      ];

  const overall = result?.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center py-12 px-6">
      <div className="max-w-[740px] w-full">
        <div className="fade-up text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mx-auto mb-4 flex items-center justify-center text-3xl">
            ✅
          </div>
          <h1 className="font-display font-black text-[clamp(2rem,4vw,2.8rem)] uppercase tracking-tight text-white mb-2 leading-none">
            INTERVIEW COMPLETE
          </h1>
          <p className="font-body text-sm text-white/40">
            {loading
              ? "Your session is being analysed. This report will refresh automatically once the evaluation is ready."
              : "Your session has been analysed. Here's your performance summary."}
          </p>
        </div>

        {fetchError && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {fetchError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-primary/90 to-primary border border-primary/40 p-8 rounded-lg text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="relative z-10">
              <div className="font-display font-black text-[72px] text-white leading-none">
                {loading ? "—" : overall}
              </div>
              <div className="font-display font-extrabold text-[12px] text-white/70 tracking-[0.18em] uppercase mt-2">
                Overall Score
              </div>
              <div className="font-body text-[11px] text-white/50 mt-1">
                {loading ? "Evaluating now" : "Evaluation complete"}
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.07] p-5 rounded-lg">
            {scoreCards.map((s, idx) => (
              <div key={s.label} className={idx < scoreCards.length - 1 ? "mb-3.5" : ""}>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-[11px] text-white/50">{s.label}</span>
                  <span className="font-display font-black text-sm text-white/80">{s.score}</span>
                </div>
                <div className="h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className={["h-full rounded-full transition-[width] duration-1000", s.score >= 90 ? "bg-emerald-500" : "bg-primary"].join(" ")}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] p-5 mt-5 rounded-lg">
          <div className="font-display font-extrabold text-[11px] tracking-[0.18em] uppercase text-white/40 mb-3.5">
            Anti-Cheat &amp; Flags
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {[
              { icon: "✅", text: result?.strengths?.[0] || "No scripted reading detected", ok: true },
              { icon: "✅", text: result?.strengths?.[1] || "No external audio source detected", ok: true },
              { icon: "⚠️", text: result?.weaknesses?.[0] || "No major red flags recorded", ok: false },
            ].map((f, i) => (
              <div
                key={i}
                className={[
                  "flex items-center gap-2 py-1.5 px-3 rounded text-[11px] font-body border",
                  f.ok
                    ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-400/80"
                    : "bg-amber-500/8 border-amber-500/20 text-amber-400/80",
                ].join(" ")}
              >
                <span>{f.icon}</span> {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3 justify-center">
          <Btn variant="secondary" onClick={() => navigate("/candidate-profile")}>
            Back to Profile
          </Btn>
          <Btn onClick={() => navigate("/candidate-profile")}>View Full Report</Btn>
        </div>
      </div>
    </div>
  );
}
