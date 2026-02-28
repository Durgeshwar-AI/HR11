import { useState } from "react";

// ── Theme ──────────────────────────────────────────────
import { GlobalStyles } from "./theme/GlobalStyles";
import { T }            from "./theme/tokens";

// ── Layout components ─────────────────────────────────
import { Navbar }   from "./components/Navbar";
import { Hero }     from "./components/Hero";
import { Ticker }   from "./components/Ticker";
import { DragHint } from "./components/DragHint";

// ── Views ──────────────────────────────────────────────
import { BuilderView } from "./views/BuilderView";
import { JsonView }    from "./views/JsonView";
import { SuccessView } from "./views/SuccessView";

/**
 * TABS
 * Ordered list of top-level navigation tabs.
 * "submitted" is not a selectable tab — it's entered via the deploy action.
 */
const TABS = [
  { key: "builder", label: "BUILDER" },
  { key: "json",    label: "{ } JSON" },
];

/**
 * App
 * Root component. Owns all global state:
 *   - pipeline   : ordered array of selected round objects
 *   - jobTitle   : string from the job title input
 *   - tab        : "builder" | "json" | "submitted"
 *   - loading    : true while the deploy request is in-flight
 *
 * To wire up to a real backend, replace the setTimeout in handleDeploy
 * with a fetch call:
 *
 *   await fetch("/api/pipeline/create", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 */
export default function App() {
  const [pipeline, setPipeline] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [tab,      setTab]      = useState("builder");
  const [loading,  setLoading]  = useState(false);

  /** Simulates a POST to /api/pipeline/create */
  const handleDeploy = async () => {
    if (!jobTitle.trim() || pipeline.length === 0 || loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400)); // replace with real API call
    setLoading(false);
    setTab("submitted");
  };

  const handleReset = () => {
    setPipeline([]);
    setJobTitle("");
    setTab("builder");
  };

  return (
    <div
      style={{
        minHeight:  "100vh",
        background: T.tertiary,
        color:      T.secondary,
        fontFamily: T.fontBody,
      }}
    >
      {/* Injects fonts + keyframes once */}
      <GlobalStyles />

      {/* ── Fixed top navigation ── */}
      <Navbar />

      {/* ── Hero headline ── */}
      <Hero />

      {/* ── Scrolling ticker strip ── */}
      <Ticker />

      {/* ── Drag hint bar ── */}
      <DragHint />

      {/* ── Page body ── */}
      <div style={{ padding: "0 40px 80px" }}>

        {/* Job title input + tab switcher row */}
        <div
          className="fade-up"
          style={{
            display:     "flex",
            alignItems:  "center",
            gap:         12,
            padding:     "24px 0 20px",
            borderBottom:`1px solid ${T.border}`,
            flexWrap:    "wrap",
          }}
        >
          <input
            type="text"
            placeholder="JOB TITLE — e.g. Senior Backend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            style={{
              flex:          1,
              minWidth:      200,
              background:    T.surface,
              border:        `2px solid ${T.secondary}`,
              borderRadius:  0,
              padding:       "11px 14px",
              fontSize:      13,
              color:         T.secondary,
              fontFamily:    T.fontDisplay,
              fontWeight:    700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              outline:       "none",
              transition:    "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = T.primary)}
            onBlur={(e)  => (e.target.style.borderColor = T.secondary)}
          />

          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map((t, idx) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  background:    tab === t.key ? T.secondary : "transparent",
                  border:        `2px solid ${T.secondary}`,
                  borderRight:   idx === 0 ? "1px solid" : "2px solid",
                  borderColor:   T.secondary,
                  color:         tab === t.key ? "#fff" : T.secondary,
                  padding:       "10px 20px",
                  fontSize:      12,
                  fontFamily:    T.fontDisplay,
                  fontWeight:    800,
                  letterSpacing: "0.1em",
                  cursor:        "pointer",
                  transition:    T.transColor,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Routed tab content ── */}
        {tab === "builder" && (
          <BuilderView
            pipeline={pipeline}
            setPipeline={setPipeline}
            jobTitle={jobTitle}
            loading={loading}
            onDeploy={handleDeploy}
          />
        )}

        {tab === "json" && (
          <JsonView pipeline={pipeline} jobTitle={jobTitle} />
        )}

        {tab === "submitted" && (
          <SuccessView
            pipeline={pipeline}
            jobTitle={jobTitle}
            onReset={handleReset}
            onViewJson={() => setTab("json")}
          />
        )}
      </div>
    </div>
  );
}
