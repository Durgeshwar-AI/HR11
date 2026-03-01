import {
  CompanyLogin,
  CompanyRegister,
  CandidateLogin,
  CandidateRegister,
} from "./pages/auth/AuthPages";
// Company
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { HiringLeaderboard } from "./pages/company/HiringLeaderboard";
import { PipelineBuilder } from "./pages/company/PipelineBuilder";
// Candidate
import { CandidateProfile } from "./pages/candidate/CandidateProfile";
import { RecentOpenings } from "./pages/candidate/RecentOpenings";
// Interview
import { InterviewEntryPage } from "./pages/interview/InterviewEntryPage";
import { InterviewPage } from "./pages/interview/InterviewPage";
// Rounds
import { ResumeScreeningRound } from "./pages/rounds/ResumeScreeningRound";
import { AptitudeTestRound } from "./pages/rounds/AptitudeTestRound";
import { CodingChallengeRound } from "./pages/rounds/CodingChallengeRound";
import { AIInterviewRound } from "./pages/rounds/AIInterviewRound";
import { TechnicalInterviewRound } from "./pages/rounds/TechnicalInterviewRound";
// Public
import { WhyPromptHirePage } from "./pages/public/WhyHR11Page";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { RoleChoice } from "./pages/public/RoleChoice.tsx";
import { CandidateHome } from "./pages/public/CandidateHome.tsx";
import { CompanyHome } from "./pages/public/CompanyHome.tsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<RoleChoice />} />
        <Route path="/why-prompthire" element={<WhyPromptHirePage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/company-home" element={<CompanyHome />} />
        <Route path="/candidate-home" element={<CandidateHome />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/company-register" element={<CompanyRegister />} />
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/candidate-register" element={<CandidateRegister />} />

        {/* ── Company (HR) ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="hr">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute role="hr">
              <HiringLeaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute role="hr">
              <PipelineBuilder />
            </ProtectedRoute>
          }
        />

        {/* ── Candidate ── */}
        <Route
          path="/candidate-profile"
          element={
            <ProtectedRoute role="candidate">
              <CandidateProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent-openings"
          element={
            <ProtectedRoute role="candidate">
              <RecentOpenings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-entry"
          element={
            <ProtectedRoute role="candidate">
              <InterviewEntryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute role="candidate">
              <InterviewPage />
            </ProtectedRoute>
          }
        />

        {/* ── Round pages (candidate) ── */}
        <Route
          path="/round/resume-screening"
          element={
            <ProtectedRoute role="candidate">
              <ResumeScreeningRound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/round/aptitude-test"
          element={
            <ProtectedRoute role="candidate">
              <AptitudeTestRound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/round/coding-challenge"
          element={
            <ProtectedRoute role="candidate">
              <CodingChallengeRound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/round/ai-interview"
          element={
            <ProtectedRoute role="candidate">
              <AIInterviewRound />
            </ProtectedRoute>
          }
        />
        <Route
          path="/round/technical-interview"
          element={
            <ProtectedRoute role="candidate">
              <TechnicalInterviewRound />
            </ProtectedRoute>
          }
        />

        {/* catch-all → role selection */}
        <Route path="*" element={<RoleChoice />} />
      </Routes>
    </BrowserRouter>
  );
}
