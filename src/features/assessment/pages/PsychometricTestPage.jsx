import { useMemo, useState } from "react";
import {
  BarChartOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FlagOutlined,
  FundProjectionScreenOutlined,
  ReadOutlined,
  ReloadOutlined,
  RightOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Button, Card, Progress, Radio, Space, Steps, Tag, message } from "antd";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

const answerScale = [
  { label: "Strongly Agree", value: 5 },
  { label: "Agree", value: 4 },
  { label: "Neutral", value: 3 },
  { label: "Disagree", value: 2 },
  { label: "Strongly Disagree", value: 1 },
];

const assessmentModules = [
  {
    key: "interest",
    title: "Interest",
    icon: <SmileOutlined />,
    color: "#b12d1f",
    summary: "Explores the activities and subjects that naturally hold your attention.",
    questions: [
      "I enjoy exploring new subjects even outside my school syllabus.",
      "I feel excited when I discover how a profession works in real life.",
      "I prefer tasks that connect with my personal passions and curiosity.",
      "I like spending time on projects related to careers I admire.",
      "I actively look for opportunities to learn about different fields.",
    ],
  },
  {
    key: "personality",
    title: "Personality",
    icon: <SmileOutlined />,
    color: "#c4502c",
    summary: "Looks at how you behave, respond, and work with others.",
    questions: [
      "I stay calm and steady when I face pressure or deadlines.",
      "I enjoy working with people and building new connections.",
      "I usually take initiative instead of waiting for instructions.",
      "I adapt quickly when plans or expectations suddenly change.",
      "I like expressing my thoughts openly in group discussions.",
    ],
  },
  {
    key: "goal-orientation",
    title: "Goal Orientation",
    icon: <FlagOutlined />,
    color: "#9b1d24",
    summary: "Measures your motivation, persistence, and focus on outcomes.",
    questions: [
      "I set clear goals for myself and track my progress regularly.",
      "I keep working on tasks even when they become difficult.",
      "I feel motivated by achieving measurable outcomes.",
      "I break big goals into smaller milestones and deadlines.",
      "I recover quickly after setbacks and continue moving forward.",
    ],
  },
  {
    key: "aptitude",
    title: "Aptitude",
    icon: <BarChartOutlined />,
    color: "#8f2f1f",
    summary: "Assesses how comfortable you are with reasoning and problem solving.",
    questions: [
      "I enjoy solving puzzles, patterns, or logic-based questions.",
      "I can quickly understand charts, data, or number-based information.",
      "I like comparing different solutions before making a choice.",
      "I can identify mistakes or inconsistencies in information easily.",
      "I enjoy tasks that require structured thinking and accuracy.",
    ],
  },
  {
    key: "learning-style",
    title: "Learning Style",
    icon: <ReadOutlined />,
    color: "#b56a2f",
    summary: "Shows how you best absorb, practice, and retain information.",
    questions: [
      "I learn best when I can see examples, diagrams, or demonstrations.",
      "I remember concepts better after discussing them with someone.",
      "I prefer hands-on practice instead of only reading theory.",
      "I stay engaged when learning is interactive and activity-based.",
      "I revise more effectively when I organize notes in my own way.",
    ],
  },
  {
    key: "work-values",
    title: "Work Values",
    icon: <FundProjectionScreenOutlined />,
    color: "#7a2b20",
    summary: "Highlights what matters most to you in a future career environment.",
    questions: [
      "I want a career that creates a positive impact on others.",
      "I value long-term job security when thinking about career choices.",
      "I want enough freedom to make independent decisions in my work.",
      "I care about work-life balance as much as career growth.",
      "I feel motivated by roles where effort is recognized and rewarded.",
    ],
  },
];

const moduleInsights = {
  interest: {
    strong: "You are driven by curiosity and naturally lean toward exploratory career paths.",
    moderate: "Your interests are emerging well, and more exposure can sharpen your direction.",
    low: "You may need broader exposure to subjects and careers to clarify what energizes you most.",
  },
  personality: {
    strong: "Your personal style shows confidence and adaptability across team and individual settings.",
    moderate: "You show balanced traits and can grow strongly with the right environment.",
    low: "A more guided environment may help you build confidence and communication habits.",
  },
  "goal-orientation": {
    strong: "You are highly motivated and likely to stay committed to long-term goals.",
    moderate: "You have a healthy level of drive and can benefit from stronger planning habits.",
    low: "You may do better with shorter milestones, structure, and accountability support.",
  },
  aptitude: {
    strong: "You appear comfortable with reasoning, structured thinking, and analytical problem solving.",
    moderate: "You have a workable foundation and can improve with regular practice.",
    low: "You may benefit from skill-building in logic, data handling, and step-by-step analysis.",
  },
  "learning-style": {
    strong: "You understand how you learn best and can likely adapt your study methods well.",
    moderate: "You show flexible learning habits and can improve with more deliberate study systems.",
    low: "Experimenting with study formats may help you discover methods that suit you better.",
  },
  "work-values": {
    strong: "You have clear internal values that can guide meaningful career decisions.",
    moderate: "Your work values are taking shape and will become clearer with more experience.",
    low: "You may need more reflection on what kind of work environment matters most to you.",
  },
};

