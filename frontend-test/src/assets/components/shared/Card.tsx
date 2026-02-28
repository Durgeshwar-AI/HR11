import { useState } from "react";

export function Card({ children, hover = false, shadow = false, style = {}, onClick }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={[
        "bg-surface border-2 rounded-none transition-all duration-150",
        hover && hov ? "border-primary shadow-brutal-orange -translate-x-0.5 -translate-y-0.5" : "border-secondary",
        shadow ? "shadow-brutal" : "",
        onClick ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
      style={style}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }: any) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-display font-black text-[11px] tracking-[0.2em] text-ink-faint uppercase">
        {children}
      </span>
      <div className="flex-1 h-0.5 bg-secondary" />
    </div>
  );
}

export function Divider() {
  return <div className="h-px bg-border-clr w-full" />;
}
