import { useState, useRef, useCallback } from "react";
import { T } from "../../theme/tokens";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { ROUNDS } from "../../constants/data";

/* ── Drag hook ── */
function useDragSort(setItems) {
  const dragging = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const onDragStart  = useCallback((e, i) => { dragging.current = i; setDragIdx(i); e.dataTransfer.effectAllowed = "move"; }, []);
  const onDragEnter  = useCallback((e, i) => { e.preventDefault(); setOverIdx(i); }, []);
  const onDragOver   = useCallback((e)    => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }, []);
  const onDrop       = useCallback((e, i) => {
    e.preventDefault(); const from = dragging.current;
    if (from !== null && from !== i) setItems(p => { const n=[...p]; const [m]=n.splice(from,1); n.splice(i,0,m); return n; });
    dragging.current = null; setDragIdx(null); setOverIdx(null);
  }, [setItems]);
  const onDragEnd    = useCallback(() => { dragging.current = null; setDragIdx(null); setOverIdx(null); }, []);
  return { onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd, dragIdx, overIdx };
}

function Connector() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: 36, flexShrink: 0 }}>
      <div style={{ width: 2, flex: 1, background: T.border }} />
      <div style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${T.border}`, marginTop: -1 }} />
    </div>
  );
}

export function PipelineBuilder({ onNavigate }) {
  const [pipeline,  setPipeline]  = useState([]);
  const [jobTitle,  setJobTitle]  = useState("");
  const [tab,       setTab]       = useState("builder");
  const [loading,   setLoading]   = useState(false);
  const [deployed,  setDeployed]  = useState(false);
  const flowRef = useRef(null);
  const drag = useDragSort(setPipeline);
  const selectedIds = pipeline.map(r => r.id);

  const addRound    = r => { if (!selectedIds.includes(r.id)) { setPipeline(p => [...p, r]); setTimeout(() => flowRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 80); }};
  const removeRound = id => setPipeline(p => p.filter(r => r.id !== id));
  const canDeploy   = !!jobTitle.trim() && pipeline.length > 0 && !loading;

  const deploy = async () => {
    if (!canDeploy) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false); setDeployed(true);
  };

  return (
    <AppShell currentPage="pipeline" onNavigate={onNavigate}>

      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: T.fontBody, fontSize: 12, letterSpacing: "0.15em",
          textTransform: "uppercase", color: T.primary, marginBottom: 4 }}>
          Configure Hiring Flow
        </p>
        <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
          fontSize: "clamp(1.8rem,3vw,2.8rem)", textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
          PIPELINE BUILDER
        </h1>
      </div>

      {/* Title + tabs */}
      <div className="fade-up" style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "0 0 20px", borderBottom: `1px solid ${T.border}`,
        flexWrap: "wrap", marginBottom: 24,
      }}>
        <input type="text" placeholder="JOB TITLE — e.g. Senior Backend Engineer"
          value={jobTitle} onChange={e => setJobTitle(e.target.value)}
          style={{
            flex: 1, minWidth: 200, background: T.surface,
            border: `2px solid ${T.secondary}`, borderRadius: 0, padding: "11px 14px",
            fontSize: 13, color: T.secondary, fontFamily: T.fontDisplay,
            fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", outline: "none",
          }}
          onFocus={e => e.target.style.borderColor = T.primary}
          onBlur={e  => e.target.style.borderColor = T.secondary}
        />
        {[{ k: "builder", l: "BUILDER" }, { k: "json", l: "{ } JSON" }].map((t, i) => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            background: tab === t.k ? T.secondary : "transparent",
            border: `2px solid ${T.secondary}`, color: tab === t.k ? "#fff" : T.secondary,
            padding: "10px 20px", fontSize: 12, fontFamily: T.fontDisplay,
            fontWeight: 800, letterSpacing: "0.1em", cursor: "pointer", transition: T.transColor,
          }}>{t.l}</button>
        ))}
      </div>

      {/* Drag hint */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
        background: "#FEF0E8", border: `1px solid ${T.border}`, padding: "8px 16px",
        fontSize: 12, color: T.inkLight, fontFamily: T.fontBody,
      }}>
        <span style={{ color: T.primary, fontSize: 14 }}>⠿</span>
        Hold the <strong style={{ color: T.primary }}>orange grip dots</strong> to drag &amp; reorder steps
      </div>

      {/* Builder tab */}
      {tab === "builder" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>

          {/* Available rounds */}
          <div>
            <SectionLabel>Available Rounds ({ROUNDS.length})</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {ROUNDS.map(r => {
                const sel = selectedIds.includes(r.id);
                return (
                  <button key={r.id} onClick={() => addRound(r)} disabled={sel}
                    style={{
                      background: sel ? T.surfaceAlt : T.surface,
                      border: `2px solid ${sel ? T.border : T.secondary}`,
                      padding: "10px 14px", cursor: sel ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                      transition: T.transBase, opacity: sel ? 0.45 : 1,
                      textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = T.primary; }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = T.secondary; }}
                  >
                    <span style={{ fontSize: 18 }}>{r.icon}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14,
                        textTransform: "uppercase", color: sel ? T.inkFaint : T.secondary }}>
                        {r.label}
                      </span>
                      {sel && <span style={{ fontSize: 10, color: T.primary, marginLeft: 8, fontFamily: T.fontBody }}>✓ Added</span>}
                      <div style={{ fontSize: 10, color: T.inkFaint, fontFamily: T.fontBody, marginTop: 1 }}>{r.duration}</div>
                    </div>
                    {!sel && <div style={{ width: 22, height: 22, background: T.secondary, color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>+</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pipeline flow */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <SectionLabel>Your Pipeline</SectionLabel>
              {pipeline.length > 0 && (
                <button onClick={() => setPipeline([])} style={{
                  background: "transparent", border: `1px solid ${T.border}`,
                  color: T.inkFaint, padding: "3px 10px", fontSize: 10,
                  cursor: "pointer", fontFamily: T.fontDisplay, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                }}>CLEAR ALL</button>
              )}
            </div>

            {pipeline.length === 0 && (
              <div style={{ border: `2px dashed ${T.border}`, padding: "56px 20px", textAlign: "center" }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 24, color: T.border, textTransform: "uppercase", marginBottom: 8 }}>
                  NO ROUNDS YET
                </div>
                <p style={{ color: T.inkFaint, fontSize: 12, fontFamily: T.fontBody }}>Select rounds from the left</p>
              </div>
            )}

            {pipeline.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ background: T.secondary, color: "#fff", fontFamily: T.fontDisplay,
                  fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "6px 18px" }}>
                  ◉ JOB POSTED · CANDIDATE APPLIES
                </div>
              </div>
            )}

            <div ref={flowRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", maxHeight: 520, overflowY: "auto", paddingBottom: 4 }}>
              {pipeline.map((round, i) => {
                const isDragging = drag.dragIdx === i;
                const isOver     = drag.overIdx === i && drag.dragIdx !== i;
                return (
                  <div key={round.id} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Connector />
                    <div draggable
                      onDragStart={e => drag.onDragStart(e, i)} onDragEnter={e => drag.onDragEnter(e, i)}
                      onDragOver={drag.onDragOver} onDrop={e => drag.onDrop(e, i)} onDragEnd={drag.onDragEnd}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "12px 14px",
                        background: isDragging ? "#FDF4EE" : isOver ? "#FEF3EE" : T.surface,
                        border: `2px solid ${isDragging || isOver ? T.primary : T.secondary}`,
                        boxShadow: isOver ? T.shadowOrange : "none",
                        transform: isOver ? "translate(-2px,-2px)" : "translate(0,0)",
                        opacity: isDragging ? 0.4 : 1, cursor: "grab", userSelect: "none",
                        transition: T.transBase,
                      }}>
                      {/* grip */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "2px 4px", opacity: 0.5 }}>
                        {[0,1,2].map(r => <div key={r} style={{ display: "flex", gap: 3 }}>
                          {[0,1].map(c => <div key={c} style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: T.primary }} />)}
                        </div>)}
                      </div>
                      <div style={{ width: 30, height: 30, background: T.primary, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 13, color: "#fff" }}>
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{round.icon}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14,
                          textTransform: "uppercase", color: T.secondary }}>{round.label}</span>
                        <div style={{ fontSize: 10, color: T.inkFaint, fontFamily: T.fontBody, marginTop: 1 }}>{round.duration}</div>
                      </div>
                      <button onClick={() => removeRound(round.id)} style={{
                        background: "transparent", border: `1px solid ${T.border}`, color: T.inkFaint,
                        width: 24, height: 24, cursor: "pointer", fontSize: 11,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>✕</button>
                    </div>
                  </div>
                );
              })}

              {pipeline.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Connector />
                  <div style={{ background: T.primary, color: "#fff", fontFamily: T.fontDisplay,
                    fontWeight: 800, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", padding: "6px 18px" }}>
                    ✓ HIRE DECISION
                  </div>
                </div>
              )}
            </div>

            {pipeline.length > 0 && (
              <>
                <Btn fullWidth onClick={deploy} disabled={!canDeploy} style={{ marginTop: 20 }}>
                  {loading ? "⟳ DEPLOYING…" : deployed ? "✓ PIPELINE DEPLOYED" : "🚀 DEPLOY PIPELINE"}
                </Btn>
                {deployed && (
                  <p style={{ textAlign: "center", fontSize: 12, color: T.success, marginTop: 8, fontFamily: T.fontBody }}>
                    Pipeline deployed. Job opening is now live.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* JSON tab */}
      {tab === "json" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ background: T.secondary, padding: "10px 16px" }}>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 12,
              color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Backend Payload
            </span>
          </div>
          <pre style={{ padding: 20, fontFamily: T.fontMono, fontSize: 11, lineHeight: 1.75,
            overflow: "auto", maxHeight: 400, color: T.inkLight, background: T.surfaceAlt }}>
            {JSON.stringify({
              job_title: jobTitle || "Untitled",
              created_at: new Date().toISOString(),
              total_rounds: pipeline.length,
              rounds: pipeline.map((r, i) => ({ round_number: i+1, round_id: r.id, label: r.label, agents: r.agents }))
            }, null, 2)}
          </pre>
        </Card>
      )}
    </AppShell>
  );
}
