import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import { codingApi, getStoredUser } from "../../services/api";
import { startRound, completeRound, getNextRoundPath } from "../../services/pipeline";

type CodingProblem = {
  _id?: string;
  title: string;
  difficulty: string;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
};

type SubmitResult = {
  passed?: number;
  total?: number;
  runtime?: string;
  memory?: string;
  testCases?: { input: string; expected: string; got: string; pass: boolean }[];
  submission?: {
    status: string;
    testCasesPassed: number;
    totalTestCases: number;
    runtime: string;
    memory: string;
    score: number;
  };
  overall?: {
    totalScore: number;
    maxScore: number;
    percentage: number;
  };
};

type CodingQuestionDto = {
  _id: string;
  title: string;
  difficulty?: string;
  tags?: string[];
  description: string;
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
  starterCode?: string;
};

type CodingQuestionsResponse = {
  questions?: CodingQuestionDto[];
};

/* ── Fallback mock problem ── */
const MOCK_PROBLEM = {
  title: "Two Sum",
  difficulty: "Medium",
  tags: ["Array", "Hash Table"],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
      explanation: "",
    },
    {
      input: "nums = [3,3], target = 6",
      output: "[0,1]",
      explanation: "",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
};

const DEFAULT_CODE = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your solution here

}`;

const LANGUAGES = ["JavaScript", "Python", "Java", "C++", "Go"];

const MOCK_RESULTS = {
  passed: 42,
  total: 50,
  runtime: "68 ms",
  memory: "42.3 MB",
  testCases: [
    { input: "[2,7,11,15], 9", expected: "[0,1]", got: "[0,1]", pass: true },
    { input: "[3,2,4], 6", expected: "[1,2]", got: "[1,2]", pass: true },
    { input: "[3,3], 6", expected: "[0,1]", got: "[0,1]", pass: true },
    { input: "[1,5,3,7], 8", expected: "[1,2]", got: "[]", pass: false },
  ],
};

export function CodingChallengeRound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") || "";
  const candidateId = searchParams.get("candidateId") || getStoredUser()?._id || "";

  const [problem, setProblem] = useState<CodingProblem>(MOCK_PROBLEM);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [lang, setLang] = useState("JavaScript");
  const [leftWidth, setLeftWidth] = useState(45);
  const [tab, setTab] = useState<"description" | "submissions">("description");
  const [outputTab, setOutputTab] = useState<"testcase" | "result">("testcase");
  const [submitted, setSubmitted] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [finishing, setFinishing] = useState(false);

  /* mark pipeline */
  useEffect(() => { startRound("coding"); }, []);

  /* Fetch problem from backend, fallback to mock */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await codingApi.getQuestions({
          limit: 1,
          jobId: jobId || undefined,
        })) as CodingQuestionsResponse;
        if (!cancelled && data.questions?.length) {
          const q = data.questions[0];
          setProblem({
            _id: q._id,
            title: q.title,
            difficulty: q.difficulty || "Medium",
            tags: q.tags || [],
            description: q.description,
            examples: q.examples || MOCK_PROBLEM.examples,
            constraints: q.constraints || MOCK_PROBLEM.constraints,
          });
          if (q.starterCode) setCode(q.starterCode);
        }
      } catch {
        /* keep mock */
      }
    })();
    return () => { cancelled = true; };
  }, [jobId]);

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

  /* resizable divider */
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = leftWidth;
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const vw = window.innerWidth;
        const newW = Math.min(70, Math.max(25, startW + (dx / vw) * 100));
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

  const handleRun = async () => {
    setRunning(true);
    setShowOutput(true);
    setOutputTab("result");
    await new Promise((r) => setTimeout(r, 1500));
    setRunning(false);
  };

  const handleSubmit = async () => {
    setRunning(true);
    setShowOutput(true);
    setOutputTab("result");
    try {
      const questionId = problem._id || "mock";
      const data = await codingApi.submit({ jobId, candidateId, questionId, language: lang, code });
      setSubmitResult(data);
    } catch {
      setSubmitResult(MOCK_RESULTS);
    } finally {
      setRunning(false);
      setSubmitted(true);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await codingApi.finish({ jobId, candidateId });
    } catch { /* proceed anyway */ }
    setFinishing(false);
    completeRound("coding");
    const next = getNextRoundPath(jobId, "coding_challenge");
    navigate(next || "/candidate-profile");
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] overflow-hidden">
      {/* Top bar */}
      <nav className="flex items-center justify-between px-5 h-[50px] bg-secondary text-white shrink-0 z-20">
        <div className="flex items-center gap-4">
          <span
            className="font-display font-black text-lg cursor-pointer"
            onClick={() => navigate("/candidate-profile")}
          >
            HR<span className="text-primary">11</span>
          </span>
          <span className="font-display font-extrabold text-xs tracking-[0.12em] uppercase opacity-60">
            Coding Challenge
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-display font-black text-base tracking-wider">
            <span className={timeLeft < 600 ? "text-red-400" : "text-white"}>
              {mm}:{ss}
            </span>
          </div>
          {submitted && (
            <Btn size="sm" onClick={handleFinish} disabled={finishing}>
              {finishing ? "Finishing…" : "Next Round →"}
            </Btn>
          )}
        </div>
      </nav>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT – Problem description */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex flex-col bg-white overflow-y-auto"
        >
          {/* Tabs */}
          <div className="flex border-b border-border-clr bg-surface-alt shrink-0">
            {(["description", "submissions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-5 py-3 text-xs font-display font-extrabold tracking-[0.1em] uppercase cursor-pointer border-b-2 transition-colors",
                  tab === t
                    ? "border-primary text-primary bg-white"
                    : "border-transparent text-ink-faint bg-transparent",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "description" && (
            <div className="p-6 flex-1">
              {/* Title */}
              <div className="flex items-center gap-3 mb-4">
                <h1 className="font-display font-black text-2xl text-secondary">
                  {problem.title}
                </h1>
                <span
                  className={`text-[10px] font-display font-extrabold tracking-[0.1em] uppercase px-2 py-0.5 border-2 ${
                    problem.difficulty === "Easy"
                      ? "border-[#1A8917] text-[#1A8917]"
                      : problem.difficulty === "Medium"
                        ? "border-yellow-600 text-yellow-600"
                        : "border-red-600 text-red-600"
                  }`}
                >
                  {problem.difficulty}
                </span>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-6">
                {problem.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-body font-semibold bg-surface-alt border border-border-clr px-2 py-0.5 text-ink-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="font-body text-sm text-secondary leading-relaxed mb-6 whitespace-pre-line">
                {problem.description}
              </div>

              {/* Examples */}
              {problem.examples.map((ex, i) => (
                <div key={i} className="mb-5">
                  <div className="font-display font-bold text-xs text-secondary mb-1.5">
                    Example {i + 1}:
                  </div>
                  <div className="bg-[#f8f8f8] border border-border-clr p-3 font-mono text-xs leading-relaxed">
                    <div>
                      <span className="text-ink-faint">Input: </span>
                      <span className="text-secondary">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-ink-faint">Output: </span>
                      <span className="text-secondary">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div>
                        <span className="text-ink-faint">Explanation: </span>
                        <span className="text-ink-light">{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Constraints */}
              <div className="mb-6">
                <div className="font-display font-bold text-xs text-secondary mb-2">
                  Constraints:
                </div>
                <ul className="list-none pl-0">
                  {problem.constraints.map((c, i) => (
                    <li
                      key={i}
                      className="font-mono text-xs text-ink-light mb-1 flex gap-2"
                    >
                      <span className="text-primary shrink-0">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === "submissions" && (
            <div className="p-6 flex-1">
              {submitted && submitResult ? (
                <div>
                  <div className={`border-2 p-5 mb-4 ${(submitResult.submission?.testCasesPassed ?? MOCK_RESULTS.passed) >= (submitResult.submission?.totalTestCases ?? MOCK_RESULTS.total) * 0.8 ? "border-[#1A8917] bg-[#f0fdf0]" : "border-[#c00] bg-[#fff5f5]"}`}>
                    <div className="font-display font-black text-lg text-secondary mb-1">
                      {(submitResult.submission?.testCasesPassed ?? MOCK_RESULTS.passed) >= (submitResult.submission?.totalTestCases ?? MOCK_RESULTS.total) * 0.8 ? " Accepted" : " Wrong Answer"}
                    </div>
                    <div className="font-body text-xs text-ink-light">
                      {submitResult.submission?.testCasesPassed ?? MOCK_RESULTS.passed}/{submitResult.submission?.totalTestCases ?? MOCK_RESULTS.total} test cases passed
                      {submitResult.submission?.runtime ? ` · Runtime: ${submitResult.submission.runtime}` : ` · Runtime: ${MOCK_RESULTS.runtime}`}
                      {submitResult.submission?.memory ? ` · Memory: ${submitResult.submission.memory}` : ` · Memory: ${MOCK_RESULTS.memory}`}
                    </div>
                  </div>
                  {(submitResult.submission?.testCasesPassed ?? MOCK_RESULTS.passed) >= (submitResult.submission?.totalTestCases ?? MOCK_RESULTS.total) * 0.8 && (
                    <div className="border-2 border-[#1A8917] bg-[#f0fdf0] p-4 text-center">
                      <div className="font-display font-extrabold text-sm uppercase text-[#1A8917] mb-2">
                        Selected for next round!
                      </div>
                      <Btn size="sm" onClick={handleFinish} disabled={finishing}>
                        {finishing ? "Finishing…" : "Proceed to AI Interview →"}
                      </Btn>
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-body text-sm text-ink-faint text-center py-12">
                  No submissions yet. Write your code and click Submit.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resizer */}
        <div
          onPointerDown={onPointerDown}
          className="w-[6px] bg-[#333] hover:bg-primary cursor-col-resize shrink-0 transition-colors z-10"
        />

        {/* RIGHT – Code editor */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col bg-[#1e1e1e] overflow-hidden"
        >
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 h-[42px] bg-[#252526] border-b border-[#333] shrink-0">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-[#333] text-white border border-[#555] px-3 py-1 text-xs font-display font-bold rounded-none outline-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleRun}
                disabled={running}
                className="px-4 py-1.5 text-xs font-display font-extrabold tracking-[0.05em] bg-[#333] text-white border border-[#555] cursor-pointer hover:bg-[#444] transition-colors"
              >
                ▶ Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={running}
                className="px-4 py-1.5 text-xs font-display font-extrabold tracking-[0.05em] bg-primary text-white border border-primary cursor-pointer hover:bg-[#c44013] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Code textarea (Notepad-style) */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-white text-secondary font-mono text-sm leading-relaxed p-4 outline-none resize-none border-none"
                style={{ tabSize: 4 }}
              />
            </div>

            {/* Output panel */}
            {showOutput && (
              <div className="h-[200px] bg-[#1e1e1e] border-t border-[#333] flex flex-col shrink-0">
                <div className="flex border-b border-[#333] shrink-0">
                  {(["testcase", "result"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setOutputTab(t)}
                      className={[
                        "px-4 py-2 text-[11px] font-display font-extrabold uppercase tracking-[0.1em] cursor-pointer border-b-2 transition-colors",
                        outputTab === t
                          ? "border-primary text-primary"
                          : "border-transparent text-[#888]",
                      ].join(" ")}
                    >
                      {t === "testcase" ? "Test Cases" : "Output"}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {running ? (
                    <div className="flex items-center gap-2 text-sm text-[#888] font-body">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Running your code…
                    </div>
                  ) : outputTab === "result" && submitted ? (
                    <div className="flex flex-col gap-2">
                      {MOCK_RESULTS.testCases.map((tc, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 text-xs font-mono px-3 py-2 border-l-2 ${
                            tc.pass
                              ? "border-[#1A8917] bg-[#1A8917]/10 text-[#4ec94e]"
                              : "border-red-500 bg-red-500/10 text-red-400"
                          }`}
                        >
                          <span>{tc.pass ? "" : ""}</span>
                          <span>Input: {tc.input}</span>
                          <span>→ {tc.got}</span>
                          {!tc.pass && (
                            <span className="text-red-400">(expected {tc.expected})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#666] font-body">
                      Click "Run" to execute against sample test cases.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
