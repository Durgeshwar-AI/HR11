/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  HIREFLOW AI — DESIGN TOKENS                        ║
 * ║  Quoti-inspired 3-colour rule                       ║
 * ║                                                      ║
 * ║  Primary   #E8521A  Burnt Orange  CTA / active       ║
 * ║  Secondary #1A1A1A  Near-Black    Structure / text   ║
 * ║  Tertiary  #F5F0E8  Warm Cream    Background / space ║
 * ╚══════════════════════════════════════════════════════╝
 */

export const T = {
  // ── Core 3-colour palette ──────────────────────────────
  primary:    "#E8521A",   // burnt orange  — CTA, selected, drag handle, highlights
  secondary:  "#1A1A1A",   // near-black    — text, borders, structure, icons
  tertiary:   "#F5F0E8",   // warm cream    — page bg, light surfaces

  // ── Extended ink scale ─────────────────────────────────
  ink:        "#1A1A1A",
  inkLight:   "#5A5040",
  inkFaint:   "#B0A898",

  // ── Surface scale ──────────────────────────────────────
  surface:    "#FFFFFF",
  surfaceAlt: "#EDE8DF",

  // ── Border scale ───────────────────────────────────────
  border:     "#D5CFC4",
  borderDark: "#1A1A1A",

  // ── Typography ─────────────────────────────────────────
  fontDisplay: "'Barlow Condensed', sans-serif",   // heavy all-caps headings
  fontBody:    "'DM Sans', sans-serif",            // clean readable body
  fontMono:    "'Courier New', monospace",         // code / JSON

  // ── Motion ─────────────────────────────────────────────
  transBase: "all 0.14s ease",
  transColor: "background 0.14s ease, border-color 0.14s ease, color 0.14s ease",
};
