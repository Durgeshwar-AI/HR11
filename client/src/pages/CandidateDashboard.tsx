import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";

interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
  totalSteps: number;
}

export default function CandidateDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/candidate/login");
      return;
    }

    // Fetch active jobs (public endpoint for candidates to see available interviews)
    api<Job[]>("/jobs?status=Active", { token })
      .then(setJobs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleJoinWithRoom = () => {
    if (roomId.trim()) {
      navigate(`/interview/${roomId.trim()}`);
    }
  };

  const handleJoinInterview = (jobId: string) => {
    navigate(`/interview/${jobId}`);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>Your interview dashboard</p>
        </div>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </header>

      {/* Join by Room ID */}
      <section className="card" style={{ marginBottom: "2rem" }}>
        <h2>Join Interview by Room ID</h2>
        <p>Enter the room ID provided in your invitation email</p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID..."
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            onClick={handleJoinWithRoom}
            disabled={!roomId.trim()}
          >
            Join Room
          </button>
        </div>
      </section>

      {/* Available Jobs */}
      <section>
        <h2>Available Interviews</h2>
        {loading ? (
          <p>Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-muted">No active interview slots available</p>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="card job-card">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <div className="job-meta">
                  <span className="badge">{job.totalSteps || 0} questions</span>
                  {job.skills?.map((skill) => (
                    <span key={skill} className="badge badge-outline">
                      {skill}
                    </span>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleJoinInterview(job._id)}
                  style={{ marginTop: "1rem" }}
                >
                  Join Interview
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
