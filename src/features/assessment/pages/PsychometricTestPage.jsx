import { useState } from "react";
import { quickPsychometricQuestions } from "../../../data/careermapData";
import { PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

const css = `
.psycho-wrap { --brand:#9a2119; --brand-bg:rgba(154,33,25,0.06); --brand-border:rgba(154,33,25,0.14); font-family:var(--font-sans,sans-serif); }

/* Progress header */
.prog-header { background:var(--brand-bg); border:0.5px solid var(--brand-border); border-radius:12px; padding:14px 16px; }
.prog-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.prog-step { font-size:13px; font-weight:500; color:var(--brand); }
.prog-badge { font-size:11px; background:rgba(154,33,25,0.10); color:var(--brand); border-radius:99px; padding:3px 10px; }
.prog-track { height:4px; background:rgba(154,33,25,0.12); border-radius:99px; overflow:hidden; margin-bottom:10px; }
.prog-fill { height:100%; background:var(--brand); border-radius:99px; transition:width .3s ease; }
.prog-hint { font-size:12px; color:var(--color-text-tertiary,#888); margin:0; line-height:1.5; }

/* Question card */
.q-card { background:var(--color-background-primary,#fff); border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.1)); border-radius:12px; overflow:hidden; }
.q-card-head { padding:16px 18px; border-bottom:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.08)); }
.q-card-text { font-size:15px; font-weight:500; color:var(--color-text-primary,#111); margin:0; line-height:1.5; }
.q-card-body { padding:14px 18px; display:flex; flex-direction:column; gap:8px; }

/* Option buttons */
.opt-btn { display:flex; align-items:center; gap:10px; width:100%; padding:11px 14px; border-radius:10px; border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.1)); background:var(--color-background-primary,#fff); font-size:13px; color:var(--color-text-secondary,#555); font-family:inherit; cursor:pointer; text-align:left; transition:border-color .15s, background .15s, color .15s; }
.opt-btn:hover { border-color:rgba(154,33,25,0.35); background:var(--brand-bg); color:var(--brand); }
.opt-btn.selected { border-color:var(--brand); background:var(--brand-bg); color:var(--brand); font-weight:500; }
.opt-radio { width:15px; height:15px; min-width:15px; border-radius:50%; border:1.5px solid currentColor; display:flex; align-items:center; justify-content:center; }
.opt-radio-dot { width:6px; height:6px; border-radius:50%; background:var(--brand); }

/* Nav */
.q-nav { display:flex; justify-content:space-between; gap:10px; }
.nav-btn { padding:10px 20px; border-radius:10px; font-size:13px; font-family:inherit; cursor:pointer; font-weight:500; border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.12)); background:var(--color-background-primary,#fff); color:var(--color-text-secondary,#555); transition:background .15s, border-color .15s; }
.nav-btn:hover { background:var(--color-background-secondary,#f5f5f5); border-color:var(--color-border-secondary,rgba(0,0,0,.18)); }
.nav-btn.primary { background:var(--brand); border-color:var(--brand); color:#fff; }
.nav-btn.primary:hover { opacity:.9; }
.nav-btn.primary:disabled { opacity:.4; cursor:not-allowed; }

/* Result */
.result-card { background:var(--color-background-primary,#fff); border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.1)); border-radius:16px; overflow:hidden; }
.result-top { padding:28px 24px 22px; text-align:center; border-bottom:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.08)); }
.score-ring { width:84px; height:84px; border-radius:50%; border:1.5px solid var(--brand-border); background:var(--brand-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 auto 16px; }
.score-num { font-size:26px; font-weight:500; color:var(--brand); line-height:1; }
.score-pct { font-size:11px; color:var(--brand); opacity:.7; margin-top:1px; }
.result-profile { font-size:17px; font-weight:500; color:var(--color-text-primary,#111); margin:0 0 6px; }
.result-summary { font-size:13px; color:var(--color-text-secondary,#555); line-height:1.6; margin:0; max-width:300px; margin:0 auto; }
.domain-row { display:flex; gap:6px; padding:12px 18px; flex-wrap:wrap; border-bottom:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.08)); }
.d-pill { font-size:11px; padding:4px 11px; border-radius:99px; background:var(--brand-bg); color:var(--brand); border:0.5px solid var(--brand-border); }
.d-pill.top { background:var(--brand); color:#fff; border-color:var(--brand); }
.result-actions { display:flex; gap:8px; padding:14px 18px; }
.res-btn { flex:1; padding:10px; border-radius:10px; font-size:13px; font-family:inherit; font-weight:500; cursor:pointer; text-align:center; border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.12)); background:var(--color-background-primary,#fff); color:var(--color-text-secondary,#555); }
.res-btn.primary { background:var(--brand); border-color:var(--brand); color:#fff; }
`;

export default function PsychometricTestPage() {
  const { addTestHistory, isUnlocked } = useAppState();
  const { navigate } = usePortalNavigation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(quickPsychometricQuestions.length).fill(null));
  const [stage, setStage] = useState("questions");

  const answerWeights = { "Strongly Agree": 4, Agree: 3, Neutral: 2, Disagree: 1 };

  const domainScores = { analytical: 0, creative: 0, people: 0, business: 0, technology: 0 };
  answers.forEach((answer, i) => {
    const w = answerWeights[answer] || 0;
    if (i === 0) domainScores.analytical += w;
    if (i === 1) { domainScores.creative += w; domainScores.analytical += 5 - w; }
    if (i === 2) domainScores.people += w;
    if (i === 3) domainScores.business += w;
    if (i === 4) domainScores.technology += w;
  });

  const reportHighlights = {
    analytical: { title: "Analytical Explorer", summary: "You are strongest in structured thinking, pattern recognition, and data-driven decision making.", careers: ["Engineering", "Data Science", "Finance Analysis"] },
    creative: { title: "Creative Visionary", summary: "You show a strong preference for imagination, originality, and creative problem solving.", careers: ["Design", "Media", "Architecture"] },
    people: { title: "People-Centred Guide", summary: "You naturally lean toward mentoring, supporting, and understanding the needs of others.", careers: ["Psychology", "Teaching", "Human Resources"] },
    business: { title: "Business Strategist", summary: "You are drawn toward planning, decision making, and understanding how organisations grow.", careers: ["Management", "Marketing", "Entrepreneurship"] },
    technology: { title: "Technology Builder", summary: "You are highly motivated by innovation, tools, systems, and emerging technology.", careers: ["Software Development", "AI", "Cybersecurity"] },
  };

  const rankedDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const topDomain = rankedDomains[0]?.[0] || "analytical";
  const profile = reportHighlights[topDomain];
  const totalScore = answers.reduce((s, a) => s + (answerWeights[a] || 0), 0);
  const maxScore = quickPsychometricQuestions.length * 4;
  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const isLastQuestion = current === quickPsychometricQuestions.length - 1;
  const currentQuestion = quickPsychometricQuestions[current];
  const progressWidth = `${((current + 1) / quickPsychometricQuestions.length) * 100}%`;

  function handleBack() {
    if (stage === "result") { navigate("/app/assessment"); return; }
    if (current > 0) { setCurrent((v) => v - 1); return; }
    navigate("/app/assessment");
  }

  function handleRetake() {
    setAnswers(Array(quickPsychometricQuestions.length).fill(null));
    setCurrent(0);
    setStage("questions");
  }

  function handleNext() {
    if (isLastQuestion) {
      addTestHistory({
        id: `psychometric-${Date.now()}`,
        title: "Psychometric Test",
        subtitle: `Score ${scorePercent}% • Completed on ${new Date().toLocaleDateString("en-IN")}`,
        status: "Report Ready",
      });
      setStage("result");
      return;
    }
    setCurrent((v) => v + 1);
  }

  if (!isUnlocked("psychometric-test")) {
    return <PremiumGate title="Psychometric Test Locked" description="Subscribe to continue with the full psychometric test." returnTo="/app/psychometric-test" />;
  }

  if (stage === "result") {
    return (
      <div className="psycho-wrap space-y-4">
        <style>{css}</style>
        <PageHero backOnly onBack={handleBack} />
        <div className="result-card">
          <div className="result-top">
            <div className="score-ring">
              <span className="score-num">{scorePercent}</span>
              <span className="score-pct">%</span>
            </div>
            <p className="result-profile">{profile.title}</p>
            <p className="result-summary">{profile.summary}</p>
          </div>
          <div className="domain-row">
            {rankedDomains.map(([domain], i) => (
              <span key={domain} className={`d-pill${i === 0 ? " top" : ""}`}>
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </span>
            ))}
          </div>
          <div className="result-actions">
            <button className="res-btn primary" onClick={() => navigate("/app/dashboard")}>Dashboard</button>
            <button className="res-btn" onClick={handleRetake}>Retake test</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="psycho-wrap space-y-4">
      <style>{css}</style>
      <PageHero backOnly onBack={handleBack} />

      <div className="prog-header">
        <div className="prog-meta">
          <span className="prog-step">Question {current + 1} of {quickPsychometricQuestions.length}</span>
          <span className="prog-badge">{Math.round(((current + 1) / quickPsychometricQuestions.length) * 100)}% complete</span>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: progressWidth }} />
        </div>
        <p className="prog-hint">Choose one answer. Your previous answers stay saved when you go back.</p>
      </div>

      <div className="q-card">
        <div className="q-card-head">
          <p className="q-card-text">{currentQuestion.q}</p>
        </div>
        <div className="q-card-body">
          {currentQuestion.options.map((option) => {
            const sel = answers[current] === option;
            return (
              <button
                key={option}
                className={`opt-btn${sel ? " selected" : ""}`}
                onClick={() => {
                  const next = [...answers];
                  next[current] = option;
                  setAnswers(next);
                }}
              >
                <span className="opt-radio">
                  {sel && <span className="opt-radio-dot" />}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="q-nav">
        <button className="nav-btn" onClick={handleBack}>
          {current === 0 ? "Back to assessment" : "Previous"}
        </button>
        <button className="nav-btn primary" disabled={!answers[current]} onClick={handleNext}>
          {isLastQuestion ? "Finish test" : "Next"}
        </button>
      </div>
    </div>
  );
}