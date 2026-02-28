import { Btn } from "../shared/Btn";

export function PublicNav({ onNavigate, currentPage }: any) {
  const links = [
    { key: "why", label: "Why HR11" },
    { key: "how", label: "How It Works" },
    { key: "pricing", label: "Pricing" },
  ];

  return (
    <nav className="flex items-center justify-between px-12 h-[62px] bg-tertiary border-b-2 border-secondary sticky top-0 z-[100]">
      <div
        onClick={() => onNavigate?.("home")}
        className="font-display font-black text-[22px] text-secondary cursor-pointer flex items-center gap-1"
      >
        HR<span className="text-primary">11</span>
        <span className="bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 tracking-[0.1em] ml-1 mb-0.5 self-end">
          AI
        </span>
      </div>

      <div className="flex gap-8 items-center">
        {links.map((l) => (
          <span
            key={l.key}
            onClick={() => onNavigate?.(l.key)}
            className={[
              "font-body font-medium text-[13px] cursor-pointer pb-0.5 transition-all duration-150",
              currentPage === l.key
                ? "text-primary border-b-2 border-primary"
                : "text-ink-light border-b-2 border-transparent",
            ].join(" ")}
          >
            {l.label}
          </span>
        ))}
        <div className="w-px h-5 bg-border-clr" />
        <Btn
          size="sm"
          variant="secondary"
          onClick={() => onNavigate?.("login-company")}
        >
          Company Login
        </Btn>
        <Btn size="sm" onClick={() => onNavigate?.("register-company")}>
          Get Started Free
        </Btn>
      </div>
    </nav>
  );
}
