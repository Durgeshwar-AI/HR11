import { T } from "../theme/tokens";

/**
 * SuccessView
 * Shown after a successful pipeline deploy.
 * Lists all rounds in order with step numbers, then offers
 * "Build Another" and "View JSON" actions.
 *
 * @prop {Array}    pipeline    — the deployed pipeline
 * @prop {string}   jobTitle    — the deployed job title
 * @prop {Function} onReset     — resets to empty builder
 * @prop {Function} onViewJson  — switches to the JSON tab
 */
export function SuccessView({ pipeline, jobTitle, onReset, onViewJson }) {
  return (
    <div
      className="fade-up"
      style={{ maxWidth: 620, marginTop: 40 }}
    >
      <div
        style={{
          border:     `2px solid ${T.secondary}`,
          background: T.surface,
          boxShadow:  `6px 6px 0 ${T.primary}`,
        }}
      >
        {/* Orange header bar */}
        <div style={{ background: T.primary, padding: "20px 28px" }}>
          <div
            style={{
              fontFamily:    T.fontDisplay,
              fontWeight:    900,
              fontSize:      28,
              color:         "#fff",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
            }}
          >
            PIPELINE DEPLOYED ✓
          </div>
          <p
            style={{
              color:      "rgba(255,255,255,0.8)",
              fontSize:   12,
              marginTop:  4,
              fontFamily: T.fontBody,
            }}
          >
            {jobTitle} · {pipeline.length} rounds configured
          </p>
        </div>

        {/* Round list */}
        <div style={{ padding: "20px 28px" }}>
          {pipeline.map((round, i) => (
            <div
              key={round.id}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          12,
                padding:      "10px 0",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width:          28,
                  height:         28,
                  background:     T.primary,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontFamily:     T.fontDisplay,
                  fontWeight:     900,
                  fontSize:       13,
                  color:          "#fff",
                  flexShrink:     0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              <span style={{ fontSize: 18 }}>{round.icon}</span>

              <span
                style={{
                  fontFamily:    T.fontDisplay,
                  fontWeight:    800,
                  fontSize:      15,
                  color:         T.secondary,
                  textTransform: "uppercase",
                  flex:          1,
                }}
              >
                {round.label}
              </span>

              <span
                style={{
                  fontSize:   11,
                  color:      T.inkFaint,
                  fontFamily: T.fontBody,
                }}
              >
                {round.duration}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div
          style={{
            padding: "16px 28px 24px",
            display: "flex",
            gap:     12,
          }}
        >
          <button
            onClick={onReset}
            style={{
              background:    "transparent",
              border:        `2px solid ${T.secondary}`,
              color:         T.secondary,
              padding:       "10px 22px",
              fontFamily:    T.fontDisplay,
              fontWeight:    800,
              fontSize:      13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor:        "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.secondary;
              e.currentTarget.style.color      = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color      = T.secondary;
            }}
          >
            ← BUILD ANOTHER
          </button>

          <button
            onClick={onViewJson}
            style={{
              background:    T.secondary,
              border:        `2px solid ${T.secondary}`,
              color:         "#fff",
              padding:       "10px 22px",
              fontFamily:    T.fontDisplay,
              fontWeight:    800,
              fontSize:      13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor:        "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = T.primary;
              e.currentTarget.style.borderColor = T.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = T.secondary;
              e.currentTarget.style.borderColor = T.secondary;
            }}
          >
            VIEW JSON {"{ }"}
          </button>
        </div>
      </div>
    </div>
  );
}
