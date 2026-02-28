import { useState } from "react";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";

function AuthShell({ title, subtitle, tag, children, footer }: any) {
  return (
    <div className="min-h-screen bg-tertiary flex items-stretch">
      {/* Left panel — branding */}
      <div className="w-[42%] bg-secondary p-12 flex flex-col justify-between">
        <div className="font-display font-black text-2xl text-white">
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 ml-2 tracking-[0.1em]">AI</span>
        </div>

        <div>
          <div className="font-display font-black text-[clamp(2.4rem,4vw,3.8rem)] leading-[0.9] uppercase text-white mb-5">
            HIRE<br /><span className="text-primary">SMARTER.</span><br />FASTER.
          </div>
          <p className="text-white/50 text-sm font-body leading-relaxed max-w-[300px]">
            Autonomous AI handles sourcing, screening, and interviews — so your team
            focuses on making the final call.
          </p>
        </div>

        <div className="flex gap-6">
          {["247 Active Applications", "38 Shortlisted", "6 Hired This Month"].map((s) => (
            <div key={s} className="border-l-2 border-primary pl-2.5">
              <div className="font-display font-black text-[11px] text-white tracking-[0.12em] uppercase">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-[420px]">
          {tag && (
            <span className="font-body font-semibold text-[10px] tracking-[0.2em] uppercase text-primary bg-primary/[0.08] border border-primary/20 px-2.5 py-[3px] inline-block mb-4">
              {tag}
            </span>
          )}
          <h1 className="font-display font-black text-[clamp(1.8rem,3vw,2.4rem)] uppercase tracking-tight text-secondary mb-2 leading-none">
            {title}
          </h1>
          <p className="font-body text-[13px] text-ink-light mb-8 leading-relaxed">{subtitle}</p>

          {children}

          {footer && (
            <p className="text-center mt-6 text-[13px] text-ink-light font-body">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border-clr" />
      <span className="text-[11px] text-ink-faint font-body">OR</span>
      <div className="flex-1 h-px bg-border-clr" />
    </div>
  );
}

/* ─── Company Login ─── */
export function CompanyLogin({ onNavigate }: any) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Welcome Back"
      subtitle="Sign in to manage your hiring pipelines and review candidates."
      footer={
        <>
          Don't have an account?{" "}
          <span onClick={() => onNavigate("register-company")} className="text-primary cursor-pointer font-semibold">
            Register your company
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Work Email" type="email" placeholder="you@company.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={(e: any) => setPass(e.target.value)} required />
        <div className="flex justify-end">
          <span className="text-xs text-primary cursor-pointer font-body">Forgot password?</span>
        </div>
        <Btn fullWidth onClick={() => onNavigate("dashboard")}>Sign In →</Btn>
        <OrDivider />
        <Btn fullWidth variant="secondary" onClick={() => onNavigate("dashboard")}>🔗 Continue with Google</Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Company Register ─── */
export function CompanyRegister({ onNavigate }: any) {
  const [form, setForm] = useState({ company: "", name: "", email: "", pass: "" });
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Start Hiring Smarter"
      subtitle="Set up your company account. Free for 30 days, no credit card required."
      footer={
        <>
          Already have an account?{" "}
          <span onClick={() => onNavigate("login-company")} className="text-primary cursor-pointer font-semibold">
            Sign in
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <Input label="Company Name" placeholder="TechCorp Inc." value={form.company} onChange={set("company")} required />
        <Input label="Your Full Name" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
        <Input label="Work Email" type="email" placeholder="you@company.com" value={form.email} onChange={set("email")} required />
        <Input label="Password" type="password" placeholder="Create a strong password" value={form.pass} onChange={set("pass")} required />
        <p className="text-[11px] text-ink-faint font-body leading-snug">
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
        <Btn fullWidth onClick={() => onNavigate("dashboard")}>Create Company Account →</Btn>
        <Btn fullWidth variant="secondary" onClick={() => onNavigate("dashboard")}>🔗 Register with Google</Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Candidate Login ─── */
export function CandidateLogin({ onNavigate }: any) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Track Your Applications"
      subtitle="Log in to see your application status, upcoming interviews, and results."
      footer={
        <>
          New here?{" "}
          <span onClick={() => onNavigate("register-candidate")} className="text-primary cursor-pointer font-semibold">
            Create a free account
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••" value={pass} onChange={(e: any) => setPass(e.target.value)} required />
        <Btn fullWidth onClick={() => onNavigate("candidate-profile")}>Sign In →</Btn>
        <OrDivider />
        <Btn fullWidth variant="secondary">🔗 Continue with Google</Btn>
        <Btn fullWidth variant="secondary">💼 Continue with LinkedIn</Btn>
      </div>
    </AuthShell>
  );
}

/* ─── Candidate Register ─── */
export function CandidateRegister({ onNavigate }: any) {
  const [form, setForm] = useState({ name: "", email: "", pass: "", role: "" });
  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Apply for Jobs"
      subtitle="Create your profile and let AI match you to the right opportunities."
      footer={
        <>
          Already have an account?{" "}
          <span onClick={() => onNavigate("login-candidate")} className="text-primary cursor-pointer font-semibold">
            Sign in
          </span>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
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