function getBand(score, maxScore) {
  const ratio = score / maxScore;
  if (ratio >= 0.8) {
    return "strong";
  }
  if (ratio >= 0.55) {
    return "moderate";
  }
  return "low";
}

function toTitleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createInitialAnswers() {
  return assessmentModules.map((module) => module.questions.map(() => null));
}

function normalizeAnswers(answers) {
  return assessmentModules.map((module, moduleIndex) => {
    const moduleAnswers = Array.isArray(answers?.[moduleIndex]) ? answers[moduleIndex] : [];
    return module.questions.map((_, questionIndex) => moduleAnswers[questionIndex] ?? null);
  });
}

function buildReportFromAnswers(answers) {
  const safeAnswers = normalizeAnswers(answers);
  const modules = assessmentModules.map((module, moduleIndex) => {
    const moduleAnswers = safeAnswers[moduleIndex];
    const score = moduleAnswers.reduce((sum, value) => sum + (value || 0), 0);
    const maxScore = module.questions.length * 5;
    const percentage = Math.round((score / maxScore) * 100);
    const band = getBand(score, maxScore);

    return {
      ...module,
      score,
      maxScore,
      percentage,
      band,
      insight: moduleInsights[module.key][band],
    };
  });

  const topModule = [...modules].sort((a, b) => b.score - a.score)[0];
  const overallScore = modules.reduce((sum, module) => sum + module.score, 0);
  const overallMax = modules.reduce((sum, module) => sum + module.maxScore, 0);
  const overallPercent = Math.round((overallScore / overallMax) * 100);

  return {
    modules,
    topModule,
    overallScore,
    overallMax,
    overallPercent,
  };
}

