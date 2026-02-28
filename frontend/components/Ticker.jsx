import { T } from "../theme/tokens";

const ITEMS = [
  "RESUME SCREENING",
  "CODING CHALLENGE",
  "AI VOICE INTERVIEW",
  "HR ROUND",
  "BACKGROUND CHECK",
  "OFFER & ONBOARDING",
];

/**
 * Ticker
 * Quoti-style infinite scrolling marquee strip.
 * Renders the list doubled so the loop is seamless.
 */
export function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div
      style={{
        background:    T.secondary,
        overflow:      "hidden",
        padding:       "10px 0",
        borderTop:     `1px solid ${T.borderDark}`,
        borderBottom:  `1px solid ${T.borderDark}`,
        whiteSpace:    "nowrap",
      }}
    >
      <div
        style={{
          display:   "inline-flex",
          animation: "marquee 18s linear infinite",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily:    T.fontDisplay,
              fontWeight:    900,
              fontSize:      14,
              color:         "#fff",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginRight:   48,
            }}
          >
            {item}
            <span style={{ color: T.primary, marginLeft: 48 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
