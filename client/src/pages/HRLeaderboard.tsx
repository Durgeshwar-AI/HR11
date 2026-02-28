import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface LeaderboardEntry {
  rank: number;
  candidateId: string;
  candidateName: string;
  overallScore: number;
  justification: string;
}

interface LeaderboardData {
  ranking: {
    leaderboard: LeaderboardEntry[];
    doNotProceed: { candidateId: string; reason: string }[];
    recommendedTopCandidate: string;
  };
  raw: Record<string, unknown>[];
}

export default function HRLeaderboard() {
  const { jobId } = useParams<{ jobId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/hr/login");
      return;
    }

    api<LeaderboardData>(`/interviews/job/${jobId}/leaderboard`, { token })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [jobId, token, navigate]);

  if (loading) return <div className="dashboard-container"><p>Loading leaderboard...</p></div>;

  return (
    <div className="dashboard-container">
      <Link to="/hr/dashboard" className="back-link">
        ← Back to Dashboard
      </Link>

      <header style={{ marginBottom: "2rem" }}>
        <h1>Candidate Leaderboard</h1>
      </header>

      {error && <div className="error-message">{error}</div>}

      {data?.ranking?.leaderboard?.length ? (
        <div className="leaderboard">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Candidate</th>
                <th>Score</th>
                <th>Justification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.ranking.leaderboard.map((entry) => (
                <tr
                  key={entry.candidateId}
                  className={
                    entry.candidateId === data.ranking.recommendedTopCandidate
                      ? "recommended"
                      : ""
                  }
                >
                  <td>
                    <span className="rank-badge">#{entry.rank}</span>
                  </td>
                  <td>{entry.candidateName}</td>
                  <td>
                    <span className="score-badge">{entry.overallScore}</span>
                  </td>
                  <td className="justification">
                    {entry.justification || "—"}
                  </td>
                  <td>
                    {data.raw.find(
                      (r) => {
                        const cid = (r.candidateId as Record<string, unknown>)?._id || r.candidateId;
                        return cid === entry.candidateId;
                      }
                    ) && (
                      <Link
                        to={`/hr/interviews/${
                          data.raw.find(
                            (r) => {
                              const cid = (r.candidateId as Record<string, unknown>)?._id || r.candidateId;
                              return cid === entry.candidateId;
                            }
                          )?._id
                        }`}
                        className="btn btn-sm btn-primary"
                      >
                        View Report
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Do Not Proceed */}
          {data.ranking.doNotProceed?.length > 0 && (
            <section className="card" style={{ marginTop: "2rem" }}>
              <h3>⛔ Do Not Proceed</h3>
              <ul>
                {data.ranking.doNotProceed.map((entry) => (
                  <li key={entry.candidateId}>
                    <strong>{entry.candidateId}</strong>: {entry.reason}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <p className="text-muted">
          No evaluated interviews yet for this job role.
        </p>
      )}
    </div>
  );
}
