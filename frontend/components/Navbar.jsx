import { T } from "../theme/tokens";

/**
 * Navbar
 * Top navigation bar with logo and CTA.
 * Stays fixed at the top of the page.
 */
export function Navbar() {
  return (
    <nav
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        padding:         "0 40px",
        height:          60,
        background:      T.tertiary,
        borderBottom:    `2px solid ${T.secondary}`,
        position:        "sticky",
        top:             0,
        zIndex:          100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily:    T.fontDisplay,
          fontWeight:    900,
          fontSize:      22,
          color:         T.secondary,
          letterSpacing: "-0.01em",
          display:       "flex",
          alignItems:    "center",
          gap:           4,
        }}
      >
        HIREFLOW
        <span
          style={{
            background:    T.primary,
            color:         "#fff",
            fontSize:      10,
            fontWeight:    800,
            padding:       "2px 6px",
            letterSpacing: "0.1em",
            marginLeft:    6,
            marginBottom:  2,
            alignSelf:     "flex-end",
          }}
        >
          AI
        </span>
      </div>

      {/* Nav links + CTA */}
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {["Why HireFlow", "How it works", "Pricing"].map((link) => (
          <span
            key={link}
            style={{
              fontFamily:    T.fontBody,
              fontWeight:    500,
              fontSize:      13,
              color:         T.inkLight,
              cursor:        "pointer",
              letterSpacing: "0.02em",
            }}
          >
            {link}
          </span>
        ))}

        <button
          style={{
            background:    T.primary,
            color:         "#fff",
            border:        "none",
            padding:       "9px 22px",
            fontFamily:    T.fontDisplay,
            fontWeight:    800,
            fontSize:      14,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor:        "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = T.secondary)}
          onMouseLeave={(e) => (e.currentTarget.style.background = T.primary)}
        >
          GET STARTED FREE
        </button>
      </div>
    </nav>
  );
}
