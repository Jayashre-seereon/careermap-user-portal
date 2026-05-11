import { useState } from "react";
import { Button, Result, Space } from "antd";
import { quickPsychometricQuestions } from "../../../data/careermapData";
import { PageHero, SectionCard, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function PsychometricTestPage() {
  const { addTestHistory, isUnlocked } = useAppState();
  const { navigate } = usePortalNavigation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(quickPsychometricQuestions.length).fill(null));
  const [stage, setStage] = useState("questions");

  const answerWeights = {
    "Strongly Agree": 4,
    Agree: 3,
    Neutral: 2,
    Disagree: 1,
  };

  const domainScores = {
    analytical: 0,
    creative: 0,
    people: 0,
    business: 0,
    technology: 0,
  };

  answers.forEach((answer, index) => {
    const weight = answerWeights[answer] || 0;
    if (index === 0) domainScores.analytical += weight;
    if (index === 1) {
      domainScores.creative += weight;
      domainScores.analytical += 5 - weight;
    }
    if (index === 2) domainScores.people += weight;
    if (index === 3) domainScores.business += weight;
    if (index === 4) domainScores.technology += weight;
  });

  const reportHighlights = {
    analytical: {
      title: "Analytical Explorer",
      summary: "You are strongest in structured thinking, pattern recognition, and data-driven decision making.",
      careers: ["Engineering", "Data Science", "Finance Analysis"],
    },
    creative: {
      title: "Creative Visionary",
      summary: "You show a strong preference for imagination, originality, and creative problem solving.",
      careers: ["Design", "Media", "Architecture"],
    },
    people: {
      title: "People-Centred Guide",
      summary: "You naturally lean toward mentoring, supporting, and understanding the needs of others.",
      careers: ["Psychology", "Teaching", "Human Resources"],
    },
    business: {
      title: "Business Strategist",
      summary: "You are drawn toward planning, decision making, and understanding how organisations grow.",
      careers: ["Management", "Marketing", "Entrepreneurship"],
    },
    technology: {
      title: "Technology Builder",
      summary: "You are highly motivated by innovation, tools, systems, and emerging technology.",
      careers: ["Software Development", "AI", "Cybersecurity"],
    },
  };

  const rankedDomains = Object.entries(domainScores).sort((left, right) => right[1] - left[1]);
  const topDomain = rankedDomains[0]?.[0] || "analytical";
  const profile = reportHighlights[topDomain];
  const totalScore = answers.reduce((sum, answer) => sum + (answerWeights[answer] || 0), 0);
  const maxScore = quickPsychometricQuestions.length * 4;
  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const isLastQuestion = current === quickPsychometricQuestions.length - 1;
  const currentQuestion = quickPsychometricQuestions[current];

  function handleBack() {
    if (stage === "result") {
      navigate("/app/assessment");
      return;
    }

    if (current > 0) {
      setCurrent((value) => value - 1);
      return;
    }

    navigate("/app/assessment");
  }

  function handleAnswerSelect(option) {
    const next = [...answers];
    next[current] = option;
    setAnswers(next);
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
        subtitle: `Score ${scorePercent}% â€¢ Completed on ${new Date().toLocaleDateString("en-IN")}`,
        status: "Report Ready",
      });
      setStage("result");
      return;
    }

    setCurrent((value) => value + 1);
  }

  if (!isUnlocked("psychometric-test")) {
    return <PremiumGate title="Psychometric Test Locked" description="Subscribe to continue with the full psychometric test." returnTo="/app/psychometric-test" />;
  }

  if (stage === "result") {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={handleBack} />
        <Result
          status="success"
          title={`Psychometric Score: ${scorePercent}%`}
          subTitle={`${profile.title} is your strongest career-fit pattern.`}
          extra={[
            <Button key="dashboard" type="primary" onClick={() => navigate("/app/dashboard")}>
              Back to Dashboard
            </Button>,
            <Button key="retake" onClick={handleRetake}>
              Retake Test
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={handleBack} />
      <SectionCard
        title={`Question ${current + 1} of ${quickPsychometricQuestions.length}`}
        extra={<Text className="!font-bold !text-brand">{scorePercent}% progress potential</Text>}
      >
        <Space direction="vertical" size="middle" className="!w-full">
          <div className="h-2 overflow-hidden rounded-full bg-[#f0e5e0]">
            <div
              className="h-full rounded-full bg-[#9a2119] transition-all duration-300"
              style={{ width: `${((current + 1) / quickPsychometricQuestions.length) * 100}%` }}
            />
          </div>
          <Text className="!text-muted">Choose one answer and move through the test step by step. Your previous answers stay saved when you go back.</Text>
        </Space>
      </SectionCard>
      <SectionCard title={currentQuestion.q}>
        <div className="grid gap-3">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              block
              size="large"
              type={answers[current] === option ? "primary" : "default"}
              className="!h-auto !rounded-2xl !py-4 !text-left"
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </SectionCard>
      <div className="flex justify-between">
        <Button onClick={handleBack}>{current === 0 ? "Back to Assessment" : "Previous"}</Button>
        <Button type="primary" disabled={!answers[current]} onClick={handleNext}>
          {isLastQuestion ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}
