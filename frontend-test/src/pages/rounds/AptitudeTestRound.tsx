import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import { aptitudeApi, getStoredUser } from "../../services/api";
import { startRound, completeRound, getNextRoundPath, getNextRoundLabel } from "../../services/pipeline";

/* ── Fallback mock questions (used when backend is unavailable) ── */
const MOCK_QUESTIONS = Array.from({ length: 25 }, (_, i) => {
  const pool = [
    {
      q: "What is the time complexity of binary search?",
      opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      ans: 1,
    },
    {
      q: "Which data structure uses FIFO ordering?",
      opts: ["Stack", "Queue", "Tree", "Graph"],
      ans: 1,
    },
    {
      q: "What does REST stand for?",
      opts: [
        "Representational State Transfer",
        "Remote Execution Standard",
        "Real-time Event Streaming",
        "Request State Transformer",
      ],
      ans: 0,
    },
    {
      q: "Which sorting algorithm has O(n log n) average-case complexity?",
      opts: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
      ans: 2,
    },
    {
      q: "What is the default port for HTTPS?",
      opts: ["80", "8080", "443", "3000"],
      ans: 2,
    },
    {
      q: "Which of these is NOT a JavaScript primitive type?",
      opts: ["string", "boolean", "array", "symbol"],
      ans: 2,
    },
    {
      q: "What is a closure in programming?",
      opts: [
        "A function that has access to its outer scope",
        "A way to close a file",
        "A design pattern for loops",
        "A type of error handling",
      ],
      ans: 0,
    },
    {
      q: "Which HTTP method is idempotent?",
      opts: ["POST", "GET", "PATCH", "None"],
      ans: 1,
    },
    {
      q: "What does SQL stand for?",
      opts: [
        "Structured Query Language",
        "Simple Query Logic",
        "Standard Query Lookup",
        "System Query Language",
      ],
      ans: 0,
    },
    {
      q: "Which protocol is used for sending emails?",
      opts: ["FTP", "SMTP", "HTTP", "SSH"],
      ans: 1,
    },
    {
      q: "What is the purpose of an index in a database?",
      opts: [
        "Store data",
        "Speed up queries",
        "Define relationships",
        "Encrypt data",
      ],
      ans: 1,
    },
    {
      q: "What does DNS resolve?",
      opts: [
        "Domain names to IP addresses",
        "IP addresses to MAC addresses",
        "URLs to file paths",
        "Ports to services",
      ],
      ans: 0,
    },
    {
      q: "What is polymorphism?",
      opts: [
        "One interface, multiple implementations",
        "Hiding internal state",
        "Inheriting properties",
        "Breaking code into modules",
      ],
      ans: 0,
    },
    {
      q: "Which layer of the OSI model does TCP operate at?",
      opts: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"],
      ans: 2,
    },
    {
      q: "What is a deadlock?",
      opts: [
        "A process that runs forever",
        "Two or more processes waiting on each other",
        "A memory overflow",
        "An infinite loop",
      ],
      ans: 1,
    },
    {
      q: "What is the purpose of a load balancer?",
      opts: [
        "Distribute traffic across servers",
        "Compress data",
        "Cache responses",
        "Authenticate users",
      ],
      ans: 0,
    },
    {
      q: "What is Big-O notation used for?",
      opts: [
        "Measuring code quality",
        "Describing algorithm efficiency",
        "Counting lines of code",
        "Defining variable types",
      ],
      ans: 1,
    },
    {
      q: "Which of the following is a NoSQL database?",
      opts: ["PostgreSQL", "MySQL", "MongoDB", "Oracle"],
      ans: 2,
    },
    {
      q: "What does CI/CD stand for?",
      opts: [
        "Continuous Integration / Continuous Deployment",
        "Code Integration / Code Delivery",
        "Centralized Input / Centralized Data",
        "Compiled Instance / Compiled Distribution",
      ],
      ans: 0,
    },
    {
      q: "What is the difference between '==' and '===' in JavaScript?",
      opts: [
        "'===' checks type and value",
        "They are the same",
        "'==' is faster",
        "'===' only checks type",
      ],
      ans: 0,
    },
    {
      q: "What is a hash table's average lookup time?",
      opts: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      ans: 2,
    },
    {
      q: "What is an API gateway?",
      opts: [
        "Entry point for API requests",
        "A database connector",
        "A testing framework",
        "A deployment tool",
      ],
      ans: 0,
    },
    {
      q: "Which command shows running Docker containers?",
      opts: ["docker list", "docker ps", "docker show", "docker status"],
      ans: 1,
    },
    {
      q: "What is event-driven architecture?",
      opts: [
        "Components communicate via events",
        "Code runs in a single thread",
        "Functions call each other directly",
        "Data is stored in events",
      ],
      ans: 0,
    },
    {
      q: "What does ACID stand for in databases?",
      opts: [
        "Atomicity, Consistency, Isolation, Durability",
        "Access, Control, Identity, Data",
        "Automated, Clustered, Indexed, Distributed",
        "Authentication, Caching, Integration, Deployment",
      ],
      ans: 0,
    },
  ];
  return { id: i + 1, ...pool[i % pool.length] };
});

