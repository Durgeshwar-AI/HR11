import { T } from "../theme/tokens";

/**
 * DragHandle
 * A 2×3 grid of orange dots that signals a draggable surface.
 * Opacity is controlled by the parent card's hover state.
 *
 * @prop {boolean} active  — true while the card is being dragged
 * @prop {boolean} visible — true when parent card is hovered
 */
export function DragHandle({ active, visible }) {
  return (
    <div
      style={{
        display:        "flex",
        flexDirection:  "column",
        gap:            3,
        padding:        "3px 5px",
        cursor:         active ? "grabbing" : "grab",
        opacity:        visible ? 1 : 0.2,
        transition:     "opacity 0.15s",
        flexShrink:     0,
      }}
    >
      {[0, 1, 2].map((row) => (
        <div key={row} style={{ display: "flex", gap: 3 }}>
          {[0, 1].map((col) => (
            <div
              key={col}
              style={{
                width:        3.5,
                height:       3.5,
                borderRadius: "50%",
                background:   T.primary,
                opacity:      active ? 1 : 0.65,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
