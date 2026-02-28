import { useState } from "react";
import { T } from "../theme/tokens";

/**
 * OptionPill
 * A clickable button in the "Available Rounds" left panel.
 * Shows as faded with a check mark when the round is already added.
 *
 * @prop {object}   round    — round data object from ROUNDS
 * @prop {boolean}  selected — true when this round is in the pipeline
 * @prop {Function} onClick  — called when the user clicks to add the round
 */
export function OptionPill({ round, selected, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={selected}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   selected ? T.surfaceAlt : hov ? "#FEF0E8" : T.surface,
        border:       `2px solid ${selected ? T.border : hov ? T.primary : T.borderDark}`,
        borderRadius: 0,
        padding:      "10px 12px",
        cursor:       selected ? "default" : "pointer",
        display:      "flex",
        alignItems:   "center",
        gap:          10,
        transition:   T.transBase,
        opacity:      selected ? 0.45 : 1,
        textAlign:    "left",
        width:        "100%",
        boxShadow:    hov && !selected ? `3px 3px 0 ${T.primary}` : "none",
        transform:    hov && !selected ? "translate(-1px, -1px)" : "translate(0, 0)",
      }}
    >
      {/* Icon */}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{round.icon}</span>

      {/* Label + duration */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        6,
            marginBottom: 1,
          }}
        >
          <span
            style={{
              fontFamily:    T.fontDisplay,
              fontWeight:    800,
              fontSize:      15,
              color:         selected ? T.inkFaint : T.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {round.label}
          </span>

          {selected && (
            <span
              style={{
                fontSize:   10,
                color:      T.primary,
                fontFamily: T.fontBody,
                fontWeight: 600,
              }}
            >
              ✓ ADDED
            </span>
          )}
        </div>

        <span
          style={{
            fontSize:   10,
            color:      T.inkFaint,
            fontFamily: T.fontBody,
          }}
        >
          {round.duration}
        </span>
      </div>

      {/* Add button — only shown when not selected */}
      {!selected && (
        <div
          style={{
            width:          24,
            height:         24,
            background:     hov ? T.primary : T.secondary,
            color:          "#fff",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            fontSize:       16,
            fontWeight:     700,
            flexShrink:     0,
            transition:     "background 0.14s",
            fontFamily:     T.fontDisplay,
          }}
        >
          +
        </div>
      )}
    </button>
  );
}
