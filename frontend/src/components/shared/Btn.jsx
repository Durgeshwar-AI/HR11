import { useState } from "react";
import { T } from "../../theme/tokens";

/**
 * Btn — reusable button
 * variant: "primary" | "secondary" | "ghost" | "danger"
 * size: "sm" | "md" | "lg"
 */
export function Btn({ children, variant = "primary", size = "md", onClick, disabled, fullWidth, style = {} }) {
  const [hov, setHov] = useState(false);

  const sizes = { sm: "8px 16px", md: "11px 24px", lg: "15px 32px" };
  const fontSizes = { sm: 11, md: 13, lg: 15 };

  const variants = {
    primary:   { bg: hov ? T.secondary : T.primary,   border: hov ? T.secondary : T.primary,   color: "#fff" },
    secondary: { bg: hov ? T.primary   : "transparent", border: T.secondary, color: hov ? "#fff" : T.secondary },
    ghost:     { bg: hov ? T.surfaceAlt : "transparent", border: T.border,   color: T.inkLight },
    danger:    { bg: hov ? T.danger    : T.dangerBg,   border: T.danger,     color: hov ? "#fff" : T.danger },
  };

  const v = variants[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:    disabled ? T.surfaceAlt : v.bg,
        border:        `2px solid ${disabled ? T.border : v.border}`,
        color:         disabled ? T.inkFaint : v.color,
        padding:       sizes[size],
        fontSize:      fontSizes[size],
        fontFamily:    T.fontDisplay,
        fontWeight:    800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor:        disabled ? "not-allowed" : "pointer",
        transition:    T.transColor,
        display:       "inline-flex",
        alignItems:    "center",
        justifyContent:"center",
        gap:           8,
        width:         fullWidth ? "100%" : "auto",
        borderRadius:  0,
        boxShadow:     !disabled && hov && variant === "primary" ? T.shadowSm : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
