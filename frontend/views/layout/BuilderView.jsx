import { useRef } from "react";
import { T } from "../theme/tokens";
import { ROUNDS } from "../constants/rounds";
import { useDragSort } from "../hooks/useDragSort";
import { OptionPill } from "../components/OptionPill";
import { FlowCard } from "../components/FlowCard";
import { Connector } from "../components/Connector";

/**
 * BuilderView
 * The main two-column pipeline builder.
 * Left: available rounds to pick from.
 * Right: the ordered pipeline with drag-and-drop + deploy button.
 *
 * @prop {Array}    pipeline     — current ordered pipeline
 * @prop {Function} setPipeline  — state setter for pipeline
 * @prop {string}   jobTitle     — current job title value
 * @prop {boolean}  loading      — true while deploy is in progress
 * @prop {Function} onDeploy     — called when Deploy button is clicked
 */
export function BuilderView({ pipeline, setPipeline, jobTitle, loading, onDeploy }) {
  const flowRef     = useRef(null);
  const selectedIds = pipeline.map((r) => r.id);
  const drag        = useDragSort(setPipeline);
  const canDeploy   = !!jobTitle.trim() && pipeline.length > 0 && !loading;

  const addRound = (round) => {
    if (selectedIds.includes(round.id)) return;
    setPipeline((prev) => [...prev, round]);
    setTimeout(
      () => flowRef.current?.scrollTo({ top: 9999, behavior: "smooth" }),
      80
    );
  };

  const removeRound = (id) =>
    setPipeline((prev) => prev.filter((r) => r.id !== id));

  /* ── Shared section header style ── */
  const sectionHeader = (label, right) => (
    <div
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         12,
        marginBottom: 16,
      }}
    >
      <span
        style={{
          fontFamily:    T.fontDisplay,
          fontWeight:    900,
          fontSize:      12,
          letterSpacing: "0.2em",
          color:         T.inkFaint,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 2, background: T.secondary }} />
      {right}
    </div>
  );

  return (
    <div
      className="fade-up"
      style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 32,
        marginTop:           28,
        alignItems:          "start",
      }}
    >
      {/* ── LEFT: Available Rounds ── */}
      <div>
        {sectionHeader(
          "Available Rounds",
          <span
            style={{
              fontFamily: T.fontDisplay,
              fontWeight: 800,
              fontSize:   14,
              color:      T.primary,
            }}
          >
            {pipeline.length}/{ROUNDS.length}
          </span>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROUNDS.map((round) => (
            <OptionPill
              key={round.id}
              round={round}
              selected={selectedIds.includes(round.id)}
              onClick={() => addRound(round)}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT: Pipeline Flow ── */}
      <div>
        {sectionHeader(
          "Your Pipeline",
          pipeline.length > 0 && (
            <button
              onClick={() => setPipeline([])}
              style={{
                background:    "transparent",
                border:        `1px solid ${T.border}`,
                color:         T.inkFaint,
                padding:       "3px 10px",
                fontSize:      10,
                cursor:        "pointer",
                fontFamily:    T.fontDisplay,
                fontWeight:    700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              CLEAR ALL
            </button>
          )
        )}

        {/* Empty state */}
        {pipeline.length === 0 && (
          <div
            style={{
              border:   `2px dashed ${T.border}`,
              padding:  "56px 20px",
              textAlign:"center",
            }}
          >
            <div
              style={{
                fontFamily:    T.fontDisplay,
                fontWeight:    900,
                fontSize:      28,
                color:         T.border,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom:  8,
              }}
            >
              NO ROUNDS YET
            </div>
            <p style={{ color: T.inkFaint, fontSize: 12, fontFamily: T.fontBody }}>
              Select rounds from the left to build your pipeline
            </p>
          </div>
        )}

        {/* Start node */}
        {pipeline.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                background:    T.secondary,
                color:         "#fff",
                fontFamily:    T.fontDisplay,
                fontWeight:    800,
                fontSize:      11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                padding:       "6px 18px",
              }}
            >
              ◉ JOB POSTED · CANDIDATE APPLIES
            </div>
          </div>
        )}

        {/* Scrollable pipeline */}
        <div
          ref={flowRef}
          style={{
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            maxHeight:     580,
            overflowY:     "auto",
            paddingBottom: 4,
          }}
        >
          {pipeline.map((round, i) => (
            <div
              key={round.id}
              style={{
                width:         "100%",
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
              }}
            >
              <Connector />
              <FlowCard
                round={round}
                index={i}
                isDragging={drag.dragIdx === i}
                isOver={drag.overIdx === i && drag.dragIdx !== i}
                onRemove={removeRound}
                onDragStart={drag.onDragStart}
                onDragEnter={drag.onDragEnter}
                onDragOver={drag.onDragOver}
                onDrop={drag.onDrop}
                onDragEnd={drag.onDragEnd}
              />
            </div>
          ))}

          {/* End node */}
          {pipeline.length > 0 && (
            <div
              style={{
                display:       "flex",
                flexDirection: "column",
                alignItems:    "center",
              }}
            >
              <Connector />
              <div
                style={{
                  background:    T.primary,
                  color:         "#fff",
                  fontFamily:    T.fontDisplay,
                  fontWeight:    800,
                  fontSize:      11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  padding:       "6px 18px",
                }}
              >
                ✓ HIRE DECISION
              </div>
            </div>
          )}
        </div>

        {/* Deploy button */}
        {pipeline.length > 0 && (
          <>
            <button
              onClick={onDeploy}
              disabled={!canDeploy}
              style={{
                marginTop:     24,
                width:         "100%",
                padding:       "16px",
                background:    canDeploy ? T.primary : T.surfaceAlt,
                border:        `2px solid ${canDeploy ? T.primary : T.border}`,
                borderRadius:  0,
                color:         canDeploy ? "#fff" : T.inkFaint,
                fontSize:      16,
                fontFamily:    T.fontDisplay,
                fontWeight:    900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                cursor:        canDeploy ? "pointer" : "not-allowed",
                transition:    T.transColor,
                display:       "flex",
                alignItems:    "center",
                justifyContent:"center",
                gap:           10,
              }}
              onMouseEnter={(e) => {
                if (canDeploy) {
                  e.currentTarget.style.background   = T.secondary;
                  e.currentTarget.style.borderColor  = T.secondary;
                }
              }}
              onMouseLeave={(e) => {
                if (canDeploy) {
                  e.currentTarget.style.background   = T.primary;
                  e.currentTarget.style.borderColor  = T.primary;
                }
              }}
            >
              {loading ? (
                <>
                  <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>
                    ⟳
                  </span>{" "}
                  DEPLOYING…
                </>
              ) : (
                "🚀 DEPLOY PIPELINE TO BACKEND"
              )}
            </button>

            {!jobTitle.trim() && (
              <p
                style={{
                  textAlign:  "center",
                  fontSize:   11,
                  color:      T.inkFaint,
                  marginTop:  8,
                  fontFamily: T.fontBody,
                }}
              >
                Enter a job title above to enable deploy
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
