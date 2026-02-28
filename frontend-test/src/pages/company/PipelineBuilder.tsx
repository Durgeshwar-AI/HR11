import { useState, useRef, useCallback } from "react";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card, SectionLabel } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { ROUNDS } from "../../constants/data";

/* ── Drag hook ── */
function useDragSort(setItems: any) {
  const dragging = useRef<number | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const onDragStart = useCallback((e: any, i: number) => {
    dragging.current = i;
    setDragIdx(i);
    e.dataTransfer.effectAllowed = "move";
  }, []);
  const onDragEnter = useCallback((e: any, i: number) => {
    e.preventDefault();
    setOverIdx(i);
  }, []);
  const onDragOver = useCallback((e: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (e: any, i: number) => {
      e.preventDefault();
      const from = dragging.current;
      if (from !== null && from !== i)
        setItems((p: any[]) => {
          const n = [...p];
          const [m] = n.splice(from, 1);
          n.splice(i, 0, m);
          return n;
        });
      dragging.current = null;
      setDragIdx(null);
      setOverIdx(null);
    },
    [setItems],
  );
  const onDragEnd = useCallback(() => {
    dragging.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, []);
  return {
    onDragStart,
    onDragEnter,
    onDragOver,
    onDrop,
    onDragEnd,
    dragIdx,
    overIdx,
  };
}

function Connector() {
  return (
    <div className="flex flex-col items-center h-9 shrink-0">
      <div className="w-0.5 flex-1 bg-border-clr" />
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-border-clr -mt-px" />
    </div>
  );
}

export function PipelineBuilder({ onNavigate }: any) {
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [tab, setTab] = useState("builder");
  const [loading, setLoading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const flowRef = useRef<HTMLDivElement>(null);
  const drag = useDragSort(setPipeline);
  const selectedIds = pipeline.map((r: any) => r.id);

  const addRound = (r: any) => {
    if (!selectedIds.includes(r.id)) {
      setPipeline((p) => [...p, r]);
      setTimeout(
        () => flowRef.current?.scrollTo({ top: 9999, behavior: "smooth" }),
        80,
      );
    }
  };
  const removeRound = (id: string) =>
    setPipeline((p) => p.filter((r: any) => r.id !== id));
  const canDeploy = !!jobTitle.trim() && pipeline.length > 0 && !loading;

  const deploy = async () => {
    if (!canDeploy) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDeployed(true);
  };

  return (
    <AppShell currentPage="pipeline" onNavigate={onNavigate}>
      {/* Header */}
      <div className="fade-up mb-7">
        <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">
          Configure Hiring Flow
        </p>
        <h1 className="font-display font-black text-[clamp(1.8rem,3vw,2.8rem)] uppercase tracking-tight leading-none">
          PIPELINE BUILDER
        </h1>
      </div>

      {/* Title + tabs */}
      <div className="fade-up flex items-center gap-3 pb-5 border-b border-border-clr flex-wrap mb-6">
        <input
          type="text"
          placeholder="JOB TITLE — e.g. Senior Backend Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="flex-1 min-w-[200px] bg-surface border-2 border-secondary py-[11px] px-3.5 text-[13px] text-secondary font-display font-bold tracking-[0.05em] uppercase outline-none focus:border-primary"
        />
        {[
          { k: "builder", l: "BUILDER" },
          { k: "json", l: "{ } JSON" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={[
              "px-5 py-2.5 text-xs font-display font-extrabold tracking-[0.1em] cursor-pointer border-2 border-secondary transition-colors",
              tab === t.k
                ? "bg-secondary text-white"
                : "bg-transparent text-secondary",
            ].join(" ")}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <div className="flex items-center gap-2.5 mb-5 bg-[#FEF0E8] border border-border-clr px-4 py-2 text-xs text-ink-light font-body">
        <span className="text-primary text-sm">⠿</span>
        Hold the <strong className="text-primary">orange grip dots</strong> to
        drag &amp; reorder steps
      </div>

      {/* Builder tab */}
      {tab === "builder" && (
        <div className="grid grid-cols-2 gap-7 items-start">
          {/* Available rounds */}
          <div>
            <SectionLabel>Available Rounds ({ROUNDS.length})</SectionLabel>
            <div className="flex flex-col gap-[7px]">
              {ROUNDS.map((r: any) => {
                const sel = selectedIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => addRound(r)}
                    disabled={sel}
                    className={[
                      "border-2 px-3.5 py-2.5 flex items-center gap-2.5 transition-all text-left",
                      sel
                        ? "bg-surface-alt border-border-clr cursor-default opacity-45"
                        : "bg-surface border-secondary cursor-pointer hover:border-primary",
                    ].join(" ")}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <div className="flex-1">
                      <span
                        className={[
                          "font-display font-extrabold text-sm uppercase",
                          sel ? "text-ink-faint" : "text-secondary",
                        ].join(" ")}
                      >
                        {r.label}
                      </span>
                      {sel && (
                        <span className="text-[10px] text-primary ml-2 font-body">
                          ✓ Added
                        </span>
                      )}
                      <div className="text-[10px] text-ink-faint font-body mt-px">
                        {r.duration}
                      </div>
                    </div>
                    {!sel && (
                      <div className="w-[22px] h-[22px] bg-secondary text-white flex items-center justify-center text-base font-bold">
                        +
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pipeline flow */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <SectionLabel>Your Pipeline</SectionLabel>
              {pipeline.length > 0 && (
                <button
                  onClick={() => setPipeline([])}
                  className="bg-transparent border border-border-clr text-ink-faint px-2.5 py-[3px] text-[10px] cursor-pointer font-display font-bold tracking-[0.1em] uppercase"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {pipeline.length === 0 && (
              <div className="border-2 border-dashed border-border-clr py-14 px-5 text-center">
                <div className="font-display font-black text-2xl text-border-clr uppercase mb-2">
                  NO ROUNDS YET
                </div>
                <p className="text-ink-faint text-xs font-body">
                  Select rounds from the left
                </p>
              </div>
            )}

            {pipeline.length > 0 && (
              <div className="flex justify-center">
                <div className="bg-secondary text-white font-display font-extrabold text-[10px] tracking-[0.18em] uppercase px-[18px] py-1.5">
                  ◉ JOB POSTED · CANDIDATE APPLIES
                </div>
              </div>
            )}

            <div
              ref={flowRef}
              className="flex flex-col items-center max-h-[520px] overflow-y-auto pb-1"
            >
              {pipeline.map((round: any, i: number) => {
                const isDragging = drag.dragIdx === i;
                const isOver = drag.overIdx === i && drag.dragIdx !== i;
                return (
                  <div
                    key={round.id}
                    className="w-full flex flex-col items-center"
                  >
                    <Connector />
                    <div
                      draggable
                      onDragStart={(e) => drag.onDragStart(e, i)}
                      onDragEnter={(e) => drag.onDragEnter(e, i)}
                      onDragOver={drag.onDragOver}
                      onDrop={(e) => drag.onDrop(e, i)}
                      onDragEnd={drag.onDragEnd}
                      className={[
                        "w-full flex items-center gap-2.5 px-3.5 py-3 border-2 cursor-grab select-none transition-all",
                        isDragging
                          ? "bg-[#FDF4EE] border-primary opacity-40"
                          : "",
                        isOver
                          ? "bg-[#FEF3EE] border-primary shadow-brutal-orange -translate-x-0.5 -translate-y-0.5"
                          : "",
                        !isDragging && !isOver
                          ? "bg-surface border-secondary"
                          : "",
                      ].join(" ")}
                    >
                      {/* grip */}
                      <div className="flex flex-col gap-[3px] px-1 py-0.5 opacity-50">
                        {[0, 1, 2].map((r) => (
                          <div key={r} className="flex gap-[3px]">
                            {[0, 1].map((c) => (
                              <div
                                key={c}
                                className="w-[3.5px] h-[3.5px] rounded-full bg-primary"
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="w-[30px] h-[30px] bg-primary shrink-0 flex items-center justify-center font-display font-black text-[13px] text-white">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <span className="text-lg shrink-0">{round.icon}</span>
                      <div className="flex-1">
                        <span className="font-display font-extrabold text-sm uppercase text-secondary">
                          {round.label}
                        </span>
                        <div className="text-[10px] text-ink-faint font-body mt-px">
                          {round.duration}
                        </div>
                      </div>
                      <button
                        onClick={() => removeRound(round.id)}
                        className="bg-transparent border border-border-clr text-ink-faint w-6 h-6 cursor-pointer text-[11px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {pipeline.length > 0 && (
                <div className="flex flex-col items-center">
                  <Connector />
                  <div className="bg-primary text-white font-display font-extrabold text-[10px] tracking-[0.18em] uppercase px-[18px] py-1.5">
                    ✓ HIRE DECISION
                  </div>
                </div>
              )}
            </div>

            {pipeline.length > 0 && (
              <>
                <Btn
                  fullWidth
                  onClick={deploy}
                  disabled={!canDeploy}
                  style={{ marginTop: 20 }}
                >
                  {loading
                    ? "⟳ DEPLOYING…"
                    : deployed
                      ? "✓ PIPELINE DEPLOYED"
                      : "🚀 DEPLOY PIPELINE"}
                </Btn>
                {deployed && (
                  <p className="text-center text-xs text-success mt-2 font-body">
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
        <Card>
          <div className="bg-secondary px-4 py-2.5">
            <span className="font-display font-extrabold text-xs text-white tracking-[0.15em] uppercase">
              Backend Payload
            </span>
          </div>
          <pre className="p-5 font-mono text-[11px] leading-[1.75] overflow-auto max-h-[400px] text-ink-light bg-surface-alt">
            {JSON.stringify(
              {
                job_title: jobTitle || "Untitled",
                created_at: new Date().toISOString(),
                total_rounds: pipeline.length,
                rounds: pipeline.map((r: any, i: number) => ({
                  round_number: i + 1,
                  round_id: r.id,
                  label: r.label,
                  agents: r.agents,
                })),
              },
              null,
              2,
            )}
          </pre>
        </Card>
      )}
    </AppShell>
  );
}
