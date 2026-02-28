import { useState } from "react";

export function Input({ label, type = "text", placeholder, value, onChange, error, required }: any) {
  const [focus, setFocus] = useState(false);
  return (
    <div className="flex flex-col gap-[5px]">
      {label && (
        <label className="font-display font-bold text-[11px] tracking-[0.15em] uppercase text-ink-light">
          {label}{required && <span className="text-primary"> *</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className={[
          "bg-surface rounded-none py-[11px] px-[14px] text-sm text-secondary font-body outline-none w-full",
          "transition-[border-color] duration-150 border-2",
          error ? "border-danger" : focus ? "border-primary" : "border-border-dark",
        ].join(" ")}
      />
      {error && <span className="text-[11px] text-danger font-body">{error}</span>}
    </div>
  );
}
