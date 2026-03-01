import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";
import { authApi, saveAuth } from "../../services/api";

interface AuthShellProps {
  title: string;
  subtitle: string;
  tag?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

type FormKey = "company" | "name" | "email" | "pass";
type CandidateFormKey = "name" | "email" | "pass" | "role";

function getMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function AuthShell({ title, subtitle, tag, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-tertiary flex items-stretch">
      {/* Left panel — branding */}
      <div className="w-[42%] bg-secondary p-12 flex flex-col justify-between">
        <div className="font-display font-black text-2xl text-white">
          HR<span className="text-primary">11</span>
          <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 ml-2 tracking-[0.1em]">
            AI
          </span>
        </div>

        <div>
          <div className="font-display font-black text-[clamp(2.4rem,4vw,3.8rem)] leading-[0.9] uppercase text-white mb-5">
            HIRE
            <br />
            <span className="text-primary">SMARTER.</span>
            <br />
            FASTER.
          </div>
          <p className="text-white/50 text-sm font-body leading-relaxed max-w-[300px]">
            Autonomous AI handles sourcing, screening, and interviews — so your
            team focuses on making the final call.
          </p>
        </div>

        <div className="flex gap-6">
          {[
            "247 Active Applications",
            "38 Shortlisted",
            "6 Hired This Month",
          ].map((s) => (
            <div key={s} className="border-l-2 border-primary pl-2.5">
              <div className="font-display font-black text-[11px] text-white tracking-[0.12em] uppercase">
                {s}
              </div>
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
          <p className="font-body text-[13px] text-ink-light mb-8 leading-relaxed">
            {subtitle}
          </p>

          {children}

          {footer && (
            <p className="text-center mt-6 text-[13px] text-ink-light font-body">
              {footer}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-border-clr" />
      <span className="text-[11px] text-ink-faint font-body">OR</span>
      <div className="flex-1 h-px bg-border-clr" />
    </div>
  );
}

/* ─── Company Login ─── */
export function CompanyLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.hrLogin({ email, password: pass });
      saveAuth(res.token, res.user as { _id?: string; [key: string]: unknown });
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Welcome Back"
      subtitle="Sign in to manage your hiring pipelines and review candidates."
      footer={
        <>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/company-register")}
            className="text-primary cursor-pointer font-semibold"
          >
            Register your company
          </span>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <span className="text-xs text-primary cursor-pointer font-body">
            Forgot password?
          </span>
        </div>
        {error && (
          <div className="text-xs text-red-600 font-body bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        <Btn fullWidth type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </Btn>
        <OrDivider />
        <Btn
          fullWidth
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
           Continue with Google
        </Btn>
      </form>
    </AuthShell>
  );
}

/* ─── Company Register ─── */
export function CompanyRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: "",
    name: "",
    email: "",
    pass: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: FormKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.hrRegister({ name: form.name, email: form.email, password: form.pass, company: form.company });
      saveAuth(res.token, res.user as { _id?: string; [key: string]: unknown });
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      tag="Company / HR Portal"
      title="Start Hiring Smarter"
      subtitle="Set up your company account. Free for 30 days, no credit card required."
      footer={
        <>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/company-login")}
            className="text-primary cursor-pointer font-semibold"
          >
            Sign in
          </span>
        </>
      }
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
        <Input
          label="Company Name"
          placeholder="TechCorp Inc."
          value={form.company}
          onChange={set("company")}
          required
        />
        <Input
          label="Your Full Name"
          placeholder="Jane Smith"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Input
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={set("email")}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={form.pass}
          onChange={set("pass")}
          required
        />
        <p className="text-[11px] text-ink-faint font-body leading-snug">
          By registering you agree to our Terms of Service and Privacy Policy.
        </p>
        {error && (
          <div className="text-xs text-red-600 font-body bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        <Btn fullWidth type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Company Account →"}
        </Btn>
        <Btn
          fullWidth
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
           Register with Google
        </Btn>
      </form>
    </AuthShell>
  );
}

/* ─── Candidate Login ─── */
export function CandidateLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.candidateLogin({ email, password: pass });
      saveAuth(res.token, res.user as { _id?: string; [key: string]: unknown });
      navigate("/candidate-profile");
    } catch (err: unknown) {
      setError(getMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Track Your Applications"
      subtitle="Log in to see your application status, upcoming interviews, and results."
      footer={
        <>
          New here?{" "}
          <span
            onClick={() => navigate("/candidate-register")}
            className="text-primary cursor-pointer font-semibold"
          >
            Create a free account
          </span>
        </>
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        {error && (
          <div className="text-xs text-red-600 font-body bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        <Btn fullWidth type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign In →"}
        </Btn>
        <OrDivider />
        <Btn fullWidth variant="secondary">
           Continue with Google
        </Btn>
        <Btn fullWidth variant="secondary">
           Continue with LinkedIn
        </Btn>
      </form>
    </AuthShell>
  );
}

/* ─── Candidate Register ─── */
export function CandidateRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", pass: "", role: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: CandidateFormKey) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.candidateRegister({ name: form.name, email: form.email, password: form.pass, role: form.role });
      saveAuth(res.token, res.user as { _id?: string; [key: string]: unknown });
      navigate("/candidate-profile");
    } catch (err: unknown) {
      setError(getMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      tag="Job Applicant Portal"
      title="Apply for Jobs"
      subtitle="Create your profile and let AI match you to the right opportunities."
      footer={
        <>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/candidate-login")}
            className="text-primary cursor-pointer font-semibold"
          >
            Sign in
          </span>
        </>
      }
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
        <Input
          label="Full Name"
          placeholder="Arjun Mehta"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="arjun@email.com"
          value={form.email}
          onChange={set("email")}
          required
        />
        <Input
          label="Desired Role"
          placeholder="e.g. Senior Backend Engineer"
          value={form.role}
          onChange={set("role")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          value={form.pass}
          onChange={set("pass")}
          required
        />
        {error && (
          <div className="text-xs text-red-600 font-body bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}
        <Btn fullWidth type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create My Account →"}
        </Btn>
        <Btn fullWidth variant="secondary">
           Sign Up with Google
        </Btn>
        <Btn fullWidth variant="secondary">
           Import from LinkedIn
        </Btn>
      </form>
    </AuthShell>
  );
}
