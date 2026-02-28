import { useState } from "react";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

const SIZE_CLS: Record<string, string> = {
  sm: "py-2 px-4 text-[11px]",
  md: "py-[11px] px-6 text-[13px]",
  lg: "py-[15px] px-8 text-[15px]",
};

const VARIANT_STYLES = {
  primary: {
    base: "bg-primary border-primary text-white",
    hover: "bg-secondary border-white text-white shadow-brutal-sm",
  },
  secondary: {
    base: "bg-transparent border-secondary text-secondary",
    hover: "bg-primary border-secondary text-white",
  },
  ghost: {
    base: "bg-transparent border-border-clr text-ink-light",
    hover: "bg-surface-alt border-border-clr text-ink-light",
  },
  danger: {
    base: "bg-danger-bg border-danger text-danger",
    hover: "bg-danger border-danger text-white",
  },
};

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  size?: BtnSize;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  fullWidth,
  style = {},
  type,
}: BtnProps) {
  const [hov, setHov] = useState(false);
  const v =
    VARIANT_STYLES[variant] ||
    VARIANT_STYLES.primary;
  const activeStyle = hov && !disabled ? v.hover : v.base;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={[
        "inline-flex items-center justify-center gap-2 font-display font-extrabold tracking-[0.08em] uppercase",
        "border-2 rounded-none cursor-pointer transition-all duration-150",
        SIZE_CLS[size] || SIZE_CLS.md,
        disabled
          ? "bg-surface-alt border-border-clr text-ink-faint cursor-not-allowed"
          : activeStyle,
        fullWidth ? "w-full" : "w-auto",
      ].join(" ")}
      style={style}
    >
      {children}
    </button>
  );
}
