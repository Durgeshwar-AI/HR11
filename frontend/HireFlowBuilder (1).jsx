import { useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   QUOTI-INSPIRED 3-COLOUR THEME
   Primary   → #E8521A  burnt orange  (CTA, accents, active)
   Secondary → #1A1A1A  near-black    (text, borders, structure)
   Tertiary  → #F5F0E8  warm cream    (background, surface)
   ═══════════════════════════════════════════════════════ */
const T = {
  primary:    "#E8521A",   // burnt orange — CTA, selected, drag handle, highlights
  secondary:  "#1A1A1A",   // near-black   — text, borders, structure, icons
  tertiary:   "#F5F0E8",   // warm cream   — page bg, card bg, light surfaces

  ink:        "#1A1A1A",
  inkLight:   "#5A5040",
  inkFaint:   "#B0A898",
  surface:    "#FFFFFF",
  surfaceAlt: "#EDE8DF",
  border:     "#D5CFC4",
  borderDark: "#1A1A1A",
};

/* ═══════════════════════════════════════════════════════
   FONTS — Barlow Condensed (brutal display) + DM Sans (body)
   ═══════════════════════════════════════════════════════ */
const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,900&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.tertiary}; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: ${T.surfaceAlt}; }
    ::-webkit-scrollbar-thumb { background: ${T.inkFaint}; border-radius: 3px; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(22px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes popIn {
      0%   { opacity:0; transform:scale(0.88) translateY(10px); }
      65%  { transform:scale(1.02); }
      100% { opacity:1; transform:scale(1); }
    }
    @keyframes slideIn {
      from { opacity:0; transform:translateX(-8px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }

    .fade-up  { animation: fadeUp 0.5s ease both; }
    .pop-in   { animation: popIn 0.32s cubic-bezier(.34,1.56,.64,1) both; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   ROUND DEFINITIONS
   ═══════════════════════════════════════════════════════ */
const ROUNDS = [
  { id:"resume_screening",    label:"Resume Screening",    icon:"📄", tag:"AI",           duration:"Instant",   agents:["Resume Parser","Bias Filter"] },
  { id:"aptitude_test",       label:"Aptitude Test",       icon:"🧠", tag:"Assessment",   duration:"30–45 min", agents:["Test Gen","Auto Grader"] },
  { id:"coding_challenge",    label:"Coding Challenge",    icon:"💻", tag:"Technical",    duration:"1–2 hrs",   agents:["Code Eval","Anti-Cheat"] },
  { id:"ai_voice_interview",  label:"AI Voice Interview",  icon:"🎙️", tag:"Vapi",         duration:"20–30 min", agents:["Voice AI","Sentiment AI"] },
  { id:"technical_interview", label:"Technical Interview", icon:"⚙️", tag:"Human",        duration:"45–60 min", agents:["Scheduler","Feedback Bot"] },
  { id:"hr_round",            label:"HR Round",            icon:"🤝", tag:"Human",        duration:"30 min",    agents:["HR Bot","Offer Gen"] },
  { id:"group_discussion",    label:"Group Discussion",    icon:"👥", tag:"Assessment",   duration:"45 min",    agents:["GD Mod","Leader Score"] },
  { id:"background_check",    label:"Background Check",    icon:"🔍", tag:"Verification", duration:"1–3 days",  agents:["Verify Bot","Risk AI"] },
  { id:"final_offer",         label:"Offer & Onboarding",  icon:"🎉", tag:"Closing",      duration:"Instant",   agents:["Offer Gen","Onboard Bot"] },
];

/* ═══════════════════════════════════════════════════════
   DRAG-AND-DROP HOOK
   ═══════════════════════════════════════════════════════ */
function useDragSort(setItems) {
  const draggingIdx = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const onDragStart = useCallback((e, idx) => {
    draggingIdx.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragEnter = useCallback((e, idx) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback((e, idx) => {
    e.preventDefault();
    const from = draggingIdx.current;
    if (from === null || from === idx) { setDragIdx(null); setOverIdx(null); return; }
    setItems(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      return next;
    });
    draggingIdx.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, [setItems]);

  const onDragEnd = useCallback(() => {
    draggingIdx.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }, []);

  return { onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd, dragIdx, overIdx };
}

/* ═══════════════════════════════════════════════════════
   CONNECTOR — thick orange tick-mark style
   ═══════════════════════════════════════════════════════ */
function Connector() {
  return (
    <div style={{
      display:"flex", flexDirection:"column", alignItems:"center",
      height:40, flexShrink:0,
    }}>
      <div style={{ width:2, flex:1, background:T.border }}/>
      <div style={{
        borderLeft:"5px solid transparent", borderRight:"5px solid transparent",
        borderTop:`7px solid ${T.border}`, marginTop:-1,
      }}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DRAG HANDLE — orange grip dots
   ═══════════════════════════════════════════════════════ */
function DragHandle({ active, visible }) {
  return (
    <div style={{
      display:"flex", flexDirection:"column", gap:3, padding:"3px 5px",
      cursor: active ? "grabbing" : "grab",
      opacity: visible ? 1 : 0.2,
      transition:"opacity 0.15s",
    }}>
      {[0,1,2].map(r => (
        <div key={r} style={{ display:"flex", gap:3 }}>
          {[0,1].map(c => (
            <div key={c} style={{
              width:3.5, height:3.5, borderRadius:"50%",
              background: active ? T.primary : T.primary,
              opacity: active ? 1 : 0.65,
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FLOW STEP CARD
   ═══════════════════════════════════════════════════════ */
function FlowCard({ round, index, isDragging, isOver, onRemove,
                    onDragStart, onDragEnter, onDragOver, onDrop, onDragEnd }) {
  const [hov, setHov] = useState(false);

  const borderColor = isDragging ? T.primary
                    : isOver     ? T.primary
                    : T.borderDark;

  const bgColor = isDragging ? "#FDF4EE"
                : isOver     ? "#FEF3EE"
                : T.surface;

  return (
    <div
      className="pop-in"
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragEnter={e => onDragEnter(e, index)}
      onDragOver={onDragOver}
      onDrop={e => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: bgColor,
        border:`2px solid ${borderColor}`,
        borderRadius:0,
        padding:"12px 14px",
        display:"flex", alignItems:"center", gap:10,
        transition:"all 0.14s ease",
        opacity: isDragging ? 0.4 : 1,
        boxShadow: isOver
          ? `4px 4px 0 ${T.primary}`
          : hov
          ? `4px 4px 0 ${T.secondary}`
          : "none",
        transform: isOver ? "translate(-2px,-2px)" : "translate(0,0)",
        cursor: isDragging ? "grabbing" : "default",
        width:"100%", userSelect:"none",
      }}
    >
      {/* Drag handle — PRIMARY orange */}
      <div style={{ opacity: hov || isDragging ? 1 : 0.25, transition:"opacity 0.15s" }}>
        <DragHandle active={isDragging} visible={hov || isDragging} />
      </div>

      {/* Step number — PRIMARY orange background */}
      <div style={{
        width:32, height:32, flexShrink:0,
        background: T.primary,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontFamily:"'Barlow Condensed', sans-serif",
        fontSize:14, fontWeight:900, color:"#fff",
        letterSpacing:"0.05em",
      }}>
        {String(index+1).padStart(2,"0")}
      </div>

      <span style={{ fontSize:20, flexShrink:0 }}>{round.icon}</span>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2, flexWrap:"wrap" }}>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:16,
            color: T.secondary, letterSpacing:"0.02em",
            textTransform:"uppercase",
          }}>{round.label}</span>
          {/* Tag — SECONDARY bordered pill */}
          <span style={{
            fontSize:9, fontFamily:"'DM Sans', sans-serif",
            fontWeight:600, letterSpacing:"0.12em",
            textTransform:"uppercase",
            color: T.inkLight,
            border:`1px solid ${T.border}`,
            padding:"2px 6px",
          }}>{round.tag}</span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:11, color: T.inkFaint, fontFamily:"'DM Sans', sans-serif" }}>
            ⏱ {round.duration}
          </span>
          {round.agents.map(a => (
            <span key={a} style={{
              fontSize:10, color: T.inkFaint,
              background: T.surfaceAlt,
              padding:"1px 6px",
              fontFamily:"'DM Sans', sans-serif",
            }}>{a}</span>
          ))}
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(round.id)}
        onMouseDown={e => e.stopPropagation()}
        style={{
          background:"transparent", border:`1px solid ${T.border}`,
          color: T.inkFaint, width:24, height:24,
          cursor:"pointer", fontSize:11, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          opacity: hov ? 1 : 0, transition:"opacity 0.15s",
          fontFamily:"'DM Sans', sans-serif",
        }}
      >✕</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   OPTION PILL (left panel)
   ═══════════════════════════════════════════════════════ */
function OptionPill({ round, selected, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={selected}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? T.surfaceAlt : hov ? "#FEF0E8" : T.surface,
        border:`2px solid ${selected ? T.border : hov ? T.primary : T.borderDark}`,
        borderRadius:0,
        padding:"10px 12px",
        cursor: selected ? "default" : "pointer",
        display:"flex", alignItems:"center", gap:10,
        transition:"all 0.14s",
        opacity: selected ? 0.45 : 1,
        textAlign:"left", width:"100%",
        boxShadow: hov && !selected ? `3px 3px 0 ${T.primary}` : "none",
        transform: hov && !selected ? "translate(-1px,-1px)" : "translate(0,0)",
      }}
    >
      <span style={{ fontSize:18, flexShrink:0 }}>{round.icon}</span>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:1 }}>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:15,
            color: selected ? T.inkFaint : T.secondary,
            textTransform:"uppercase", letterSpacing:"0.02em",
          }}>{round.label}</span>
          {selected && (
            <span style={{ fontSize:10, color: T.primary, fontFamily:"'DM Sans', sans-serif", fontWeight:600 }}>✓ ADDED</span>
          )}
        </div>
        <span style={{ fontSize:10, color: T.inkFaint, fontFamily:"'DM Sans', sans-serif" }}>{round.duration}</span>
      </div>
      {!selected && (
        <div style={{
          width:24, height:24,
          background: hov ? T.primary : T.secondary,
          color:"#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, fontWeight:700, flexShrink:0,
          transition:"background 0.14s",
          fontFamily:"'Barlow Condensed', sans-serif",
        }}>+</div>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════
   JSON PREVIEW
   ═══════════════════════════════════════════════════════ */
function JsonPreview({ pipeline, jobTitle }) {
  const [copied, setCopied] = useState(false);
  const payload = {
    job_title: jobTitle || "Untitled Position",
    pipeline_version:"1.0",
    created_at: new Date().toISOString(),
    total_rounds: pipeline.length,
    rounds: pipeline.map((r,i) => ({
      round_number: i+1, round_id: r.id, label: r.label,
      type: r.tag, estimated_duration: r.duration, agents_involved: r.agents,
    })),
  };
  const json = JSON.stringify(payload, null, 2);

  const hl = (text) =>
    text
      .replace(/("([^"]+)"\s*:)/g, `<span style="color:${T.primary};font-weight:600">$1</span>`)
      .replace(/:\s*"([^"]*)"/g,   `: <span style="color:${T.inkLight}">"$1"</span>`)
      .replace(/:\s*(\d+)/g,       `: <span style="color:${T.secondary};font-weight:600">$1</span>`)
      .replace(/[{}\[\],]/g,       `<span style="color:${T.inkFaint}">$&</span>`);

  return (
    <div style={{ background:T.surface, border:`2px solid ${T.secondary}`, borderRadius:0 }}>
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 16px", borderBottom:`2px solid ${T.secondary}`,
        background: T.secondary,
      }}>
        <span style={{
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
          fontSize:13, color:"#fff", letterSpacing:"0.15em", textTransform:"uppercase",
        }}>
          Backend Payload — pipeline.json
        </span>
        <button
          onClick={() => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
          style={{
            background: copied ? T.primary : "transparent",
            border:`1px solid ${copied ? T.primary : "#fff5"}`,
            color: "#fff", padding:"4px 12px",
            fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight:600,
            cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.05em",
          }}>
          {copied ? "✓ COPIED!" : "COPY"}
        </button>
      </div>
      <pre
        dangerouslySetInnerHTML={{ __html: hl(json) }}
        style={{
          padding:"16px", fontFamily:"'Courier New', monospace",
          fontSize:11, lineHeight:1.75, overflow:"auto", maxHeight:340,
          color: T.inkLight, background: T.surfaceAlt,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   RUNNING TICKER (Quoti-style marquee strip)
   ═══════════════════════════════════════════════════════ */
function Ticker() {
  const items = ["RESUME SCREENING", "CODING CHALLENGE", "AI VOICE INTERVIEW", "HR ROUND", "BACKGROUND CHECK", "OFFER & ONBOARDING"];
  const doubled = [...items, ...items];
  return (
    <div style={{
      background: T.secondary, overflow:"hidden",
      padding:"10px 0", borderTop:`1px solid ${T.borderDark}`,
      borderBottom:`1px solid ${T.borderDark}`,
      whiteSpace:"nowrap",
    }}>
      <div style={{ display:"inline-flex", animation:"marquee 18s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:900, fontSize:14,
            color:"#fff", letterSpacing:"0.15em",
            textTransform:"uppercase",
            marginRight:48,
          }}>
            {item}
            <span style={{ color: T.primary, marginLeft:48 }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function HireFlowBuilder() {
  const [pipeline,  setPipeline]  = useState([]);
  const [jobTitle,  setJobTitle]  = useState("");
  const [tab,       setTab]       = useState("builder");
  const [loading,   setLoading]   = useState(false);
  const flowRef = useRef(null);

  const selectedIds = pipeline.map(r => r.id);
  const drag = useDragSort(setPipeline);

  const addRound = (round) => {
    if (selectedIds.includes(round.id)) return;
    setPipeline(prev => [...prev, round]);
    setTimeout(() => flowRef.current?.scrollTo({ top: 9999, behavior:"smooth" }), 80);
  };

  const removeRound = (id) => setPipeline(prev => prev.filter(r => r.id !== id));

  const deploy = async () => {
    if (!jobTitle.trim() || pipeline.length === 0 || loading) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setTab("submitted");
  };

  const reset = () => { setPipeline([]); setJobTitle(""); setTab("builder"); };
  const canDeploy = jobTitle.trim() && pipeline.length > 0 && !loading;

  return (
    <div style={{ minHeight:"100vh", background:T.tertiary, color:T.secondary, fontFamily:"'DM Sans', sans-serif" }}>
      <Fonts />

      {/* ── NAV ──────────────────────────────────────── */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 40px", height:60,
        background:T.tertiary,
        borderBottom:`2px solid ${T.secondary}`,
      }}>
        <div style={{
          fontFamily:"'Barlow Condensed', sans-serif",
          fontWeight:900, fontSize:22,
          color:T.secondary, letterSpacing:"-0.01em",
          display:"flex", alignItems:"center", gap:4,
        }}>
          HIREFLOW
          <span style={{
            background:T.primary, color:"#fff",
            fontSize:10, fontWeight:800,
            padding:"2px 6px", letterSpacing:"0.1em",
            marginLeft:6, marginBottom:2, alignSelf:"flex-end",
          }}>AI</span>
        </div>
        <div style={{ display:"flex", gap:28, alignItems:"center" }}>
          {["Why HireFlow","How it works","Pricing"].map(l => (
            <span key={l} style={{
              fontFamily:"'DM Sans', sans-serif", fontWeight:500,
              fontSize:13, color: T.inkLight,
              cursor:"pointer", letterSpacing:"0.02em",
            }}>{l}</span>
          ))}
          <button style={{
            background:T.primary, color:"#fff",
            border:"none", padding:"9px 22px",
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:14, letterSpacing:"0.08em",
            textTransform:"uppercase", cursor:"pointer",
          }}>GET STARTED FREE</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <div className="fade-up" style={{
        padding:"56px 40px 40px",
        borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:40,
        flexWrap:"wrap",
      }}>
        <div>
          <p style={{
            fontFamily:"'DM Sans', sans-serif", fontWeight:500,
            fontSize:12, letterSpacing:"0.2em",
            textTransform:"uppercase", color:T.primary,
            marginBottom:12,
          }}>THE HIRING TOOL FOR MODERN TEAMS</p>
          <h1 style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:900, fontSize:"clamp(3rem,7vw,6rem)",
            lineHeight:0.9, letterSpacing:"-0.01em",
            textTransform:"uppercase", color:T.secondary,
          }}>
            BUILD YOUR<br />
            <span style={{ color:T.primary }}>PERFECT</span><br />
            PIPELINE
          </h1>
        </div>
        <p style={{
          maxWidth:340, fontSize:14, color:T.inkLight,
          lineHeight:1.65, fontWeight:400,
          borderLeft:`3px solid ${T.primary}`, paddingLeft:16,
        }}>
          Choose your rounds, drag to reorder, and deploy an end-to-end autonomous hiring flow in seconds. No back-and-forth. No manual screening.
        </p>
      </div>

      {/* ── TICKER ───────────────────────────────────── */}
      <Ticker />

      {/* ── DRAG HINT BAR ────────────────────────────── */}
      <div style={{
        background:"#FEF0E8",
        borderBottom:`1px solid ${T.border}`,
        padding:"8px 40px",
        display:"flex", alignItems:"center", gap:12,
        fontSize:12, color:T.inkLight,
      }}>
        <div style={{ display:"flex", gap:4 }}>
          {[0,1].map(c=>[0,1,2].map(r=>(
            <div key={`${r}${c}`} style={{ width:4, height:4, borderRadius:"50%", background:T.primary, margin:"1px" }}/>
          )))}
        </div>
        <span style={{ fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>
          Hold the <strong style={{ color:T.primary }}>orange grip dots</strong> on any step card to drag &amp; reorder your pipeline
        </span>
      </div>

      {/* ── BODY ─────────────────────────────────────── */}
      <div style={{ padding:"0 40px 80px" }}>

        {/* Job title + tabs row */}
        <div className="fade-up" style={{
          display:"flex", alignItems:"center", gap:16,
          padding:"24px 0 20px",
          borderBottom:`1px solid ${T.border}`,
          flexWrap:"wrap", gap:12,
          animationDelay:"0.05s",
        }}>
          <input
            type="text"
            placeholder="JOB TITLE — e.g. Senior Backend Engineer"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            style={{
              flex:1, minWidth:200,
              background:T.surface,
              border:`2px solid ${T.secondary}`,
              borderRadius:0, padding:"11px 14px",
              fontSize:13, color:T.secondary,
              fontFamily:"'Barlow Condensed', sans-serif",
              fontWeight:700, letterSpacing:"0.05em",
              textTransform:"uppercase",
              outline:"none", transition:"border-color 0.15s",
            }}
            onFocus={e => e.target.style.borderColor=T.primary}
            onBlur={e  => e.target.style.borderColor=T.secondary}
          />

          <div style={{ display:"flex", gap:0 }}>
            {[{ key:"builder", label:"BUILDER" }, { key:"json", label:"{ } JSON" }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: tab===t.key ? T.secondary : "transparent",
                border:`2px solid ${T.secondary}`,
                borderRight: t.key==="builder" ? "1px solid" : "2px solid",
                borderColor: T.secondary,
                color: tab===t.key ? "#fff" : T.secondary,
                padding:"10px 20px", fontSize:12,
                fontFamily:"'Barlow Condensed', sans-serif",
                fontWeight:800, letterSpacing:"0.1em",
                cursor:"pointer", transition:"all 0.14s",
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ── BUILDER VIEW ─────────────────────────── */}
        {tab==="builder" && (
          <div className="fade-up" style={{
            display:"grid", gridTemplateColumns:"1fr 1fr", gap:32,
            marginTop:28, alignItems:"start",
          }}>

            {/* LEFT — options */}
            <div>
              <div style={{
                display:"flex", alignItems:"center", gap:12, marginBottom:16,
              }}>
                <span style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:900, fontSize:12,
                  letterSpacing:"0.2em", color:T.inkFaint, textTransform:"uppercase",
                }}>Available Rounds</span>
                <div style={{ flex:1, height:2, background:T.secondary }}/>
                <span style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:800, fontSize:14,
                  color: T.primary,
                }}>{pipeline.length}/{ROUNDS.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {ROUNDS.map(r => (
                  <OptionPill key={r.id} round={r}
                    selected={selectedIds.includes(r.id)}
                    onClick={() => addRound(r)}
                  />
                ))}
              </div>
            </div>

            {/* RIGHT — pipeline flow */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <span style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:900, fontSize:12,
                  letterSpacing:"0.2em", color:T.inkFaint, textTransform:"uppercase",
                }}>Your Pipeline</span>
                <div style={{ flex:1, height:2, background:T.secondary }}/>
                {pipeline.length > 0 && (
                  <button onClick={() => setPipeline([])} style={{
                    background:"transparent", border:`1px solid ${T.border}`,
                    color:T.inkFaint, padding:"3px 10px",
                    fontSize:10, cursor:"pointer",
                    fontFamily:"'Barlow Condensed', sans-serif",
                    fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase",
                  }}>CLEAR ALL</button>
                )}
              </div>

              {pipeline.length === 0 && (
                <div style={{
                  border:`2px dashed ${T.border}`,
                  padding:"56px 20px", textAlign:"center",
                }}>
                  <div style={{
                    fontFamily:"'Barlow Condensed', sans-serif",
                    fontWeight:900, fontSize:28,
                    color:T.border, textTransform:"uppercase",
                    letterSpacing:"0.05em", marginBottom:8,
                  }}>NO ROUNDS YET</div>
                  <p style={{ color:T.inkFaint, fontSize:12 }}>
                    Select rounds from the left to build your pipeline
                  </p>
                </div>
              )}

              {pipeline.length > 0 && (
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <div style={{
                    background:T.secondary, color:"#fff",
                    fontFamily:"'Barlow Condensed', sans-serif",
                    fontWeight:800, fontSize:11,
                    letterSpacing:"0.18em", textTransform:"uppercase",
                    padding:"6px 18px",
                  }}>◉ JOB POSTED · CANDIDATE APPLIES</div>
                </div>
              )}

              <div ref={flowRef} style={{
                display:"flex", flexDirection:"column", alignItems:"center",
                maxHeight:580, overflowY:"auto", paddingBottom:4,
              }}>
                {pipeline.map((round, i) => (
                  <div key={round.id} style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <Connector />
                    <FlowCard
                      round={round} index={i}
                      isDragging={drag.dragIdx === i}
                      isOver={drag.overIdx === i && drag.dragIdx !== i}
                      onRemove={removeRound}
                      onDragStart={drag.onDragStart}
                      onDragEnter={drag.onDragEnter}
                      onDragOver={drag.onDragOver}
                      onDrop={drag.onDrop}
                      onDragEnd={drag.onDragEnd}
                    />
                  </div>
                ))}

                {pipeline.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <Connector />
                    <div style={{
                      background:T.primary, color:"#fff",
                      fontFamily:"'Barlow Condensed', sans-serif",
                      fontWeight:800, fontSize:11,
                      letterSpacing:"0.18em", textTransform:"uppercase",
                      padding:"6px 18px",
                    }}>✓ HIRE DECISION</div>
                  </div>
                )}
              </div>

              {pipeline.length > 0 && (
                <>
                  <button
                    onClick={deploy} disabled={!canDeploy}
                    style={{
                      marginTop:24, width:"100%", padding:"16px",
                      background: canDeploy ? T.primary : T.surfaceAlt,
                      border:`2px solid ${canDeploy ? T.primary : T.border}`,
                      borderRadius:0,
                      color: canDeploy ? "#fff" : T.inkFaint,
                      fontSize:16,
                      fontFamily:"'Barlow Condensed', sans-serif",
                      fontWeight:900, letterSpacing:"0.12em",
                      textTransform:"uppercase",
                      cursor: canDeploy ? "pointer" : "not-allowed",
                      transition:"all 0.15s",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    }}
                    onMouseEnter={e => { if(canDeploy) { e.currentTarget.style.background=T.secondary; e.currentTarget.style.borderColor=T.secondary; } }}
                    onMouseLeave={e => { if(canDeploy) { e.currentTarget.style.background=T.primary; e.currentTarget.style.borderColor=T.primary; } }}
                  >
                    {loading
                      ? <><span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>⟳</span> DEPLOYING…</>
                      : "🚀 DEPLOY PIPELINE TO BACKEND"
                    }
                  </button>
                  {!jobTitle.trim() && (
                    <p style={{ textAlign:"center", fontSize:11, color:T.inkFaint, marginTop:8, fontFamily:"'DM Sans', sans-serif" }}>
                      Enter a job title above to enable deploy
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── JSON VIEW ─────────────────────────────── */}
        {tab==="json" && (
          <div className="fade-up" style={{ maxWidth:740, marginTop:28 }}>
            {pipeline.length === 0
              ? <div style={{ border:`2px dashed ${T.border}`, padding:"56px", textAlign:"center" }}>
                  <span style={{
                    fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900,
                    fontSize:22, color:T.border, textTransform:"uppercase", letterSpacing:"0.1em",
                  }}>Build a pipeline first</span>
                </div>
              : <JsonPreview pipeline={pipeline} jobTitle={jobTitle} />
            }
          </div>
        )}

        {/* ── SUCCESS VIEW ──────────────────────────── */}
        {tab==="submitted" && (
          <div className="fade-up" style={{ maxWidth:620, marginTop:40 }}>
            <div style={{
              border:`2px solid ${T.secondary}`,
              background:T.surface,
              boxShadow:`6px 6px 0 ${T.primary}`,
            }}>
              {/* Orange header bar */}
              <div style={{
                background:T.primary, padding:"20px 28px",
              }}>
                <div style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:900, fontSize:28,
                  color:"#fff", letterSpacing:"-0.01em",
                  textTransform:"uppercase",
                }}>PIPELINE DEPLOYED ✓</div>
                <p style={{ color:"rgba(255,255,255,0.8)", fontSize:12, marginTop:4, fontFamily:"'DM Sans', sans-serif" }}>
                  {jobTitle} · {pipeline.length} rounds configured
                </p>
              </div>

              {/* Steps list */}
              <div style={{ padding:"20px 28px" }}>
                {pipeline.map((r,i) => (
                  <div key={r.id} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0",
                    borderBottom:`1px solid ${T.border}`,
                  }}>
                    <div style={{
                      width:28, height:28, background:T.primary,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily:"'Barlow Condensed', sans-serif",
                      fontWeight:900, fontSize:13, color:"#fff",
                    }}>{String(i+1).padStart(2,"0")}</div>
                    <span style={{ fontSize:18 }}>{r.icon}</span>
                    <span style={{
                      fontFamily:"'Barlow Condensed', sans-serif",
                      fontWeight:800, fontSize:15,
                      color:T.secondary, textTransform:"uppercase", flex:1,
                    }}>{r.label}</span>
                    <span style={{
                      fontSize:11, color:T.inkFaint,
                      fontFamily:"'DM Sans', sans-serif",
                    }}>{r.duration}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding:"16px 28px 24px", display:"flex", gap:12 }}>
                <button onClick={reset} style={{
                  background:"transparent",
                  border:`2px solid ${T.secondary}`,
                  color:T.secondary, padding:"10px 22px",
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:800, fontSize:13,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                  cursor:"pointer",
                }}>← BUILD ANOTHER</button>
                <button onClick={() => setTab("json")} style={{
                  background:T.secondary,
                  border:`2px solid ${T.secondary}`,
                  color:"#fff", padding:"10px 22px",
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontWeight:800, fontSize:13,
                  letterSpacing:"0.08em", textTransform:"uppercase",
                  cursor:"pointer",
                }}>VIEW JSON {"{ }"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
