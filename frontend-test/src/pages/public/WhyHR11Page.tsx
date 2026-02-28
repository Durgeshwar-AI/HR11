import { T } from "../../theme/tokens";
import { PublicNav } from "../../../../frontend-test/src/assets/components/layout/PublicNav";
import { Ticker } from "../../../../frontend-test/src/assets/components/layout/Ticker";
import { Btn } from "../../../../frontend-test/src/assets/components/shared/Btn";
import { WHY_POINTS } from "../../../../frontend-test/src/constants/data";

function WhyCard({ point, index }) {
  return (
    <div className="fade-up" style={{
      background: T.surface, border: `2px solid ${T.secondary}`,
      padding: "28px 24px",
      transition: T.transBase,
      animationDelay: `${index * 0.08}s`,
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = T.shadowOrange; e.currentTarget.style.transform = "translate(-2px,-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translate(0,0)"; }}
    >
      <div style={{ fontSize: 36, marginBottom: 14 }}>{point.icon}</div>
      <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 20,
        textTransform: "uppercase", color: T.secondary, marginBottom: 10, lineHeight: 1.1 }}>
        {point.title}
      </div>
      <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.inkLight, lineHeight: 1.65 }}>
        {point.desc}
      </p>
    </div>
  );
}

export function WhyHR11Page({ onNavigate }) {
  return (
    <div style={{ minHeight: "100vh", background: T.tertiary }}>
      <PublicNav onNavigate={onNavigate} currentPage="why" />

      {/* Hero */}
      <section style={{
        padding: "72px 48px 56px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        flexWrap: "wrap", gap: 40,
      }}>
        <div>
          <p style={{ fontFamily: T.fontBody, fontWeight: 500, fontSize: 11,
            letterSpacing: "0.25em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>
            The Case for Autonomous Hiring
          </p>
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
            fontSize: "clamp(3rem,7vw,6.5rem)", lineHeight: 0.88,
            textTransform: "uppercase", color: T.secondary, letterSpacing: "-0.02em" }}>
            TRADITIONAL<br />HIRING IS<br /><span style={{ color: T.primary }}>BROKEN.</span>
          </h1>
        </div>
        <div style={{ maxWidth: 380 }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 15, color: T.inkLight,
            lineHeight: 1.7, borderLeft: `3px solid ${T.primary}`, paddingLeft: 16, marginBottom: 24 }}>
            The average hire takes 28 days and involves 14 hours of manual screening per role.
            HR11 replaces that with an autonomous pipeline that runs 24/7 — with zero bias.
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {[["28d→14d","Time to Hire"],["100%","Bias Removed"],["10×","More Candidates"]].map(([val,lbl]) => (
              <div key={lbl} style={{ borderLeft: `3px solid ${T.primary}`, paddingLeft: 10 }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 22, color: T.secondary }}>{val}</div>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 9,
                  letterSpacing: "0.15em", textTransform: "uppercase", color: T.inkFaint }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Ticker items={["10× FASTER", "ZERO BIAS", "VOICE AI", "ANTI-CHEAT", "AUTO SCHEDULE", "FULL REPORTS"]} />

      {/* Why points grid */}
      <section style={{ padding: "64px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "clamp(1.6rem,3vw,2.4rem)",
            textTransform: "uppercase", letterSpacing: "-0.01em", color: T.secondary }}>
            SIX REASONS COMPANIES SWITCH
          </h2>
          <div style={{ flex: 1, height: 2, background: T.secondary }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {WHY_POINTS.map((p, i) => <WhyCard key={i} point={p} index={i} />)}
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ padding: "0 48px 72px" }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: "clamp(1.6rem,3vw,2.4rem)",
          textTransform: "uppercase", letterSpacing: "-0.01em", color: T.secondary, marginBottom: 28 }}>
          HR11 VS TRADITIONAL HIRING
        </h2>
        <div style={{ border: `2px solid ${T.secondary}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: T.secondary }}>
            {["", "Traditional Hiring", "HR11 AI"].map((h, i) => (
              <div key={i} style={{
                padding: "14px 20px",
                fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 13,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: i === 2 ? T.primary : "#fff",
                borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}>{h}</div>
            ))}
          </div>
          {[
            ["Time to First Interview", "3–5 days",     "< 1 hour"],
            ["Resume Screening",         "Manual (hours)","Instant AI"],
            ["Bias Risk",                "High",          "Eliminated"],
            ["Cost per Hire",            "$4,000+",       "< $200"],
            ["Scales with volume",       "No",            "Yes — unlimited"],
            ["Interview scheduling",     "Back-and-forth","Auto calendar sync"],
          ].map(([metric, trad, ai], i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
              borderTop: `1px solid ${T.border}`,
              background: i % 2 === 0 ? T.surface : T.surfaceAlt,
            }}>
              {[metric, trad, ai].map((val, j) => (
                <div key={j} style={{
                  padding: "13px 20px",
                  fontFamily: j === 0 ? T.fontBody : T.fontDisplay,
                  fontWeight: j === 0 ? 500 : 800, fontSize: 13,
                  color: j === 2 ? T.primary : T.secondary,
                  borderLeft: j > 0 ? `1px solid ${T.border}` : "none",
                }}>{val}</div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: T.secondary, padding: "72px 48px", textAlign: "center",
      }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
          fontSize: "clamp(2rem,5vw,4rem)", textTransform: "uppercase",
          letterSpacing: "-0.02em", color: "#fff", marginBottom: 16, lineHeight: 0.9 }}>
          READY TO<br /><span style={{ color: T.primary }}>TRANSFORM</span><br />YOUR HIRING?
        </h2>
        <p style={{ fontFamily: T.fontBody, fontSize: 14, color: "rgba(255,255,255,0.5)",
          marginBottom: 32, maxWidth: 400, margin: "0 auto 32px" }}>
          Join 1,000+ companies hiring smarter with HR11.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn onClick={() => onNavigate?.("register-company")} style={{ fontSize: 15 }}>
            Start Free Trial →
          </Btn>
          <Btn variant="secondary" style={{ borderColor: "#fff", color: "#fff", fontSize: 15 }}
            onClick={() => onNavigate?.("how")}>
            See How It Works
          </Btn>
        </div>
      </section>
    </div>
  );
}