export default function PsychometricTestPage() {
  const { addTestHistory, isUnlocked } = useAppState();
  const { navigate } = usePortalNavigation();
  const [messageApi, contextHolder] = message.useMessage();
  const [currentModule, setCurrentModule] = useState(0);
  const [stage, setStage] = useState("questions");
  const [answers, setAnswers] = useState(createInitialAnswers);
  const safeAnswers = normalizeAnswers(answers);
  const safeCurrentModule = Math.min(Math.max(currentModule, 0), assessmentModules.length - 1);

  const totalQuestions = assessmentModules.reduce((sum, module) => sum + module.questions.length, 0);
  const answeredCount = safeAnswers.flat().filter((value) => value !== null).length;
  const percentComplete = Math.round((answeredCount / totalQuestions) * 100);
  const activeModule = assessmentModules[safeCurrentModule];
  const activeAnswers = safeAnswers[safeCurrentModule];
  const moduleComplete = activeAnswers.every((value) => value !== null);
  const isLastModule = safeCurrentModule === assessmentModules.length - 1;

  const report = useMemo(() => buildReportFromAnswers(safeAnswers), [safeAnswers]);

  function handleBack() {
    if (stage === "result") {
      navigate("/app/assessment", { replace: true });
      return;
    }

    if (currentModule > 0) {
      setCurrentModule((value) => value - 1);
      return;
    }

    navigate("/app/assessment", { replace: true });
  }

  function handleAnswerChange(questionIndex, value) {
    setAnswers((current) => {
      const normalizedCurrent = normalizeAnswers(current);
      const nextAnswers = normalizedCurrent.map((moduleAnswers, moduleIndex) =>
        moduleIndex === safeCurrentModule
          ? moduleAnswers.map((answer, index) => (index === questionIndex ? value : answer))
          : moduleAnswers
      );

      const nextModuleAnswers = nextAnswers[safeCurrentModule];
      const nextModuleComplete = nextModuleAnswers.every((answer) => answer !== null);

      if (nextModuleComplete) {
        window.setTimeout(() => {
          if (safeCurrentModule === assessmentModules.length - 1) {
            const finalReport = buildReportFromAnswers(nextAnswers);
            addTestHistory({
              id: `psychometric-${Date.now()}`,
              title: "Full Assessment Report",
              subtitle: `Completed on ${new Date().toLocaleDateString("en-IN")} - Overall score ${finalReport.overallPercent}%`,
              status: "Report Ready",
            });
            setStage("result");
            return;
          }

          setCurrentModule((moduleIndex) => moduleIndex + 1);
        }, 350);
      }

      return nextAnswers;
    });
  }

  function handleNext() {
    if (!moduleComplete) {
      messageApi.warning("Please answer all questions in this module before continuing.");
      return;
    }

    if (isLastModule) {
      addTestHistory({
        id: `psychometric-${Date.now()}`,
        title: "Full Assessment Report",
        subtitle: `Completed on ${new Date().toLocaleDateString("en-IN")} - Overall score ${report.overallPercent}%`,
        status: "Report Ready",
      });
      setStage("result");
      return;
    }

    setCurrentModule((value) => value + 1);
  }

  function handleRetake() {
    setAnswers(createInitialAnswers());
    setCurrentModule(0);
    setStage("questions");
  }

  function handleDownloadReport() {
    const generatedOn = new Date().toLocaleString("en-IN");
    const moduleRows = report.modules
      .map(
        (module) => `
          <tr>
            <td style="padding:10px;border:1px solid #eaded9;">${module.title}</td>
            <td style="padding:10px;border:1px solid #eaded9;">${module.score}/${module.maxScore}</td>
            <td style="padding:10px;border:1px solid #eaded9;">${module.percentage}%</td>
            <td style="padding:10px;border:1px solid #eaded9;">${toTitleCase(module.band)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Assessment Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; color: #231815; padding: 32px;">
          <h1 style="color:#9a2119; margin-bottom: 4px;">CareerMap Full Assessment Report</h1>
          <p style="margin-top:0; color:#6b5b55;">Generated on ${generatedOn}</p>
          <p><strong>Overall score:</strong> ${report.overallScore}/${report.overallMax} (${report.overallPercent}%)</p>
          <p><strong>Strongest module:</strong> ${report.topModule.title}</p>
          <p style="line-height:1.7;">${report.topModule.insight}</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background:#fdf3f0;">
                <th style="padding:10px;border:1px solid #eaded9;text-align:left;">Module</th>
                <th style="padding:10px;border:1px solid #eaded9;text-align:left;">Score</th>
                <th style="padding:10px;border:1px solid #eaded9;text-align:left;">Percent</th>
                <th style="padding:10px;border:1px solid #eaded9;text-align:left;">Level</th>
              </tr>
            </thead>
            <tbody>${moduleRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "career-map-assessment-report.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      <ModuleScreen maxWidthClass="max-w-[1280px]" className="space-y-5">
        {contextHolder}
        <PageHero backOnly onBack={handleBack} />

        <Card className="!rounded-[28px] !border-[#ecd9d4] shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#b12d1f]">Assessment Report</div>
              <h2 className="mt-2 text-3xl font-black text-[#231815]">Your Full Assessment is Ready</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#65544f]">
                This report combines your Interest, Personality, Goal Orientation, Aptitude, Learning Style, and Work Values results.
              </p>
            </div>
            <div className="rounded-[24px] border border-[#ecd9d4] bg-[#fdf5f3] px-6 py-5 text-center">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b12d1f]">Overall Score</div>
              <div className="mt-2 text-4xl font-black text-[#9a2119]">{report.overallPercent}%</div>
              <div className="mt-1 text-xs text-[#6f5f5a]">
                {report.overallScore}/{report.overallMax}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="!rounded-[28px] !border-[#ecd9d4] shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fdf3f0] text-[#b12d1f]">
                <FileTextOutlined />
              </div>
              <div>
                <div className="text-lg font-black text-[#231815]">Module Summary</div>
                <div className="text-sm text-[#776864]">Score breakdown across all six sections</div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {report.modules.map((module) => (
                <div key={module.key} className="rounded-2xl border border-[#f0e1dc] bg-[#fffaf8] p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-base font-bold text-[#231815]">{module.title}</div>
                      <div className="text-xs text-[#776864]">{module.score}/{module.maxScore} points</div>
                    </div>
                    <Tag
                      className="!m-0 !rounded-full !border-[#e8b4ab] !bg-[#fff1ee] !px-3 !py-1 !text-[#b12d1f]"
                    >
                      {toTitleCase(module.band)}
                    </Tag>
                  </div>
                  <Progress
                    percent={module.percentage}
                    strokeColor={module.color}
                    trailColor="#f3dfda"
                    showInfo={false}
                    className="mt-4"
                  />
                  <p className="mt-3 mb-0 text-sm leading-7 text-[#5e4f4a]">{module.insight}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="!rounded-[28px] !border-[#ecd9d4] shadow-sm">
              <div className="text-lg font-black text-[#231815]">Strongest Area</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#fdf3f0] px-3 py-1.5 text-sm font-semibold text-[#b12d1f]">
                {report.topModule.icon}
                {report.topModule.title}
              </div>
              <p className="mt-4 mb-0 text-sm leading-7 text-[#5e4f4a]">{report.topModule.insight}</p>
            </Card>

            <Card className="!rounded-[28px] !border-[#ecd9d4] shadow-sm">
              <div className="text-lg font-black text-[#231815]">Next Step</div>
              <p className="mt-3 text-sm leading-7 text-[#5e4f4a]">
                Use this report to shortlist career paths, compare learning environments, and discuss your goals with a mentor or counsellor.
              </p>
              <Space wrap className="mt-4">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="!h-11 !rounded-xl !bg-[#b12d1f] !border-[#b12d1f] !font-semibold"
                  onClick={handleDownloadReport}
                >
                  Download Report
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  className="!h-11 !rounded-xl !border-[#e4d5cf] !font-semibold"
                  onClick={handleRetake}
                >
                  Retake Assessment
                </Button>
              </Space>
            </Card>
          </div>
        </div>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen maxWidthClass="max-w-[1280px]" className="space-y-5">
      {contextHolder}
      <PageHero backOnly onBack={handleBack} />

      <div className="space-y-6 rounded-[28px] border border-[#eaded9] bg-white px-5 py-5 shadow-sm md:px-6 md:py-6">
        <div className="flex flex-col gap-4 border-b border-[#f1e3de] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.24em] text-[#b12d1f]">Full Assessment</div>
            <h1 className="mt-2 text-3xl font-black text-[#231815]">Psychometric Test</h1>
           
          </div>
          <div className="min-w-[220px] lg:max-w-[260px]">
            <div className="flex items-center justify-between text-sm font-semibold text-[#8e3b2d]">
              <span>Progress</span>
              <span>{answeredCount}/{totalQuestions} answered</span>
            </div>
            <Progress percent={percentComplete} strokeColor="#b12d1f" trailColor="#f1d8d2" className="mt-3 !mb-0" />
          </div>
        </div>

        <div className="border-b border-[#f1e3de] pb-5">
          <Steps
            current={currentModule}
            responsive
            items={assessmentModules.map((module, index) => ({
              title: module.title,
              description: `${safeAnswers[index].filter((value) => value !== null).length}/${module.questions.length} done`,
              icon: module.icon,
            }))}
          />
        </div>

        

        <div className="space-y-5">
          {activeModule.questions.map((question, questionIndex) => (
            <div key={question}>
              <div className="mb-3 text-sm font-bold text-[#231815]">
                Q{questionIndex + 1}. {question}
              </div>
              <Radio.Group
                value={activeAnswers[questionIndex]}
                onChange={(event) => handleAnswerChange(questionIndex, event.target.value)}
                className="w-full"
              >
                <Space direction="vertical" className="w-full">
                  {answerScale.map((option) => (
                    <Radio
                      key={option.label}
                      value={option.value}
                      className="!flex !rounded-xl !border !border-[#eadcd6] !bg-white !px-4 !py-3 hover:!border-[#cf8d80]"
                    >
                      <span className="text-sm text-[#4f4340]">{option.label}</span>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-[#f1e3de] pt-5">
          <Button className="!h-11 !rounded-xl !border-[#dfd2cc] !px-5 !font-semibold" onClick={handleBack}>
            {currentModule === 0 ? "Back to Assessment" : "Previous Module"}
          </Button>
          <Button
            type="primary"
            icon={<RightOutlined />}
            iconPosition="end"
            className="!ml-auto !h-11 !rounded-xl !bg-[#b12d1f] !border-[#b12d1f] !px-5 !font-semibold"
            onClick={handleNext}
          >
            {isLastModule ? "Finish & View Report" : "Check & Continue"}
          </Button>
        </div>
      </div>
    </ModuleScreen>
  );
}
