export function StatBox({ label, value, sub, accent }: any) {
  return (
    <div
      className={`border-2 border-secondary py-5 px-6 rounded-none ${accent ? "bg-primary" : "bg-surface"}`}
    >
      <div
        className={`font-display font-black text-[clamp(1.8rem,3vw,2.6rem)] leading-none tracking-tight ${accent ? "text-white" : "text-secondary"}`}
      >
        {value}
      </div>
      <div
        className={`font-display font-bold text-xs tracking-[0.15em] uppercase mt-1.5 ${accent ? "text-white/80" : "text-ink-light"}`}
      >
        {label}
      </div>
      {sub && (
        <div
          className={`text-[11px] mt-1 font-body ${accent ? "text-white/60" : "text-ink-faint"}`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
