import { T } from "../theme/tokens";

/**
 * Connector
 * Vertical line + downward arrow drawn between two pipeline step cards.
 * Uses the secondary border colour to stay neutral between steps.
 */
export function Connector() {
  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        height:        40,
        flexShrink:    0,
      }}
    >
      {/* Vertical line */}
      <div
        style={{
          width:      2,
          flex:       1,
          background: T.border,
        }}
      />

      {/* Arrowhead */}
      <div
        style={{
          borderLeft:  "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop:   `7px solid ${T.border}`,
          marginTop:   -1,
        }}
      />
    </div>
  );
}
