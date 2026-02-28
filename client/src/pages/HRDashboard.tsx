import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
  totalSteps: number;
  createdAt: string;
}

export default function HRDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // New job form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const data = await api<Job[]>("/jobs", { token });
      setJobs(data);
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
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await api("/jobs", {
        method: "POST",
        token,
        body: {
          title: newTitle,
          description: newDescription,
          skills: newSkills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });

      setNewTitle("");
      setNewDescription("");
      setNewSkills("");
      setShowForm(false);
      fetchJobs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, status: string) => {
    try {
      await api(`/jobs/${jobId}`, {
        method: "PUT",
        token,
        body: { status },
      });
      fetchJobs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>HR Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + New Job Role
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Create Job Form */}
      {showForm && (
        <section className="card" style={{ marginBottom: "2rem" }}>
          <h2>Create New Job Role</h2>
          <form onSubmit={handleCreateJob}>
            <div className="form-group">
              <label>Job Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Senior React Engineer"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Role description..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input
                type="text"
                value={newSkills}
                onChange={(e) => setNewSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Job"}
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

      {/* Jobs List */}
      <section>
        <h2>Job Roles ({jobs.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted">
            No job roles yet. Create one to get started.
          </p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="card job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className={`badge badge-${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </div>
                <p>{job.description}</p>
                <div className="job-meta">
                  <span className="badge">
                    {job.totalSteps || 0} questions
                  </span>
                  {job.skills?.map((skill) => (
                    <span key={skill} className="badge badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>

                <div
                  className="job-actions"
                  style={{
                    marginTop: "1rem",
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to={`/hr/jobs/${job._id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Edit Questions
                  </Link>
                  <Link
                    to={`/hr/jobs/${job._id}/leaderboard`}
                    className="btn btn-secondary btn-sm"
                  >
                    Leaderboard
                  </Link>

                  {job.status === "Draft" && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusChange(job._id, "Active")}
                    >
                      Activate
                    </button>
                  )}
                  {job.status === "Active" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusChange(job._id, "Closed")}
                    >
                      Close
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
