import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface QuestionBreakdown {
  stepNumber: number;
  questionText: string;
  level: string;
  candidateAnswerSummary: string;
  score: number;
  hintWasUsed: boolean;
  keyConceptsCovered: string[];
}

interface InterviewReport {
  _id: string;
  candidateId: { _id: string; name: string; email: string };
  jobId: { _id: string; title: string; description: string };
  overallScore: number;
  technicalAccuracy: number;
  communicationScore: number;
  hintRelianceScore: number;
  questionBreakdown: QuestionBreakdown[];
  strengths: string[];
  weaknesses: string[];
  status: string;
  completedAt: string;
  evaluatedAt: string;
  transcript: string;
}

export default function HRInterviewReport() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/hr/login");
      return;
    }

    api<InterviewReport>(`/interviews/${id}`, { token })
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, token, navigate]);

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
  if (!report) return <div className="dashboard-container"><p>Report not found</p></div>;

  return (
    <div className="dashboard-container">
      <Link to="/hr/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <h1>Interview Report</h1>
        <p>
          {report.candidateId?.name} — {report.jobId?.title}
        </p>
        <span className={`badge badge-${report.status.toLowerCase()}`}>
          {report.status}
        </span>
      </header>

      {/* Score Overview */}
      <section className="card scores-overview">
        <h2>Scores</h2>
        <div className="scores-grid">
          <div className="score-item">
            <span className="score-value">{report.overallScore ?? "—"}</span>
            <span className="score-label">Overall (0-100)</span>
          </div>
          <div className="score-item">
            <span className="score-value">{report.technicalAccuracy ?? "—"}</span>
            <span className="score-label">Technical (0-10)</span>
          </div>
          <div className="score-item">
            <span className="score-value">{report.communicationScore ?? "—"}</span>
            <span className="score-label">Communication (0-10)</span>
          </div>
          <div className="score-item">
            <span className="score-value">{report.hintRelianceScore ?? "—"}</span>
            <span className="score-label">Hint Reliance (0-10)</span>
          </div>
        </div>
      </section>

      {/* Strengths & Weaknesses */}
      <div className="two-col">
        <section className="card">
          <h3>✅ Strengths</h3>
          {report.strengths?.length ? (
            <ul>
              {report.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Not yet evaluated</p>
          )}
        </section>

        <section className="card">
          <h3>⚠️ Weaknesses</h3>
          {report.weaknesses?.length ? (
            <ul>
              {report.weaknesses.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Not yet evaluated</p>
          )}
        </section>
      </div>

      {/* Question Breakdown */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Question Breakdown</h2>
        {report.questionBreakdown?.length ? (
          <div className="questions-list">
            {report.questionBreakdown.map((q, i) => (
              <div key={i} className="card question-card">
                <div className="question-header">
                  <span className="step-number">Step {q.stepNumber}</span>
                  <span className={`badge badge-${q.level?.toLowerCase()}`}>
                    {q.level}
                  </span>
                  <span className="score-badge">{q.score}/10</span>
                  {q.hintWasUsed && <span className="badge badge-hint">Hint Used</span>}
                </div>
                <p className="question-text">{q.questionText}</p>
                <p><strong>Answer Summary:</strong> {q.candidateAnswerSummary}</p>
                {q.keyConceptsCovered?.length > 0 && (
                  <div className="key-concepts">
                    <small>Concepts covered: </small>
                    {q.keyConceptsCovered.map((c) => (
                      <span key={c} className="badge badge-concept">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted">Not yet evaluated</p>
        )}
      </section>

      {/* Transcript */}
      <section style={{ marginTop: "2rem" }}>
        <button
          className="btn btn-secondary"
          onClick={() => setShowTranscript(!showTranscript)}
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>
        {showTranscript && report.transcript && (
          <div className="card" style={{ marginTop: "1rem" }}>
            <pre className="transcript">{report.transcript}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
