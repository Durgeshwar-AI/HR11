import { T } from "../theme/tokens";

/**
 * DragHint
 * Instructional bar that explains how to use the drag handles.
 * Uses the orange dot grid to visually echo the drag handle itself.
 */
export function DragHint() {
  return (
    <div
      style={{
        background:   "#FEF0E8",
        borderBottom: `1px solid ${T.border}`,
        padding:      "8px 40px",
        display:      "flex",
        alignItems:   "center",
        gap:          12,
        fontSize:     12,
        color:        T.inkLight,
        fontFamily:   T.fontBody,
      }}
    >
      {/* Mini dot-grid mirroring the drag handle */}
      <div style={{ display: "flex", gap: 3 }}>
        {[0, 1].map((col) =>
          [0, 1, 2].map((row) => (
            <div
              key={`${col}-${row}`}
              style={{
                width:        4,
                height:       4,
                borderRadius: "50%",
                background:   T.primary,
                margin:       "1px",
              }}
            />
          ))
        )}
      </div>

      <span style={{ fontWeight: 500 }}>
        Hold the{" "}
        <strong style={{ color: T.primary }}>orange grip dots</strong> on any
        step card to drag &amp; reorder your pipeline
      </span>
    </div>
  );
}
