import { useState } from "react";

// Auth
import { CompanyLogin, CompanyRegister, CandidateLogin, CandidateRegister } from "./pages/auth/AuthPages";
// Company
import { CompanyDashboard } from "./pages/company/CompanyDashboard";
import { HiringLeaderboard } from "./pages/company/HiringLeaderboard";
import { PipelineBuilder } from "./pages/company/PipelineBuilder";
// Candidate
import { CandidateProfile } from "./pages/candidate/CandidateProfile";
// Interview
import { InterviewEntryPage } from "./pages/interview/InterviewEntryPage";
import { InterviewPage } from "./pages/interview/InterviewPage";
// Public
import { WhyHR11Page } from "./pages/public/WhyHR11Page";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";

const ROUTES: Record<string, any> = {
  home: null,
  why: WhyHR11Page,
  how: HowItWorksPage,
  "login-company": CompanyLogin,
  "register-company": CompanyRegister,
  "login-candidate": CandidateLogin,
  "register-candidate": CandidateRegister,
  dashboard: CompanyDashboard,
  leaderboard: HiringLeaderboard,
  pipeline: PipelineBuilder,
  "candidate-profile": CandidateProfile,
  "interview-entry": InterviewEntryPage,
  interview: InterviewPage,
};

export default function App() {
  const [page, setPage] = useState("why");

  const navigate = (key: string) => {
    if (key === "home") { setPage("why"); return; }
    if (ROUTES[key] !== undefined) setPage(key);
    else console.warn(`[HR11 Router] Unknown route: "${key}"`);
  };

  const PageComponent = ROUTES[page] || WhyHR11Page;

  return <PageComponent onNavigate={navigate} />;
}
