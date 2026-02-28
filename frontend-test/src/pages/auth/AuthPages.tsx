import { useState } from "react";
import { T } from "../../theme/tokens";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";

function AuthShell({ title, subtitle, tag, children, footer }) {
  return (
    <div style={{
      minHeight: "100vh", background: T.tertiary,
      display: "flex", alignItems: "stretch",
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: "42%", background: T.secondary,
        padding: "48px", display: "flex", flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 24, color: "#fff" }}>
          HR<span style={{ color: T.primary }}>11</span>
          <span style={{ background: T.primary, color: "#fff", fontSize: 9,
            padding: "2px 6px", marginLeft: 8, letterSpacing: "0.1em" }}>AI</span>
        </div>

        <div>
          <div style={{ fontFamily: T.fontDisplay, fontWeight: 900,
            fontSize: "clamp(2.4rem,4vw,3.8rem)", lineHeight: 0.9,
            textTransform: "uppercase", color: "#fff", marginBottom: 20 }}>
            HIRE<br /><span style={{ color: T.primary }}>SMARTER.</span><br />FASTER.
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14,
            fontFamily: T.fontBody, lineHeight: 1.65, maxWidth: 300 }}>
            Autonomous AI handles sourcing, screening, and interviews — so your team
            focuses on making the final call.
          </p>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {["247 Active Applications", "38 Shortlisted", "6 Hired This Month"].map(s => (
            <div key={s} style={{ borderLeft: `2px solid ${T.primary}`, paddingLeft: 10 }}>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 900, fontSize: 11,
                color: "#fff", letterSpacing: "0.12em", textTransform: "uppercase" }}>{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px",
      }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          {tag && (
            <span style={{
              fontFamily: T.fontBody, fontWeight: 600, fontSize: 10,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: T.primary, background: `${T.primary}15`,
              border: `1px solid ${T.primary}33`, padding: "3px 10px",
              display: "inline-block", marginBottom: 16,
            }}>{tag}</span>
          )}
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 900,
            fontSize: "clamp(1.8rem,3vw,2.4rem)", textTransform: "uppercase",
            letterSpacing: "-0.01em", color: T.secondary, marginBottom: 8,
            lineHeight: 1 }}>{title}</h1>
          <p style={{ fontFamily: T.fontBody, fontSize: 13,
            color: T.inkLight, marginBottom: 32, lineHeight: 1.6 }}>{subtitle}</p>

          {children}

          {footer && (
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13,
              color: T.inkLight, fontFamily: T.fontBody }}>{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Company Login ─── */
export function CompanyLogin({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Welcome Back"
      subtitle="Sign in to manage your hiring pipelines and review candidates."
      footer={<>Don't have an account? <span onClick={() => onNavigate("register-company")}
        style={{ color: T.primary, cursor: "pointer", fontWeight: 600 }}>Register your company</span></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Work Email" type="email" placeholder="you@company.com"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••"
          value={pass} onChange={e => setPass(e.target.value)} required />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 12, color: T.primary, cursor: "pointer", fontFamily: T.fontBody }}>
            Forgot password?
          </span>
        </div>
        <Btn fullWidth onClick={() => onNavigate("dashboard")}>Sign In →</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>OR</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <Btn fullWidth variant="secondary" onClick={() => onNavigate("dashboard")}>
          🔗 Continue with Google
        </Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Company Register ─── */
export function CompanyRegister({ onNavigate }) {
  const [form, setForm] = useState({ company: "", name: "", email: "", pass: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Start Hiring Smarter"
      subtitle="Set up your company account. Free for 30 days, no credit card required."
      footer={<>Already have an account? <span onClick={() => onNavigate("login-company")}
        style={{ color: T.primary, cursor: "pointer", fontWeight: 600 }}>Sign in</span></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Company Name" placeholder="TechCorp Inc." value={form.company} onChange={set("company")} required />
        <Input label="Your Full Name" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
        <Input label="Work Email" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required />
        <Input label="Password" type="password" placeholder="Create a strong password" value={form.pass} onChange={set("pass")} required />
        <p style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody, lineHeight: 1.5 }}>
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
        <Btn fullWidth onClick={() => onNavigate("dashboard")}>Create Company Account →</Btn>
        <Btn fullWidth variant="secondary" onClick={() => onNavigate("dashboard")}>🔗 Register with Google</Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Candidate Login ─── */
export function CandidateLogin({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Track Your Applications"
      subtitle="Log in to see your application status, upcoming interviews, and results."
      footer={<>New here? <span onClick={() => onNavigate("register-candidate")}
        style={{ color: T.primary, cursor: "pointer", fontWeight: 600 }}>Create a free account</span></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Input label="Email" type="email" placeholder="you@email.com"
          value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••"
          value={pass} onChange={e => setPass(e.target.value)} required />
        <Btn fullWidth onClick={() => onNavigate("candidate-profile")}>Sign In →</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.inkFaint, fontFamily: T.fontBody }}>OR</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <Btn fullWidth variant="secondary">🔗 Continue with Google</Btn>
        <Btn fullWidth variant="secondary">💼 Continue with LinkedIn</Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Candidate Register ─── */
export function CandidateRegister({ onNavigate }) {
  const [form, setForm] = useState({ name: "", email: "", pass: "", role: "" });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Apply for Jobs"
      subtitle="Create your profile and let AI match you to the right opportunities."
      footer={<>Already have an account? <span onClick={() => onNavigate("login-candidate")}
        style={{ color: T.primary, cursor: "pointer", fontWeight: 600 }}>Sign in</span></>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Input label="Full Name" placeholder="Arjun Mehta" value={form.name} onChange={set("name")} required />
        <Input label="Email" type="email" placeholder="arjun@email.com" value={form.email} onChange={set("email")} required />
        <Input label="Desired Role" placeholder="e.g. Senior Backend Engineer" value={form.role} onChange={set("role")} />
        <Input label="Password" type="password" placeholder="Create a strong password" value={form.pass} onChange={set("pass")} required />
        <Btn fullWidth onClick={() => onNavigate("candidate-profile")}>Create My Account →</Btn>
        <Btn fullWidth variant="secondary">🔗 Sign Up with Google</Btn>
        <Btn fullWidth variant="secondary">💼 Import from LinkedIn</Btn>
      </div>
    </AuthShell>
  );
}
