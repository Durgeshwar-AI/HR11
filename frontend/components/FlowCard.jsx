import { useState } from "react";
import { T } from "../theme/tokens";
import { DragHandle } from "./DragHandle";

/**
 * FlowCard
 * A draggable card representing one step in the pipeline.
 * Shows step number, icon, label, tag, duration, and agents.
 * Highlights differently when being dragged vs hovered over.
 *
 * @prop {object}   round         — round data object from ROUNDS
 * @prop {number}   index         — position in the pipeline (0-based)
 * @prop {boolean}  isDragging    — true when this card is the one being moved
 * @prop {boolean}  isOver        — true when another card is dragged over this one
 * @prop {Function} onRemove      — called with round.id to remove from pipeline
 * @prop {Function} onDragStart   — drag event handler from useDragSort
 * @prop {Function} onDragEnter   — drag event handler from useDragSort
 * @prop {Function} onDragOver    — drag event handler from useDragSort
 * @prop {Function} onDrop        — drag event handler from useDragSort
 * @prop {Function} onDragEnd     — drag event handler from useDragSort
 */
export function FlowCard({
  round,
  index,
  isDragging,
  isOver,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [hov, setHov] = useState(false);

  const borderColor = isDragging || isOver ? T.primary : T.borderDark;
  const bgColor     = isDragging ? "#FDF4EE" : isOver ? "#FEF3EE" : T.surface;
  const shadow      = isOver
    ? `4px 4px 0 ${T.primary}`
    : hov
    ? `4px 4px 0 ${T.secondary}`
    : "none";
  const translate   = isOver ? "translate(-2px, -2px)" : "translate(0, 0)";

  return (
    <div
      className="pop-in"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:  bgColor,
        border:      `2px solid ${borderColor}`,
        borderRadius:0,
        padding:     "12px 14px",
        display:     "flex",
        alignItems:  "center",
        gap:         10,
        transition:  T.transBase,
        opacity:     isDragging ? 0.4 : 1,
        boxShadow:   shadow,
        transform:   translate,
        cursor:      isDragging ? "grabbing" : "default",
        width:       "100%",
        userSelect:  "none",
      }}
    >
      {/* Drag handle — fades out when not hovered */}
      <div style={{ opacity: hov || isDragging ? 1 : 0.25, transition: "opacity 0.15s" }}>
        <DragHandle active={isDragging} visible={hov || isDragging} />
      </div>

      {/* Step number badge — primary colour square */}
      <div
        style={{
          width:         32,
          height:        32,
          flexShrink:    0,
          background:    T.primary,
          display:       "flex",
          alignItems:    "center",
          justifyContent:"center",
          fontFamily:    T.fontDisplay,
          fontSize:      14,
          fontWeight:    900,
          color:         "#fff",
          letterSpacing: "0.05em",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Icon */}
      <span style={{ fontSize: 20, flexShrink: 0 }}>{round.icon}</span>

      {/* Label + metadata */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display:    "flex",
            alignItems: "center",
            gap:        7,
            marginBottom: 2,
            flexWrap:   "wrap",
          }}
        >
          <span
            style={{
              fontFamily:    T.fontDisplay,
              fontWeight:    800,
              fontSize:      16,
              color:         T.secondary,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {round.label}
          </span>

          {/* Category tag */}
          <span
            style={{
              fontSize:      9,
              fontFamily:    T.fontBody,
              fontWeight:    600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color:         T.inkLight,
              border:        `1px solid ${T.border}`,
              padding:       "2px 6px",
            }}
          >
            {round.tag}
          </span>
        </div>

        <div
          style={{
            display:    "flex",
            gap:        10,
            flexWrap:   "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize:   11,
              color:      T.inkFaint,
              fontFamily: T.fontBody,
            }}
          >
            ⏱ {round.duration}
          </span>

          {round.agents.map((agent) => (
            <span
              key={agent}
              style={{
                fontSize:   10,
                color:      T.inkFaint,
                background: T.surfaceAlt,
                padding:    "1px 6px",
                fontFamily: T.fontBody,
              }}
            >
              {agent}
            </span>
          ))}
        </div>
      </div>

      {/* Remove button — fades in on hover */}
      <button
        onClick={() => onRemove(round.id)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background:  "transparent",
          border:      `1px solid ${T.border}`,
          color:       T.inkFaint,
          width:       24,
          height:      24,
          cursor:      "pointer",
          fontSize:    11,
          flexShrink:  0,
          display:     "flex",
          alignItems:  "center",
          justifyContent: "center",
          opacity:     hov ? 1 : 0,
          transition:  "opacity 0.15s",
          fontFamily:  T.fontBody,
        }}
      >
        ✕
      </button>
    </div>
  );
}
