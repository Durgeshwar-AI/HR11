import { useState } from "react";
import { T } from "../../../../frontend/src/theme/tokens";
import { AppShell } from "../../assets/components/layout/AppShell";
import { Card } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { Input } from "../../assets/components/shared/Input";

// A simple page where HR can upload a resume and supply a job title/description
// The form hits the `/api/candidates/submit-and-screen` endpoint and displays
// the returned screening result.

export function ResumeScreening({ onNavigate }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setResumeFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e) => {
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
    } catch (err) {
      console.error("screening error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell currentPage="resume-screening" onNavigate={onNavigate}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: T.fontBody,
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: T.primary,
              marginBottom: 4,
            }}>
            Resume Screening
          </p>
          <h1
            style={{
              fontFamily: T.fontDisplay,
              fontWeight: 900,
              fontSize: "clamp(1.8rem,3vw,2.4rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: T.secondary,
            }}>
            Upload &amp; Evaluate
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Input
            label="Job Title"
            placeholder="E.g. Senior Backend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: T.inkLight,
              }}>
              Job Description <span style={{ color: T.primary }}>*</span>
            </label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{
                background: T.surface,
                border: `2px solid ${T.borderDark}`,
                padding: "10px 14px",
                fontSize: 14,
                color: T.secondary,
                fontFamily: T.fontBody,
                outline: "none",
                transition: "border-color 0.15s",
                width: "100%",
              }}
              required
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: T.inkLight,
              }}>
              Resume (PDF / DOCX) <span style={{ color: T.primary }}>*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ fontSize: 14 }}
            />
          </div>

          {error && (
            <div style={{ color: T.danger, fontSize: 13 }}>{error}</div>
          )}

          <Btn type="submit" disabled={loading} fullWidth>
            {loading ? "Screening…" : "Submit & Screen"}
          </Btn>
        </form>

        {screening && (
          <Card style={{ marginTop: 24, padding: "20px" }}>
            <h2 style={{ marginTop: 0, fontFamily: T.fontDisplay, fontSize: 18 }}>
              Screening Result
            </h2>
            <pre
              style={{ fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {JSON.stringify(screening, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
