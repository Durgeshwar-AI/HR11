import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStoredUser,
  saveAuth,
  clearAuth,
  candidateApi,
  type CandidateMe,
  type MyApplication,
} from "../../services/api";
import { Card, SectionLabel, Divider } from "../../assets/components/shared/Card";
import { Btn } from "../../assets/components/shared/Btn";
import { Tag } from "../../assets/components/shared/Badges";
import { Avatar } from "../../assets/components/shared/Avatar";
import { initJobPipeline } from "../../services/pipeline";

/* ------------------------------------------------------------------ */
/*  Stage-type → path mapping for "Continue" buttons                   */
/* ------------------------------------------------------------------ */
const STAGE_PATHS: Record<string, string> = {
  resume_screening: "/round/resume-screening",
  aptitude_test: "/round/aptitude-test",
  coding_challenge: "/round/coding-challenge",
  ai_voice_interview: "/interview-entry",
  technical_interview: "/round/technical-interview",
};

const STAGE_ICONS: Record<string, string> = {
  resume_screening: "",
  aptitude_test: "",
  coding_challenge: "",
  ai_voice_interview: "",
  technical_interview: "",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CandidateProfile() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  /* ── Backend state ─────────────────────────────────────── */
  const [profile, setProfile] = useState<CandidateMe | null>(null);
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  /* ── Editable fields ────────────────────────────────────── */
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  /* ── Derived user info (fallback to localStorage until API loads) */
  const displayName = editName || profile?.name || (typeof storedUser?.name === "string" ? storedUser.name : "Candidate");
  const email = profile?.email ?? (typeof storedUser?.email === "string" ? storedUser.email : "");
  const role = typeof storedUser?.role === "string" && storedUser.role !== "candidate" ? storedUser.role : "Job Seeker";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  /* ── Avatar file (local preview only) ───────────────────── */
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  /* ── Skills ─────────────────────────────────────────────── */
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 8) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  /* ── Resume state ───────────────────────────────────────── */
  const resumeRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const handleResume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  /* ── Fetch profile + applications from backend ─────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, apps] = await Promise.all([
        candidateApi.me().catch(() => null),
        candidateApi.myApplications().catch(() => ({ applications: [] })),
      ]);
      if (me) {
        setProfile(me);
        setEditName(me.name);
        setEditPhone(me.phone || "");
        if (me.skills.length > 0) setSkills(me.skills);
      }
      setApplications(apps.applications);

      // Store each job's pipeline in localStorage so round pages
      // can look up the correct next-round navigation.
      apps.applications.forEach((app: MyApplication) => {
        if (app.pipeline?.length) {
          initJobPipeline(app.jobId, app.pipeline);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Save profile to backend ───────────────────────────── */
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      // 1. Upload resume if a new file was selected
      if (resumeFile) {
        const uploadRes = await candidateApi.uploadResume(resumeFile);
        // Update local profile state with new URL immediately
        setProfile((prev) => prev ? { ...prev, resumeUrl: uploadRes.resumeUrl } : prev);
        setResumeFile(null);
        if (resumeRef.current) resumeRef.current.value = "";
      }

      // 2. Save text fields
      const updated = await candidateApi.updateProfile({
        name: editName.trim() || undefined,
        phone: editPhone.trim(),
        skills,
      });
      setProfile(updated);
      // Sync localStorage user name
      const stored = getStoredUser();
      if (stored) {
        saveAuth(localStorage.getItem("prompthire_token") || "", { ...stored, name: updated.name });
      }
      setSaveMsg("Profile saved!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* Sign out */
  const handleSignOut = () => {
    clearAuth();
    navigate("/");
  };

  /* ── Helpers for application cards ─────────────────────── */
  const getNextRound = (app: MyApplication) => {
    if (!app.progress) return null;
    const next = app.progress.rounds.find((r) => r.status === "Pending" || r.status === "InProgress");
    return next || null;
  };

  const getCompletedCount = (app: MyApplication) => {
    if (!app.progress) return 0;
    return app.progress.rounds.filter((r) => r.status === "Completed").length;
  };

  const getRoundPath = (app: MyApplication, round: { stageType: string | null }) => {
    const base = STAGE_PATHS[round.stageType || ""] || "/recent-openings";
    return `${base}?jobId=${app.jobId}`;
  };

  /* ────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-tertiary">
      {/* ── Top Nav ──────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-10 h-[60px] bg-tertiary border-b-2 border-secondary sticky top-0 z-30">
        <div
          onClick={() => navigate("/")}
          className="font-display font-black text-xl text-secondary cursor-pointer select-none"
        >
          Prompt<span className="text-primary">Hire</span>
          <span className="bg-primary text-white text-[8px] px-1.5 py-px ml-1.5">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Btn size="sm" variant="ghost" onClick={() => navigate("/recent-openings")}>
            Browse Jobs
          </Btn>
          <Btn size="sm" variant="secondary" onClick={handleSignOut}>
            Sign Out
          </Btn>
        </div>
      </nav>

      <div className="max-w-[1020px] mx-auto py-9 px-6">
        {/* ── Loading state ─────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {/* ── Error state ───────────────────────────────────── */}
        {error && !loading && (
          <div className="text-center py-10">
            <div className="text-4xl mb-3"></div>
            <p className="font-body text-sm text-danger mb-3">{error}</p>
            <Btn size="sm" onClick={fetchData}>Retry</Btn>
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-[300px_1fr] gap-6 items-start fade-up">
            {/* ── Left Column: Photo + Info ───────────────────── */}
            <div className="flex flex-col gap-4">
              {/* Photo + Name Card */}
              <Card>
                <div className="p-7 flex flex-col items-center text-center">
                  <div
                    className="relative group cursor-pointer mb-4"
                    onClick={() => fileRef.current?.click()}
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt={displayName} className="w-[80px] h-[80px] object-cover border-2 border-secondary" />
                    ) : (
                      <Avatar initials={initials} size={80} />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="text-white text-[10px] font-display font-extrabold tracking-[0.1em] uppercase">Change</span>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>

                  {/* Editable name */}
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your name"
                    className="w-full text-center font-display font-black text-xl uppercase text-secondary bg-transparent border-b-2 border-transparent hover:border-border-clr focus:border-primary outline-none transition mb-1 px-1 py-0.5"
                  />
                  <div className="font-body text-[13px] text-primary font-semibold mb-1">{role}</div>

                  {email && (
                    <>
                      <Divider />
                      <div className="mt-3 flex gap-2 items-center">
                        <span className="text-sm"></span>
                        <span className="font-body text-xs text-ink-light">{email}</span>
                      </div>
                    </>
                  )}

                  {/* Editable phone */}
                  <div className="mt-2 flex gap-2 items-center w-full">
                    <span className="text-sm"></span>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                      className="flex-1 text-xs font-body text-ink-light bg-transparent border-b border-transparent hover:border-border-clr focus:border-primary outline-none transition px-1 py-0.5"
                    />
                  </div>

                  {/* Save button */}
                  <div className="mt-4 w-full">
                    <Btn fullWidth size="sm" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? "Saving…" : " Save Profile"}
                    </Btn>
                    {saveMsg && (
                      <p className={`font-body text-[11px] mt-1.5 ${saveMsg.includes("saved") ? "text-[#1A8917]" : "text-danger"}`}>
                        {saveMsg}
                      </p>
                    )}
                  </div>

                  {/* ── Stats ── */}
                  <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                    <div className="bg-surface-alt border border-border-clr p-3 text-center">
                      <div className="font-display font-black text-2xl text-primary">{applications.length}</div>
                      <div className="font-body text-[10px] text-ink-faint uppercase tracking-wider">Applications</div>
                    </div>
                    <div className="bg-surface-alt border border-border-clr p-3 text-center">
                      <div className="font-display font-black text-2xl text-[#1A8917]">
                        {applications.filter((a) => a.progress?.status === "Completed").length}
                      </div>
                      <div className="font-body text-[10px] text-ink-faint uppercase tracking-wider">Completed</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* ── Skills ──────────────────────────────────── */}
              <Card>
                <div className="p-5">
                  <SectionLabel>Skills</SectionLabel>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {skills.map((s) => (
                      <span key={s} className="group inline-flex items-center gap-1.5">
                        <Tag>{s}</Tag>
                        <button onClick={() => removeSkill(s)} className="text-ink-faint hover:text-danger transition font-bold text-xs leading-none">×</button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <p className="text-[11px] text-ink-faint font-body">No skills yet. Add some below.</p>
                    )}
                  </div>
                  {skills.length < 8 && (
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add a skill…"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        className="flex-1 text-xs font-body border-2 border-secondary rounded-none px-3 py-1.5 bg-surface text-secondary placeholder:text-ink-faint focus:outline-none focus:border-primary transition"
                      />
                      <Btn size="sm" onClick={addSkill}>Add</Btn>
                    </div>
                  )}
                </div>
              </Card>

              {/* ── Resume ──────────────────────────────────── */}
              <Card>
                <div className="p-5">
                  <SectionLabel>Resume</SectionLabel>

                  {/* Show saved resume from backend URL */}
                  {profile?.resumeUrl ? (
                    <div className="flex flex-col items-center text-center mt-3">
                      <div className="text-[40px] mb-2"></div>
                      <div className="font-display font-black text-sm uppercase text-secondary mb-1">Resume Uploaded</div>
                      <a
                        href={profile.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-xs text-primary underline hover:text-primary/80 transition"
                      >
                        View Resume ↗
                      </a>
                      <div className="flex gap-2 mt-3">
                        <Btn size="sm" onClick={() => resumeRef.current?.click()}>Replace</Btn>
                      </div>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex flex-col items-center text-center mt-3">
                      <div className="text-[40px] mb-2"></div>
                      <div className="font-display font-black text-sm uppercase text-secondary">{resumeFile.name}</div>
                      <p className="font-body text-[10px] text-ink-faint mt-1">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                      <div className="flex gap-2 mt-3">
                        <Btn variant="secondary" size="sm" onClick={() => { setResumeFile(null); if (resumeRef.current) resumeRef.current.value = ""; }}>Remove</Btn>
                        <Btn size="sm" onClick={() => resumeRef.current?.click()}>Replace</Btn>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-border-clr p-6 text-center cursor-pointer hover:border-primary hover:bg-surface-warm transition mt-3"
                      onClick={() => resumeRef.current?.click()}
                    >
                      <div className="text-[40px] mb-2"></div>
                      <div className="font-display font-black text-xs uppercase text-secondary mb-1">Upload Resume</div>
                      <p className="font-body text-[10px] text-ink-faint">PDF, DOC, or DOCX · Max 5MB</p>
                    </div>
                  )}
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResume} />

                  {profile?.resumeSummary && (
                    <div className="mt-4 bg-surface-alt border border-border-clr p-3">
                      <div className="font-display font-extrabold text-[10px] tracking-[0.12em] uppercase text-ink-faint mb-1">AI Summary</div>
                      <p className="font-body text-xs text-ink-light leading-relaxed">{profile.resumeSummary}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* ── Right Column: Applications + Quick Actions ─── */}
            <div className="flex flex-col gap-4">
              {/* ── My Applications ─────────────────────────── */}
              <Card>
                <div className="bg-secondary px-5 py-3 flex items-center justify-between">
                  <span className="font-display font-extrabold text-xs text-white tracking-[0.15em] uppercase">
                    My Applications
                  </span>
                  <span className="font-display font-black text-xs text-primary">
                    {applications.length}
                  </span>
                </div>
                <div className="p-5">
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-[48px] mb-3"></div>
                      <div className="font-display font-extrabold text-sm uppercase text-secondary mb-1">No Applications Yet</div>
                      <p className="font-body text-xs text-ink-faint mb-4">Browse openings and apply to get started.</p>
                      <Btn size="sm" onClick={() => navigate("/recent-openings")}>Browse Openings →</Btn>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {applications.map((app, appIndex) => {
                        const completed = getCompletedCount(app);
                        const total = app.totalRounds || app.progress?.rounds.length || 0;
                        const nextRound = getNextRound(app);
                        const allDone = app.progress?.status === "Completed";
                        const pct = total > 0 ? (completed / total) * 100 : 0;

                        return (
                          <div key={`${app.jobId}-${app.appliedAt}-${appIndex}`} className="border-2 border-secondary bg-surface p-4">
                            {/* Job header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="font-display font-black text-base uppercase text-secondary leading-tight">
                                  {app.jobTitle}
                                </div>
                                <div className="font-body text-[11px] text-ink-faint mt-0.5">
                                  Applied {new Date(app.appliedAt).toLocaleDateString()}
                                  {app.screeningScore !== null && (
                                    <> · Screening: <strong className="text-primary">{app.screeningScore}%</strong></>
                                  )}
                                </div>
                              </div>
                              <div className={[
                                "px-2 py-0.5 font-display font-extrabold text-[9px] tracking-[0.1em] uppercase border",
                                allDone
                                  ? "border-[#1A8917] text-[#1A8917] bg-[#f0fdf0]"
                                  : app.screeningStatus === "rejected"
                                    ? "border-red-400 text-red-600 bg-red-50"
                                    : "border-primary text-primary bg-primary/[0.06]",
                              ].join(" ")}>
                                {allDone ? "Completed" : app.screeningStatus === "rejected" ? "Rejected" : "In Progress"}
                              </div>
                            </div>

                            {/* Skills */}
                            {app.jobSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {app.jobSkills.slice(0, 5).map((s) => (
                                  <Tag key={s}>{s}</Tag>
                                ))}
                              </div>
                            )}

                            {/* Pipeline rounds */}
                            {app.progress && app.progress.rounds.length > 0 && (
                              <div className="mb-3">
                                <div className="flex gap-1 items-center">
                                  {app.progress.rounds.map((round, idx) => {
                                    const isComp = round.status === "Completed";
                                    const isActive = round.status === "InProgress" || round.status === "Pending";
                                    const icon = STAGE_ICONS[round.stageType || ""] || "";
                                    return (
                                      <div key={idx} className="flex items-center">
                                        <div
                                          title={round.roundName || `Round ${round.roundNumber}`}
                                          className={[
                                            "w-8 h-8 flex items-center justify-center text-sm border-2 transition-all",
                                            isComp
                                              ? "bg-[#1A8917] border-[#1A8917] text-white"
                                              : isActive
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-surface-alt border-border-clr text-ink-faint opacity-50",
                                          ].join(" ")}
                                        >
                                          {isComp ? "" : icon}
                                        </div>
                                        {idx < app.progress!.rounds.length - 1 && (
                                          <div className={["w-4 h-0.5 shrink-0", isComp ? "bg-[#1A8917]" : "bg-border-clr"].join(" ")} />
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Progress bar */}
                                <div className="mt-2">
                                  <div className="flex justify-between text-[9px] font-display font-bold uppercase tracking-[0.1em] text-ink-faint mb-0.5">
                                    <span>{completed}/{total} rounds</span>
                                    {app.progress!.candidateScore != null && <span>Score: {app.progress!.candidateScore}</span>}
                                  </div>
                                  <div className="h-1.5 bg-surface-alt border border-border-clr">
                                    <div
                                      className={["h-full transition-all duration-500", allDone ? "bg-[#1A8917]" : "bg-primary"].join(" ")}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* CTA */}
                            {!allDone && nextRound && app.screeningStatus !== "rejected" && (
                              <Btn
                                fullWidth
                                size="sm"
                                onClick={() => navigate(getRoundPath(app, nextRound))}
                              >
                                Continue: {nextRound.roundName || `Round ${nextRound.roundNumber}`} →
                              </Btn>
                            )}
                            {allDone && (
                              <div className="bg-[#f0fdf0] border border-[#1A8917]/30 p-2.5 text-center">
                                <span className="font-display font-extrabold text-xs text-[#1A8917] uppercase">
                                   All Rounds Complete — Results Under Review
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <div className="p-5 flex flex-col gap-3">
                  <SectionLabel>Quick Actions</SectionLabel>
                  <Btn fullWidth onClick={() => navigate("/recent-openings")}>
                    Browse Open Positions →
                  </Btn>
                  {applications.length > 0 && (
                    <Btn fullWidth variant="secondary" onClick={fetchData}>
                       Refresh My Applications
                    </Btn>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
