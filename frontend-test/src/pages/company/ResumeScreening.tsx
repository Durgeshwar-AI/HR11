import { useState } from "react";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";

// A simple page where HR can upload a resume and supply a job title/description
// The form hits the `/api/candidates/submit-and-screen` endpoint and displays
// the returned screening result.

export function ResumeScreening({ onNavigate }: any) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: any) => {
    setResumeFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!resumeFile) return setError("Please select a resume file.");
    if (!jobTitle.trim() || !jobDescription.trim()) {
      return setError("Job title and description are required.");
    }

    setError("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("resume", resumeFile);
      form.append("jobTitle", jobTitle);
      form.append("jobDescription", jobDescription);

      const resp = await fetch("/api/candidates/submit-and-screen", {
        method: "POST",
        body: form,
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Unknown error");
      setScreening(data.screening);
    } catch (err: any) {
      console.error("screening error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell currentPage="resume-screening" onNavigate={onNavigate}>
      <div className="max-w-[640px] mx-auto">
        <div className="fade-up mb-7">
          <p className="font-body text-xs tracking-[0.15em] uppercase text-primary mb-1">Resume Screening</p>
          <h1 className="font-display font-black text-[clamp(1.8rem,3vw,2.4rem)] uppercase tracking-tight text-secondary">
            Upload &amp; Evaluate
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Job Title"
            placeholder="E.g. Senior Backend Engineer"
            value={jobTitle}
            onChange={(e: any) => setJobTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[11px] tracking-[0.15em] uppercase text-ink-light">
              Job Description <span className="text-primary">*</span>
            </label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="bg-surface border-2 border-border-dark px-3.5 py-2.5 text-sm text-secondary font-body outline-none transition-colors w-full focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="font-display font-bold text-[11px] tracking-[0.15em] uppercase text-ink-light">
              Resume (PDF / DOCX) <span className="text-primary">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="text-sm"
            />
          </div>

          {error && <div className="text-danger text-[13px]">{error}</div>}

          <Btn type="submit" disabled={loading} fullWidth>
            {loading ? "Screening…" : "Submit & Screen"}
          </Btn>
        </form>

        {screening && (
          <Card>
            <div className="mt-6 p-5">
              <h2 className="mt-0 font-display text-lg">Screening Result</h2>
              <pre className="text-xs whitespace-pre-wrap break-words">
                {JSON.stringify(screening, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
