import { useState } from "react";
import { GlobalStyles }       from "../../frontend-test/src/theme/GlobalStyles";

// Auth
import { CompanyLogin, CompanyRegister, CandidateLogin, CandidateRegister } from "../../frontend-test/src/pages/auth/AuthPages";
// Company
import { CompanyDashboard }  from "../../frontend-test/src/pages/company/CompanyDashboard";
import { HiringLeaderboard } from "../../frontend-test/src/pages/company/HiringLeaderboard";
import { PipelineBuilder }   from "../../frontend-test/src/pages/company/PipelineBuilder";
// Candidate
import { CandidateProfile }  from "../../frontend-test/src/pages/candidate/CandidateProfile";
// Interview
import { InterviewEntryPage } from "../../frontend-test/src/pages/interview/InterviewEntryPage";
import { InterviewPage }      from "../../frontend-test/src/pages/interview/InterviewPage";
// Public
import { WhyHR11Page }       from "../../frontend-test/src/pages/public/WhyHR11Page";
import { HowItWorksPage }    from "../../frontend-test/src/pages/public/HowItWorksPage";

/**
 * ROUTE MAP
 * key → component
 * All navigation is handled by onNavigate(key)
 */
const ROUTES = {
  // ── Public ──────────────────────────────────────
  "home":               null,           // → default landing (redirect to why)
  "why":                WhyHR11Page,
  "how":                HowItWorksPage,

  // ── Auth ────────────────────────────────────────
  "login-company":      CompanyLogin,
  "register-company":   CompanyRegister,
  "login-candidate":    CandidateLogin,
  "register-candidate": CandidateRegister,

  // ── Company / HR ────────────────────────────────
  "dashboard":          CompanyDashboard,
  "leaderboard":        HiringLeaderboard,
  "pipeline":           PipelineBuilder,

  // ── Candidate ───────────────────────────────────
  "candidate-profile":  CandidateProfile,

  // ── Interview ───────────────────────────────────
  "interview-entry":    InterviewEntryPage,
  "interview":          InterviewPage,
};

/**
 * App
 * Lightweight client-side router.
 * Replace with React Router or Next.js routing for production.
 *
 * Usage:
 *   Any component receives onNavigate as a prop.
 *   Call onNavigate("dashboard") to switch pages.
 */
export default function App() {
  const [page, setPage] = useState("why");

  const navigate = (key) => {
    if (key === "home") { setPage("why"); return; }
    if (ROUTES[key] !== undefined) setPage(key);
    else console.warn(`[HR11 Router] Unknown route: "${key}"`);
  };

  const PageComponent = ROUTES[page] || WhyHR11Page;

  return (
    <>
      <GlobalStyles />
      <PageComponent onNavigate={navigate} />
    </>
  );
}
