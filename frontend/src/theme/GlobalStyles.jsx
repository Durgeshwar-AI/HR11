import { T } from "./tokens";

export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${T.tertiary}; font-family: ${T.fontBody}; color: ${T.secondary}; }
      a { text-decoration: none; color: inherit; }

      ::-webkit-scrollbar        { width: 5px; }
      ::-webkit-scrollbar-track  { background: ${T.surfaceAlt}; }
      ::-webkit-scrollbar-thumb  { background: ${T.inkFaint}; border-radius: 3px; }

      @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
      @keyframes popIn     { 0%{opacity:0;transform:scale(.88) translateY(8px)} 65%{transform:scale(1.02)} 100%{opacity:1;transform:scale(1)} }
      @keyframes slideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
      @keyframes spin      { to{transform:rotate(360deg)} }
      @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
      @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      @keyframes waveBar   { 0%,100%{height:8px} 50%{height:28px} }

      .fade-up   { animation: fadeUp   0.5s ease both; }
      .fade-in   { animation: fadeIn   0.4s ease both; }
      .pop-in    { animation: popIn    0.35s cubic-bezier(.34,1.56,.64,1) both; }
      .slide-left{ animation: slideLeft 0.4s ease both; }
    `}</style>
  );
}
