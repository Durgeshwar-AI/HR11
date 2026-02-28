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
import { WhyHR11Page } from "./pages/public/WhyHR11Page";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { RoleChoice } from "./pages/public/RoleChoice.tsx";
import { CandidateHome } from "./pages/public/CandidateHome.tsx";
import { CompanyHome } from "./pages/public/CompanyHome.tsx";

import {BrowserRouter, Routes, Route} from "react-router-dom";

export default function App() {


  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<RoleChoice />} />
        <Route path="/why-hr11" element={<WhyHR11Page />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/company-home" element={<CompanyHome />} />
        <Route path="/candidate-home" element={<CandidateHome />} />
        <Route path="/company-login" element={<CompanyLogin />} />
        <Route path="/company-register" element={<CompanyRegister />} />
        <Route path="/candidate-login" element={<CandidateLogin />} />
        <Route path="/candidate-register" element={<CandidateRegister />} />
        {/* App pages */}
        <Route path="/dashboard" element={<CompanyDashboard />} />
        <Route path="/leaderboard" element={<HiringLeaderboard />} />
        <Route path="/pipeline" element={<PipelineBuilder />} />
        <Route path="/candidate-profile" element={<CandidateProfile />} />
        <Route path="/recent-openings" element={<RecentOpenings />} />
        <Route path="/interview-entry" element={<InterviewEntryPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        {/* Round pages */}
        <Route path="/round/resume-screening" element={<ResumeScreeningRound />} />
        <Route path="/round/aptitude-test" element={<AptitudeTestRound />} />
        <Route path="/round/coding-challenge" element={<CodingChallengeRound />} />
        <Route path="/round/ai-interview" element={<AIInterviewRound />} />
        <Route path="/round/technical-interview" element={<TechnicalInterviewRound />} />
        {/* catch-all -> home */}
        <Route path="*" element={<RoleChoice />} />
      </Routes>
    </BrowserRouter>
  );
}