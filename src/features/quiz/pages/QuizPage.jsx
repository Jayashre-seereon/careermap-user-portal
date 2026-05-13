import { useState } from "react";
import {
  FileTextOutlined,
  TeamOutlined,
  LinkOutlined,
  RiseOutlined,
  MedicineBoxOutlined,
  CodeOutlined,
  BankOutlined,
  BulbOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { quizCatalog, sampleQuizQuestions } from "../../../data/careermapData";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const QUIZ_ICONS = [
  <FileTextOutlined key="file" />,
  <MedicineBoxOutlined key="medicine" />,
  <BankOutlined key="bank" />,
  <CodeOutlined key="code" />,
  <TeamOutlined key="team" />,
  <RiseOutlined key="rise" />,
  <LinkOutlined key="link" />,
  <BulbOutlined key="bulb" />,
];

const SCORE_MESSAGES = [
  "Keep practicing and you will get there.",
  "You are building momentum.",
  "Not bad, almost there.",
  "Great work, you are on track.",
  "Perfect score, outstanding.",
];

export default function QuizPage() {
  const { navigate } = usePortalNavigation();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(sampleQuizQuestions.length).fill(null));
  const [completed, setCompleted] = useState(false);

  const totalQ = sampleQuizQuestions.length;
  const score = answers.filter((answer, index) => answer === sampleQuizQuestions[index].correct).length;

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrent(0);
    setAnswers(Array(totalQ).fill(null));
    setCompleted(false);
  };

  if (completed) {
    return (
      <ModuleScreen maxWidthClass="max-w-sm" className="space-y-6">
        <PageHero backOnly onBack={resetQuiz} />

        <div className="px-4 py-12 text-center">
          <div
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
            style={{ background: "#fdf0ef", color: "#9a2119" }}
          >
            <CheckCircleOutlined />
          </div>

          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#9a2119" }}>
            Quiz complete
          </p>

          <p className="mb-2 text-5xl font-bold tracking-tight text-gray-900">
            {score}
            <span className="text-2xl font-normal text-gray-300"> / {totalQ}</span>
          </p>

          <p className="mb-8 text-sm text-gray-400">
            {SCORE_MESSAGES[score] ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1]}
          </p>

          <button
            onClick={resetQuiz}
            className="w-full max-w-[280px] rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: "#9a2119" }}
          >
            Try another quiz
          </button>
        </div>
      </ModuleScreen>
    );
  }

  if (activeQuiz !== null) {
    const question = sampleQuizQuestions[current];
    const progress = ((current + 1) / totalQ) * 100;
    const isLast = current === totalQ - 1;

    return (
      <ModuleScreen maxWidthClass="max-w-xl" className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHero backOnly onBack={() => setActiveQuiz(null)} />
          <span className="text-xs font-semibold text-gray-400">
            {current + 1} / {totalQ}
          </span>
        </div>

        <div className="mb-8 h-[3px] overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#9a2119" }}
          />
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: "#9a2119" }}>
          {quizCatalog[activeQuiz]?.title || "Quiz"}
        </p>

        <h2 className="mb-7 text-xl font-bold leading-snug tracking-tight text-gray-900">
          {question.q}
        </h2>

        <div className="mb-7 flex flex-col gap-2.5">
          {question.options.map((option, index) => {
            const selected = answers[current] === index;
            return (
              <button
                key={option}
                onClick={() => {
                  const next = [...answers];
                  next[current] = index;
                  setAnswers(next);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-all"
                style={{
                  border: `1.5px solid ${selected ? "#9a2119" : "#ede8e5"}`,
                  background: selected ? "#fdf0ef" : "#fff",
                  color: selected ? "#9a2119" : "#1a1512",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold"
                  style={{
                    background: selected ? "#9a2119" : "#f3eeec",
                    color: selected ? "#fff" : "#7a6e68",
                  }}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => (isLast ? setCompleted(true) : setCurrent((value) => value + 1))}
          disabled={answers[current] === null}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
          style={{ background: "#9a2119" }}
        >
          {isLast ? "Finish quiz" : "Next question"}
          <ArrowRightOutlined />
        </button>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-7">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Choose your quiz</h1>
        <p className="mt-1 text-sm text-gray-400">
          Test your knowledge and identify where to grow next.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {quizCatalog.map((quiz, index) => (
          <div
            key={quiz.title}
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#fff",
              border: "1.5px solid #e8dcd9",
              boxShadow: "none",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.borderColor = "#9a2119";
              event.currentTarget.style.boxShadow = "0 6px 24px rgba(154,33,25,0.10)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.borderColor = "#e8dcd9";
              event.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[3px]"
              style={{ background: "#9a2119", borderRadius: "16px 16px 0 0" }}
            />

            <div
              className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-5 transition-all duration-300 group-hover:scale-110 group-hover:opacity-10"
              style={{ background: "#9a2119" }}
            />

            <div
              className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
              style={{ background: "#fdf0ef", color: "#9a2119" }}
            >
              {QUIZ_ICONS[index % QUIZ_ICONS.length]}
            </div>

            <p className="relative mb-1.5 text-[15px] font-bold tracking-tight" style={{ color: "#1a1512" }}>
              {quiz.title}
            </p>
            <p className="relative mb-5 text-[13px] leading-relaxed" style={{ color: "#6b6560" }}>
              {quiz.description}
            </p>

            <div className="relative flex items-center justify-between">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide"
                style={{
                  background: "#fdf0ef",
                  color: "#9a2119",
                  border: "1px solid #f5cdc9",
                }}
              >
                {quiz.questions} questions
              </span>

              <button
                onClick={() => setActiveQuiz(index)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-300 hover:scale-110"
                style={{
                  background: "#fdf0ef",
                  color: "#9a2119",
                  border: "1.5px solid #f5cdc9",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = "#fff";
                  event.currentTarget.style.background = "#9a2119";
                  event.currentTarget.style.borderColor = "#9a2119";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = "#9a2119";
                  event.currentTarget.style.background = "#fdf0ef";
                  event.currentTarget.style.borderColor = "#f5cdc9";
                }}
              >
                <ArrowRightOutlined />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ModuleScreen>
  );
}
