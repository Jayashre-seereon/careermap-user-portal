import { useState } from "react";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { quickPsychometricQuestions } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function PsychometricTestPage() {
  const { addTestHistory, isUnlocked } = useAppState();
  const { navigate } = usePortalNavigation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(quickPsychometricQuestions.length).fill(null));
  const [stage, setStage] = useState("questions");

  const answerWeights = { "Strongly Agree": 4, Agree: 3, Neutral: 2, Disagree: 1 };

  const domainScores = { analytical: 0, creative: 0, people: 0, business: 0, technology: 0 };
  answers.forEach((answer, i) => {
    const weight = answerWeights[answer] || 0;
    if (i === 0) domainScores.analytical += weight;
    if (i === 1) {
      domainScores.creative += weight;
      domainScores.analytical += 5 - weight;
    }
    if (i === 2) domainScores.people += weight;
    if (i === 3) domainScores.business += weight;
    if (i === 4) domainScores.technology += weight;
  });

  const reportHighlights = {
    analytical: {
      title: "Analytical Explorer",
      summary: "You are strongest in structured thinking, pattern recognition, and data-driven decision making.",
    },
    creative: {
      title: "Creative Visionary",
      summary: "You show a strong preference for imagination, originality, and creative problem solving.",
    },
    people: {
      title: "People-Centred Guide",
      summary: "You naturally lean toward mentoring, supporting, and understanding the needs of others.",
    },
    business: {
      title: "Business Strategist",
      summary: "You are drawn toward planning, decision making, and understanding how organisations grow.",
    },
    technology: {
      title: "Technology Builder",
      summary: "You are highly motivated by innovation, tools, systems, and emerging technology.",
    },
  };

  const rankedDomains = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  const topDomain = rankedDomains[0]?.[0] || "analytical";
  const profile = reportHighlights[topDomain];
  const totalScore = answers.reduce((sum, answer) => sum + (answerWeights[answer] || 0), 0);
  const maxScore = quickPsychometricQuestions.length * 4;
  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const isLastQuestion = current === quickPsychometricQuestions.length - 1;
  const currentQuestion = quickPsychometricQuestions[current];
  const progressWidth = `${((current + 1) / quickPsychometricQuestions.length) * 100}%`;

  function handleBack() {
    if (stage === "result") {
      navigate("/app/assessment", { replace: true });
      return;
    }
    if (current > 0) {
      setCurrent((value) => value - 1);
      return;
    }
    navigate("/app/assessment", { replace: true });
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
        subtitle: `Score ${scorePercent}% - Completed on ${new Date().toLocaleDateString("en-IN")}`,
        status: "Report Ready",
      });
      setStage("result");
      return;
    }
    setCurrent((value) => value + 1);
  }

  if (!isUnlocked("psychometric-test")) {
    return (
      <PremiumGate
        title="Psychometric Test Locked"
        description="Subscribe to continue with the full psychometric test."
        returnTo="/app/psychometric-test"
      />
    );
  }

  if (stage === "result") {
    return (
      <ModuleScreen maxWidthClass="max-w-3xl" className="space-y-4">
        <PageHero backOnly onBack={handleBack} />

        <div className="overflow-hidden rounded-2xl border border-[rgba(0,0,0,0.1)] bg-white">
          <div className="border-b border-[rgba(0,0,0,0.08)] px-6 pb-[22px] pt-7 text-center">
            <div className="mx-auto mb-4 flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full border border-[rgba(154,33,25,0.14)] bg-[rgba(154,33,25,0.06)]">
              <span className="text-[26px] font-medium leading-none text-[#9a2119]">{scorePercent}</span>
              <span className="mt-0.5 text-[11px] text-[#9a2119]/70">%</span>
            </div>
            <p className="mb-1.5 text-[17px] font-medium text-[#111]">{profile.title}</p>
            <p className="mx-auto max-w-[300px] text-[13px] leading-6 text-[#555]">{profile.summary}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 border-b border-[rgba(0,0,0,0.08)] px-[18px] py-3">
            {rankedDomains.map(([domain], index) => (
              <span
                key={domain}
                className={`rounded-full border px-[11px] py-1 text-[11px] ${
                  index === 0
                    ? "border-[#9a2119] bg-[#9a2119] text-white"
                    : "border-[rgba(154,33,25,0.14)] bg-[rgba(154,33,25,0.06)] text-[#9a2119]"
                }`}
              >
                {domain.charAt(0).toUpperCase() + domain.slice(1)}
              </span>
            ))}
          </div>

          <div className="flex gap-2 px-[18px] py-[14px]">
            <button
              className="flex-1 rounded-[10px] border border-[#9a2119] bg-[#9a2119] px-4 py-2.5 text-[13px] font-medium text-white"
              onClick={() => navigate("/app/dashboard", { replace: true })}
            >
              Dashboard
            </button>
            <button
              className="flex-1 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-4 py-2.5 text-[13px] font-medium text-[#555]"
              onClick={handleRetake}
            >
              Retake test
            </button>
          </div>
        </div>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen maxWidthClass="max-w-3xl" className="space-y-4">
      <PageHero backOnly onBack={handleBack} />

      <div className="rounded-xl border border-[rgba(154,33,25,0.14)] bg-[rgba(154,33,25,0.06)] px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-[#9a2119]">
            Question {current + 1} of {quickPsychometricQuestions.length}
          </span>
          <span className="rounded-full bg-[rgba(154,33,25,0.10)] px-2.5 py-1 text-[11px] text-[#9a2119]">
            {Math.round(((current + 1) / quickPsychometricQuestions.length) * 100)}% complete
          </span>
        </div>
        <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-[rgba(154,33,25,0.12)]">
          <div className="h-full rounded-full bg-[#9a2119] transition-all duration-300" style={{ width: progressWidth }} />
        </div>
        <p className="text-xs leading-5 text-[#888]">
          Choose one answer. Your previous answers stay saved when you go back.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)] bg-white">
        <div className="border-b border-[rgba(0,0,0,0.08)] px-[18px] py-4">
          <p className="text-[15px] font-medium leading-6 text-[#111]">{currentQuestion.q}</p>
        </div>
        <div className="flex flex-col gap-2 px-[18px] py-[14px]">
          {currentQuestion.options.map((option) => {
            const selected = answers[current] === option;
            return (
              <button
                key={option}
                className={`flex w-full items-center gap-2.5 rounded-[10px] border px-[14px] py-[11px] text-left text-[13px] transition-colors ${
                  selected
                    ? "border-[#9a2119] bg-[rgba(154,33,25,0.06)] font-medium text-[#9a2119]"
                    : "border-[rgba(0,0,0,0.1)] bg-white text-[#555] hover:border-[rgba(154,33,25,0.35)] hover:bg-[rgba(154,33,25,0.06)] hover:text-[#9a2119]"
                }`}
                onClick={() => {
                  const next = [...answers];
                  next[current] = option;
                  setAnswers(next);
                }}
              >
                <span
                  className={`flex h-[15px] w-[15px] min-w-[15px] items-center justify-center rounded-full border ${
                    selected ? "border-[#9a2119]" : "border-current"
                  }`}
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-[#9a2119]" /> : null}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2.5">
        <button
          className="rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-5 py-2.5 text-[13px] font-medium text-[#555] hover:bg-[#f5f5f5]"
          onClick={handleBack}
        >
          {current === 0 ? "Back to assessment" : "Previous"}
        </button>
        <button
          className="ml-auto rounded-[10px] border border-[#9a2119] bg-[#9a2119] px-5 py-2.5 text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!answers[current]}
          onClick={handleNext}
        >
          {isLastQuestion ? "Finish test" : "Next"}
        </button>
      </div>
    </ModuleScreen>
  );
}
