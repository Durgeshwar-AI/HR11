import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Question {
  _id: string;
  stepNumber: number;
  text: string;
  level: string;
  enableHint: boolean;
  hintText: string;
  hintTriggerSeconds: number;
  keyConceptsExpected: string[];
  maxScore: number;
  allowFollowUp: boolean;
  followUpPrompt: string;
}

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
  questions: Question[];
}

export default function HRJobBuilder() {
  const { jobId } = useParams<{ jobId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // New question form
  const [showForm, setShowForm] = useState(false);
  const [qText, setQText] = useState("");
  const [qLevel, setQLevel] = useState("Medium");
  const [qEnableHint, setQEnableHint] = useState(false);
  const [qHintText, setQHintText] = useState("");
  const [qHintTrigger, setQHintTrigger] = useState(8);
  const [qKeyConcepts, setQKeyConcepts] = useState("");
  const [qAllowFollowUp, setQAllowFollowUp] = useState(true);
  const [qFollowUpPrompt, setQFollowUpPrompt] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchJob = async () => {
    try {
      const data = await api<Job>(`/jobs/${jobId}`, { token });
      setJob(data);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/hr/login");
      return;
    }
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, jobId, navigate]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await api(`/jobs/${jobId}/questions`, {
        method: "POST",
        token,
        body: {
          text: qText,
          level: qLevel,
          enableHint: qEnableHint,
          hintText: qHintText || undefined,
          hintTriggerSeconds: qHintTrigger,
          keyConceptsExpected: qKeyConcepts
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          allowFollowUp: qAllowFollowUp,
          followUpPrompt: qFollowUpPrompt || undefined,
        },
      });

      // Reset form
      setQText("");
      setQLevel("Medium");
      setQEnableHint(false);
      setQHintText("");
      setQHintTrigger(8);
      setQKeyConcepts("");
      setQAllowFollowUp(true);
      setQFollowUpPrompt("");
      setShowForm(false);
      fetchJob();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;

    try {
      await api(`/jobs/${jobId}/questions/${questionId}`, {
        method: "DELETE",
        token,
      });
      fetchJob();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  if (loading) return <div className="dashboard-container"><p>Loading...</p></div>;
  if (!job) return <div className="dashboard-container"><p>Job not found</p></div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <Link to="/hr/dashboard" className="back-link">
            ← Back to Dashboard
          </Link>
          <h1>{job.title}</h1>
          <p>{job.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Question
        </button>
      </header>

      {/* Add Question Form */}
      {showForm && (
        <section className="card" style={{ marginBottom: "2rem" }}>
          <h2>Add New Question</h2>
          <form onSubmit={handleAddQuestion}>
            <div className="form-group">
              <label>Question Text</label>
              <textarea
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="Explain the difference between useMemo and useCallback..."
                rows={3}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty Level</label>
                <select value={qLevel} onChange={(e) => setQLevel(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={qEnableHint}
                    onChange={(e) => setQEnableHint(e.target.checked)}
                  />{" "}
                  Enable Hint
                </label>
              </div>
            </div>

            {qEnableHint && (
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Hint Text</label>
                  <input
                    type="text"
                    value={qHintText}
                    onChange={(e) => setQHintText(e.target.value)}
                    placeholder="Think about what each hook memoizes..."
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Hint Trigger (seconds)</label>
                  <input
                    type="number"
                    value={qHintTrigger}
                    onChange={(e) => setQHintTrigger(Number(e.target.value))}
                    min={3}
                    max={60}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Key Concepts Expected (comma-separated)</label>
              <input
                type="text"
                value={qKeyConcepts}
                onChange={(e) => setQKeyConcepts(e.target.value)}
                placeholder="referential equality, dependency array, memoization"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={qAllowFollowUp}
                  onChange={(e) => setQAllowFollowUp(e.target.checked)}
                />{" "}
                Allow Follow-Up
              </label>
            </div>

            {qAllowFollowUp && (
              <div className="form-group">
                <label>Follow-Up Prompt</label>
                <input
                  type="text"
                  value={qFollowUpPrompt}
                  onChange={(e) => setQFollowUpPrompt(e.target.value)}
                  placeholder="Can you give a real-world example?"
                />
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "Adding..." : "Add Question"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Questions List */}
      <section>
        <h2>Question Path ({questions.length} steps)</h2>
        {questions.length === 0 ? (
          <p className="text-muted">
            No questions yet. Add questions to build the interview path.
          </p>
        ) : (
          <div className="questions-list">
            {questions.map((q) => (
              <div key={q._id} className="card question-card">
                <div className="question-header">
                  <span className="step-number">Step {q.stepNumber}</span>
                  <span className={`badge badge-${q.level.toLowerCase()}`}>
                    {q.level}
                  </span>
                  {q.enableHint && <span className="badge badge-hint">💡 Hint</span>}
                  {q.allowFollowUp && (
                    <span className="badge badge-outline">Follow-up</span>
                  )}
                </div>
                <p className="question-text">{q.text}</p>
                {q.keyConceptsExpected?.length > 0 && (
                  <div className="key-concepts">
                    <small>Key concepts: </small>
                    {q.keyConceptsExpected.map((c) => (
                      <span key={c} className="badge badge-concept">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteQuestion(q._id)}
                  style={{ marginTop: "0.5rem" }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
