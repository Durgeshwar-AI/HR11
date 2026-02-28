import { useState } from "react";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";
import { OrDivider } from "../auth/AuthPages";
import { PublicNav } from "../../assets/components/layout/PublicNav";
import { useNavigate } from "react-router-dom";

export function CandidateHome() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState({ email: "", pass: "" });
  const [regForm, setRegForm] = useState({ name: "", email: "", pass: "", role: "" });
  const setLogin = (k: string) => (e: any) => setLoginForm(f => ({ ...f, [k]: e.target.value }));
  const setReg = (k: string) => (e: any) => setRegForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-tertiary flex flex-col">
      <PublicNav />

      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <h1 className="font-display font-black text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight text-secondary mb-6 text-center">
          Find Your Next Job
        </h1>
        <p className="font-body text-sm text-ink-light mb-8 text-center max-w-md">
          Login or create an account to apply for jobs.
        </p>

        <div className="flex gap-4 mb-8">
          <Btn variant={mode === "login" ? undefined : "secondary"} onClick={() => setMode("login")}>
            Login
          </Btn>
          <Btn variant={mode === "register" ? undefined : "secondary"} onClick={() => setMode("register")}>
            Sign Up
          </Btn>
        </div>

        {mode === "login" ? (
          <div className="w-full max-w-[420px]">
            <div className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@email.com"
                value={loginForm.email}
                onChange={setLogin("email")}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginForm.pass}
                onChange={setLogin("pass")}
                required
              />
              <Btn fullWidth onClick={() => navigate("/candidate-profile")}>
                Sign In →
              </Btn>
              <OrDivider />
              <Btn fullWidth variant="secondary">🔗 Continue with Google</Btn>
              <Btn fullWidth variant="secondary">💼 Continue with LinkedIn</Btn>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[420px]">
            <div className="flex flex-col gap-3.5">
              <Input label="Full Name" placeholder="Arjun Mehta" value={regForm.name} onChange={setReg("name")} required />
              <Input label="Email" type="email" placeholder="arjun@email.com" value={regForm.email} onChange={setReg("email")} required />
              <Input label="Desired Role" placeholder="e.g. Senior Backend Engineer" value={regForm.role} onChange={setReg("role")} />
              <Input label="Password" type="password" placeholder="Create a strong password" value={regForm.pass} onChange={setReg("pass")} required />
              <Btn fullWidth onClick={() => navigate("/candidate-profile")}>
                Create My Account →
              </Btn>
              <Btn fullWidth variant="secondary">🔗 Sign Up with Google</Btn>
              <Btn fullWidth variant="secondary">💼 Import from LinkedIn</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
