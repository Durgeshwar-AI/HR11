import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import { technicalApi, getStoredUser } from "../../services/api";
import { startRound, completeRound, getNextRoundPath, getNextRoundLabel } from "../../services/pipeline";

/* ── Fallback mock questions ── */
const MOCK_QUESTIONS = Array.from({ length: 25 }, (_, i) => {
  const pool = [
    {
      q: "What happens when you type a URL into the browser and press Enter?",
      opts: [
        "DNS lookup → TCP handshake → HTTP request → Render page",
        "HTTP request → DNS lookup → Render page",
        "Render page → DNS lookup → HTTP request",
        "TCP handshake → Render page → DNS lookup",
      ],
      ans: 0,
    },
    {
      q: "Which consistency model does Amazon DynamoDB use by default?",
      opts: [
        "Strong consistency",
        "Eventual consistency",
        "Causal consistency",
        "Linearizability",
      ],
      ans: 1,
    },
    {
      q: "What is the CAP theorem?",
      opts: [
        "A distributed system can guarantee only two of: Consistency, Availability, Partition tolerance",
        "Every system must have Caching, APIs, and Parallelism",
        "Code, Architecture, Performance must be balanced",
        "Compute, Access, and Persistence layers must be separate",
      ],
      ans: 0,
    },
    {
      q: "In microservices, what is a circuit breaker pattern?",
      opts: [
        "A pattern to prevent cascading failures between services",
        "A load balancing strategy",
        "A way to split databases",
        "An authentication flow",
      ],
      ans: 0,
    },
    {
      q: "What is the difference between horizontal and vertical scaling?",
      opts: [
        "Horizontal = add more machines; Vertical = add more power to existing machine",
        "Horizontal = more CPU cores; Vertical = more machines",
        "They are the same",
        "Horizontal = more storage; Vertical = more network bandwidth",
      ],
      ans: 0,
    },
    {
      q: "What is database sharding?",
      opts: [
        "Splitting data across multiple databases",
        "Encrypting database records",
        "Creating database backups",
        "Indexing all columns",
      ],
      ans: 0,
    },
    {
      q: "Which of these is a message broker?",
      opts: ["React", "Apache Kafka", "Nginx", "Tailwind"],
      ans: 1,
    },
    {
      q: "What is eventual consistency?",
      opts: [
        "All reads will eventually return the last written value",
        "All writes are immediately visible",
        "Data is never consistent",
        "Consistent only during low traffic",
      ],
      ans: 0,
    },
    {
      q: "What is a reverse proxy?",
      opts: [
        "A server that forwards client requests to backend servers",
        "A client-side caching layer",
        "A database replication tool",
        "A frontend framework",
      ],
      ans: 0,
    },
    {
      q: "What is the purpose of a CDN?",
      opts: [
        "Serve content from geographically closer servers",
        "Compile code faster",
        "Manage database connections",
        "Handle authentication",
      ],
      ans: 0,
    },
    {
      q: "What does CORS protect against?",
      opts: [
        "Unauthorised cross-origin requests",
        "SQL injection",
        "Buffer overflows",
        "Denial of service",
      ],
      ans: 0,
    },
    {
      q: "What is a webhook?",
      opts: [
        "An HTTP callback triggered by an event",
        "A type of WebSocket",
        "A frontend hook",
        "A Git command",
      ],
      ans: 0,
    },
    {
      q: "What is the difference between TCP and UDP?",
      opts: [
        "TCP is connection-oriented and reliable; UDP is connectionless and faster",
        "They are identical",
        "UDP is more reliable",
        "TCP is faster",
      ],
      ans: 0,
    },
    {
      q: "What is containerisation?",
      opts: [
        "Packaging an app with its dependencies into an isolated unit",
        "Splitting code into modules",
        "A type of encryption",
        "A CSS layout technique",
      ],
      ans: 0,
    },
    {
      q: "What is a race condition?",
      opts: [
        "When the outcome depends on the timing of uncontrollable events",
        "When code runs too fast",
        "When two databases conflict",
        "When a thread pool is full",
      ],
      ans: 0,
    },
    {
      q: "What is an idempotent operation?",
      opts: [
        "Produces the same result regardless of how many times it is called",
        "Runs only once",
        "Cannot be reversed",
        "Requires authentication",
      ],
      ans: 0,
    },
    {
      q: "What is gRPC used for?",
      opts: [
        "High-performance RPC communication between services",
        "Frontend state management",
        "CSS preprocessing",
        "File compression",
      ],
      ans: 0,
    },
    {
      q: "What is blue-green deployment?",
      opts: [
        "Running two identical environments and switching traffic between them",
        "Deploying to two clouds",
        "Using green energy servers",
        "A testing methodology",
      ],
      ans: 0,
    },
    {
      q: "What is the N+1 query problem?",
      opts: [
        "Executing one query to fetch a list, then N queries for each item",
        "Having N+1 database servers",
        "An algorithm complexity issue",
        "A REST API versioning strategy",
      ],
      ans: 0,
    },
    {
      q: "What is rate limiting?",
      opts: [
        "Controlling the number of requests a client can make in a time window",
        "Limiting database size",
        "Slowing down server responses",
        "Restricting file uploads",
      ],
      ans: 0,
    },
    {
      q: "What is a JWT?",
      opts: [
        "A compact token format for securely transmitting information",
        "A JavaScript testing library",
        "A database query language",
        "A WebSocket protocol",
      ],
      ans: 0,
    },
    {
      q: "What is event sourcing?",
      opts: [
        "Storing state changes as a sequence of events",
        "Listening to DOM events",
        "A type of pub/sub",
        "Using EventEmitter in Node.js",
      ],
      ans: 0,
    },
    {
      q: "What is the purpose of a service mesh?",
      opts: [
        "Manage microservice communication, observability, and security",
        "Create HTML templates",
        "Define REST endpoints",
        "Compile TypeScript",
      ],
      ans: 0,
    },
    {
      q: "What is a materialized view?",
      opts: [
        "A precomputed query result stored as a table",
        "A frontend component pattern",
        "A type of index",
        "A cache invalidation strategy",
      ],
      ans: 0,
    },
    {
      q: "What is the difference between authentication and authorisation?",
      opts: [
        "Authentication verifies identity; authorisation verifies permissions",
        "They are the same",
        "Authorisation comes before authentication",
        "Authentication is for APIs; authorisation is for databases",
      ],
      ans: 0,
    },
  ];
  return { id: i + 1, ...pool[i % pool.length] };
});

