import { T } from "./tokens";

/**
 * GlobalStyles
 * Injects Google Fonts + CSS resets + keyframe animations
 * as a single <style> tag. Mount once at the app root.
 */
export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');

      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        background: ${T.tertiary};
        font-family: ${T.fontBody};
        color: ${T.secondary};
      }

      /* ── Scrollbar ── */
      ::-webkit-scrollbar        { width: 5px; }
      ::-webkit-scrollbar-track  { background: ${T.surfaceAlt}; }
      ::-webkit-scrollbar-thumb  { background: ${T.inkFaint}; border-radius: 3px; }

      /* ── Keyframes ── */
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(22px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @keyframes popIn {
        0%   { opacity: 0; transform: scale(0.88) translateY(10px); }
        65%  { transform: scale(1.02); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes marquee {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      /* ── Utility animation classes ── */
      .fade-up { animation: fadeUp 0.5s ease both; }
      .pop-in  { animation: popIn 0.32s cubic-bezier(.34, 1.56, .64, 1) both; }
    `}</style>
  );
}
