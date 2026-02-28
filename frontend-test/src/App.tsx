import { useState } from "react";

// Auth
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
// Interview
import { InterviewEntryPage } from "./pages/interview/InterviewEntryPage";
import { InterviewPage } from "./pages/interview/InterviewPage";
// Public
import { WhyHR11Page } from "./pages/public/WhyHR11Page";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { RoleChoice } from "./pages/public/RoleChoice.tsx";
import { CandidateHome } from "./pages/public/CandidateHome.tsx";
import { CompanyHome } from "./pages/public/CompanyHome.tsx";

import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

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
      </Routes>
    </BrowserRouter>
  );
}