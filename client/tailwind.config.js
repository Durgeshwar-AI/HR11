/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E8521A",
        secondary: "#1A1A1A",
        tertiary: "#F5F0E8",
        ink: "#1A1A1A",
        "ink-light": "#5A5040",
        "ink-faint": "#B0A898",
        surface: "#FFFFFF",
        "surface-alt": "#EDE8DF",
        "surface-warm": "#FAF6F0",
        "border-clr": "#D5CFC4",
        "border-dark": "#1A1A1A",
        success: "#2A7A2A",
        "success-bg": "#EAF5EA",
        danger: "#B22222",
        "danger-bg": "#FFF0F0",
        warning: "#C07800",
        "warning-bg": "#FFF8E8",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'Courier New'", "monospace"],
      },
      boxShadow: {
        brutal: "4px 4px 0 #1A1A1A",
        "brutal-orange": "4px 4px 0 #E8521A",
        "brutal-sm": "2px 2px 0 #1A1A1A",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(.88) translateY(8px)" },
          "65%": { transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideLeft: {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".4" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        waveBar: {
          "0%, 100%": { height: "8px" },
          "50%": { height: "28px" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        "fade-in": "fadeIn 0.4s ease both",
        "pop-in": "popIn 0.35s cubic-bezier(.34,1.56,.64,1) both",
        "slide-left": "slideLeft 0.4s ease both",
        spin: "spin 1s linear infinite",
        pulse: "pulse 1.5s infinite",
        marquee: "marquee 22s linear infinite",
        "wave-bar": "waveBar 0.8s ease infinite",
      },
    },
  },
  plugins: [],
};
