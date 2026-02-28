import { T } from "../theme/tokens";

/**
 * Hero
 * Large editorial headline + subtitle block.
 * Sits directly below the Navbar.
 */
export function Hero() {
  return (
    <section
      className="fade-up"
      style={{
        padding:       "56px 40px 40px",
        borderBottom:  `1px solid ${T.border}`,
        display:       "flex",
        alignItems:    "flex-end",
        justifyContent:"space-between",
        gap:           40,
        flexWrap:      "wrap",
      }}
    >
      {/* Giant headline */}
      <div>
        <p
          style={{
            fontFamily:    T.fontBody,
            fontWeight:    500,
            fontSize:      12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color:         T.primary,
            marginBottom:  12,
          }}
        >
          THE HIRING TOOL FOR MODERN TEAMS
        </p>

        <h1
          style={{
            fontFamily:    T.fontDisplay,
            fontWeight:    900,
            fontSize:      "clamp(3rem, 7vw, 6rem)",
            lineHeight:    0.9,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            color:         T.secondary,
          }}
        >
          BUILD YOUR
          <br />
          <span style={{ color: T.primary }}>PERFECT</span>
          <br />
          PIPELINE
        </h1>
      </div>

      {/* Tagline */}
      <p
        style={{
          maxWidth:    340,
          fontSize:    14,
          color:       T.inkLight,
          lineHeight:  1.65,
          fontWeight:  400,
          borderLeft:  `3px solid ${T.primary}`,
          paddingLeft: 16,
          fontFamily:  T.fontBody,
        }}
      >
        Choose your rounds, drag to reorder, and deploy an end-to-end
        autonomous hiring flow in seconds. No back-and-forth. No manual
        screening.
      </p>
    </section>
  );
}