type Question = { id: string; q: string; opts: string[]; ans?: number };
type QStatus = "unanswered" | "answered" | "flagged";

export function TechnicalInterviewRound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const candidateId = searchParams.get("candidateId") || getStoredUser()?._id || "";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ totalScore: number; maxScore: number; percentage: number } | null>(null);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 min
  const [leftWidth, setLeftWidth] = useState(65);

  type ApiQuestion = { _id: string; text: string; options: string[] };

  /* timer */
  useState(() => {
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) { clearInterval(iv); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  });

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  /* mark pipeline */
  useEffect(() => { startRound("technical"); }, []);

  /* Fetch questions from backend, fallback to mock */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await technicalApi.getQuestions({ limit: 25, jobId: jobId || undefined });
        if (!cancelled && data.questions?.length) {
          setQuestions(
            (data.questions as ApiQuestion[]).map((q) => ({ id: q._id, q: q.text, opts: q.options })),
          );
        } else {
          throw new Error("empty");
        }
      } catch {
        if (!cancelled) {
          setQuestions(
            MOCK_QUESTIONS.map((mq, i) => ({ id: String(i + 1), q: mq.q, opts: mq.opts, ans: mq.ans })),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [jobId]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = leftWidth;
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const vw = window.innerWidth;
        const newW = Math.min(80, Math.max(30, startW + (dx / vw) * 100));
        setLeftWidth(newW);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [leftWidth],
  );

  const selectAnswer = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qIdx]: optIdx }));
  };

  const toggleFlag = (qIdx: number) => {
    setFlags((f) => {
      const n = new Set(f);
      if (n.has(qIdx)) {
        n.delete(qIdx);
      } else {
        n.add(qIdx);
      }
      return n;
    });
  };

  const getStatus = (qIdx: number): QStatus => {
    if (flags.has(qIdx)) return "flagged";
    if (answers[qIdx] !== undefined) return "answered";
    return "unanswered";
  };

  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const apiAnswers = questions.map((q, i) => ({
        questionId: q.id,
        selectedOption: answers[i] ?? -1,
      }));
      const data: any = await technicalApi.submit({ jobId, candidateId, answers: apiAnswers });
      setResult({ totalScore: data.totalScore, maxScore: data.maxScore, percentage: data.percentage });
    } catch {
      const localScore = questions.reduce(
        (acc, q, i) => (q.ans !== undefined && answers[i] === q.ans ? acc + 1 : acc), 0,
      );
      setResult({
        totalScore: localScore,
        maxScore: questions.length,
        percentage: Math.round((localScore / questions.length) * 100),
      });
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  const q = questions[current];

  if (loading || !questions.length) {
    return (
      <div className="h-screen flex items-center justify-center bg-tertiary">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="font-display font-black text-xl text-secondary">Loading Questions…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-tertiary overflow-hidden">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-6 h-[56px] bg-secondary text-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <span className="font-display font-black text-lg cursor-pointer" onClick={() => navigate("/candidate-profile")}>
            HR<span className="text-primary">11</span>
          </span>
          <span className="font-display font-extrabold text-xs tracking-[0.12em] uppercase opacity-60">
            Technical Interview
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="font-display font-black text-lg tracking-wider">
            <span className={timeLeft < 300 ? "text-red-400" : "text-white"}>
              {mm}:{ss}
            </span>
          </div>
          <div className="text-xs font-display font-bold opacity-70">
            {answeredCount}/{questions.length} answered
          </div>
          {!submitted ? (
            <Btn size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Test"}
            </Btn>
          ) : (
            <Btn size="sm" variant="secondary" onClick={() => {
              completeRound("technical");
              const next = getNextRoundPath(jobId, "technical_interview");
              navigate(next || "/candidate-profile");
            }}>
              {getNextRoundLabel(jobId, "technical_interview") ? `Next: ${getNextRoundLabel(jobId, "technical_interview")} →` : "Back to Profile"}
            </Btn>
          )}
        </div>
      </nav>

      {submitted ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-[480px]">
            <div className="text-6xl mb-4">{(result?.percentage ?? 0) >= 70 ? "" : ""}</div>
            <div className="font-display font-black text-[clamp(2rem,4vw,3rem)] text-secondary uppercase mb-2">
              {(result?.percentage ?? 0) >= 70 ? "PASSED!" : "COMPLETED"}
            </div>
            <div className="font-body text-lg text-ink-light mb-6">
              You scored <strong className="text-secondary">{result?.totalScore ?? 0}/{result?.maxScore ?? questions.length}</strong>
              {" "}({result?.percentage ?? 0}%)
            </div>
            <div className={`border-2 px-6 py-4 mb-6 ${(result?.percentage ?? 0) >= 70 ? "border-[#1A8917] bg-[#f0fdf0]" : "border-[#c00] bg-[#fff5f5]"}`}>
              <div className="font-display font-extrabold text-sm uppercase">
                {(result?.percentage ?? 0) >= 70 ? "  Congratulations! You've completed all rounds." : "  Not selected"}
              </div>
            </div>
            <Btn onClick={() => {
              completeRound("technical");
              const next = getNextRoundPath(jobId, "technical_interview");
              navigate(next || "/candidate-profile");
            }}>
              {getNextRoundLabel(jobId, "technical_interview")
                ? `Proceed to ${getNextRoundLabel(jobId, "technical_interview")} →`
                : "Back to Profile"}
            </Btn>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT – Question */}
          <div style={{ width: `${leftWidth}%` }} className="flex flex-col overflow-y-auto bg-white border-r border-border-clr">
            <div className="flex-1 p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-primary">
                  Question {current + 1} of {questions.length}
                </span>
                <button
                  onClick={() => toggleFlag(current)}
                  className={`text-xs font-display font-bold px-3 py-1.5 border-2 cursor-pointer transition-colors ${
                    flags.has(current)
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-border-clr bg-surface-alt text-ink-faint"
                  }`}
                >
                  {flags.has(current) ? " Flagged" : " Flag"}
                </button>
              </div>

              <h2 className="font-display font-black text-xl text-secondary mb-8 leading-snug">
                {q.q}
              </h2>

              <div className="flex flex-col gap-3">
                {q.opts.map((opt, oi) => {
                  const selected = answers[current] === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => selectAnswer(current, oi)}
                      className={[
                        "border-2 p-4 text-left cursor-pointer transition-all flex items-center gap-3",
                        selected
                          ? "border-primary bg-primary/[0.06]"
                          : "border-border-clr bg-surface hover:border-secondary",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "w-8 h-8 flex items-center justify-center font-display font-black text-sm shrink-0 border-2",
                          selected
                            ? "bg-primary border-primary text-white"
                            : "bg-surface-alt border-secondary text-secondary",
                        ].join(" ")}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="font-body text-sm text-secondary">{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between mt-10">
                <Btn variant="secondary" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
                  ← Previous
                </Btn>
                <Btn size="sm" disabled={current === questions.length - 1} onClick={() => setCurrent((c) => c + 1)}>
                  Next →
                </Btn>
              </div>
            </div>
          </div>

          {/* Resizer */}
          <div
            onPointerDown={onPointerDown}
            className="w-[6px] bg-border-clr hover:bg-primary cursor-col-resize shrink-0 transition-colors"
          />

          {/* RIGHT – Question status */}
          <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col overflow-y-auto bg-surface-alt">
            <div className="p-5">
              <div className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-secondary mb-4">
                Question Navigator
              </div>
              <div className="flex gap-4 mb-5 text-[10px] font-body text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-surface border-2 border-secondary" /> Unanswered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-primary border-2 border-primary" /> Answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-yellow-100 border-2 border-yellow-500" /> Flagged
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((_, i) => {
                  const s = getStatus(i);
                  const isCurrent = i === current;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={[
                        "w-full aspect-square flex items-center justify-center font-display font-bold text-sm cursor-pointer border-2 transition-all",
                        isCurrent ? "ring-2 ring-primary ring-offset-1" : "",
                        s === "answered"
                          ? "bg-primary border-primary text-white"
                          : s === "flagged"
                            ? "bg-yellow-100 border-yellow-500 text-yellow-800"
                            : "bg-surface border-secondary text-secondary",
                      ].join(" ")}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="border-2 border-secondary bg-surface p-4">
                <div className="font-display font-extrabold text-xs tracking-[0.12em] uppercase text-secondary mb-3">
                  Progress
                </div>
                {[
                  { label: "Answered", val: answeredCount, color: "text-primary" },
                  { label: "Unanswered", val: questions.length - answeredCount - flags.size, color: "text-secondary" },
                  { label: "Flagged", val: flags.size, color: "text-yellow-600" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between py-1.5 border-b border-border-clr last:border-0">
                    <span className="font-body text-xs text-ink-light">{s.label}</span>
                    <span className={`font-display font-black text-base ${s.color}`}>{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
