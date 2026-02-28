import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CandidateLogin from "./pages/CandidateLogin";
import CandidateRegister from "./pages/CandidateRegister";
import CandidateDashboard from "./pages/CandidateDashboard";
import InterviewRoom from "./pages/InterviewRoom";
import HRLogin from "./pages/HRLogin";
import HRRegister from "./pages/HRRegister";
import HRDashboard from "./pages/HRDashboard";
import HRJobBuilder from "./pages/HRJobBuilder";
import HRInterviewReport from "./pages/HRInterviewReport";
import HRLeaderboard from "./pages/HRLeaderboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ─────────────────────────────── */}
        <Route path="/" element={<Navigate to="/candidate/login" />} />

        {/* ── Candidate ──────────────────────────── */}
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/interview/:roomId" element={<InterviewRoom />} />

        {/* ── HR ─────────────────────────────────── */}
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/register" element={<HRRegister />} />
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/jobs/:jobId" element={<HRJobBuilder />} />
        <Route path="/hr/interviews/:id" element={<HRInterviewReport />} />
        <Route path="/hr/jobs/:jobId/leaderboard" element={<HRLeaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