type Question = { id: string; q: string; opts: string[]; ans?: number };
type QStatus = "unanswered" | "answered" | "flagged";

export function AptitudeTestRound() {
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
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 min
  const dividerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState(65); // percent

  type ApiQuestion = { _id: string; text: string; options: string[] };

  /* timer */
  useState(() => {
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  });

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  /* mark pipeline */
  useEffect(() => { startRound("aptitude"); }, []);

  /* Fetch questions from backend, fallback to mock */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await aptitudeApi.getQuestions({ limit: 25, jobId: jobId || undefined });
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

  /* resizable divider */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
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
  }, [leftWidth]);

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
      const data: any = await aptitudeApi.submit({ jobId, candidateId, answers: apiAnswers });
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
            Aptitude Test
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
              completeRound("aptitude");
              const next = getNextRoundPath(jobId, "aptitude_test");
              navigate(next || "/candidate-profile");
            }}>
              {getNextRoundLabel(jobId, "aptitude_test") ? `Next: ${getNextRoundLabel(jobId, "aptitude_test")} →` : "Back to Profile"}
            </Btn>
          )}
        </div>
      </nav>

      {submitted ? (
        /* ── Results view ── */
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
                {(result?.percentage ?? 0) >= 70 ? "  Selected for next round" : "  Not selected"}
              </div>
            </div>
            {(result?.percentage ?? 0) >= 70 && (
              <Btn onClick={() => {
                completeRound("aptitude");
                const next = getNextRoundPath(jobId, "aptitude_test");
                navigate(next || "/candidate-profile");
              }}>
                {getNextRoundLabel(jobId, "aptitude_test")
                  ? `Proceed to ${getNextRoundLabel(jobId, "aptitude_test")} →`
                  : "Back to Profile"}
              </Btn>
            )}
          </div>
        </div>
      ) : (
        /* ── Split-screen test view ── */
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT – Question */}
          <div style={{ width: `${leftWidth}%` }} className="flex flex-col overflow-y-auto bg-white border-r border-border-clr">
            <div className="flex-1 p-8">
              {/* Question header */}
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

              {/* Question text */}
              <h2 className="font-display font-black text-xl text-secondary mb-8 leading-snug">
                {q.q}
              </h2>

              {/* Options */}
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

              {/* Prev / Next */}
              <div className="flex justify-between mt-10">
                <Btn
                  variant="secondary"
                  size="sm"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => c - 1)}
                >
                  ← Previous
                </Btn>
                <Btn
                  size="sm"
                  disabled={current === questions.length - 1}
                  onClick={() => setCurrent((c) => c + 1)}
                >
                  Next →
                </Btn>
              </div>
            </div>
          </div>

          {/* Resizer */}
          <div
            ref={dividerRef}
            onPointerDown={onPointerDown}
            className="w-[6px] bg-border-clr hover:bg-primary cursor-col-resize shrink-0 transition-colors"
          />

          {/* RIGHT – Question status panel */}
          <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col overflow-y-auto bg-surface-alt">
            <div className="p-5">
              <div className="font-display font-extrabold text-xs tracking-[0.15em] uppercase text-secondary mb-4">
                Question Navigator
              </div>

              {/* Legend */}
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

              {/* Grid */}
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

              {/* Stats */}
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
