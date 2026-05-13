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
import { quizCatalog, sampleQuizQuestions } from "../../../data/careermapData";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const QUIZ_ICONS = [
  <FileTextOutlined />,
  <MedicineBoxOutlined />,
  <BankOutlined />,
  <CodeOutlined />,
  <TeamOutlined />,
  <RiseOutlined />,
  <LinkOutlined />,
  <BulbOutlined />,
];

const SCORE_MESSAGES = [
  "Keep practicing — you'll get there.",
  "You're building momentum.",
  "Not bad — almost there!",
  "Great work — you're on track!",
  "Perfect score — outstanding!",
];

export default function QuizPage() {
  const { navigate } = usePortalNavigation();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(
    Array(sampleQuizQuestions.length).fill(null)
  );
  const [completed, setCompleted] = useState(false);

  const totalQ = sampleQuizQuestions.length;
  const score = answers.filter(
    (a, i) => a === sampleQuizQuestions[i].correct
  ).length;

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrent(0);
    setAnswers(Array(totalQ).fill(null));
    setCompleted(false);
  };

  // ── Result ────────────────────────────────────────────────────
  if (completed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
          style={{ background: "#fdf0ef", color: "#9a2119" }}
        >
          <CheckCircleOutlined />
        </div>

        <p
          className="text-[11px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "#9a2119" }}
        >
          Quiz complete
        </p>

        <p className="text-5xl font-bold tracking-tight text-gray-900 mb-2">
          {score}
          <span className="text-2xl font-normal text-gray-300"> / {totalQ}</span>
        </p>

        <p className="text-sm text-gray-400 mb-8">
          {SCORE_MESSAGES[score] ?? SCORE_MESSAGES[SCORE_MESSAGES.length - 1]}
        </p>

        <button
          onClick={resetQuiz}
          className="w-full max-w-[280px] py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
          style={{ background: "#9a2119" }}
        >
          Try another quiz
        </button>
      </div>
    );
  }

  // ── Active quiz ───────────────────────────────────────────────
  if (activeQuiz !== null) {
    const question = sampleQuizQuestions[current];
    const progress = ((current + 1) / totalQ) * 100;
    const isLast = current === totalQ - 1;

    return (
      <div className="max-w-xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveQuiz(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-[#fdf0ef]"
          >
            ← Back
          </button>
          <span className="text-xs font-semibold text-gray-400">
            {current + 1} / {totalQ}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#9a2119" }}
          />
        </div>

        {/* Quiz label */}
        <p
          className="text-[11px] font-bold tracking-[.1em] uppercase mb-2"
          style={{ color: "#9a2119" }}
        >
          {quizCatalog[activeQuiz]?.title || "Quiz"}
        </p>

        {/* Question */}
        <h2 className="text-xl font-bold text-gray-900 leading-snug mb-7 tracking-tight">
          {question.q}
        </h2>

        {/* Options */}
        <div className="flex flex-col gap-2.5 mb-7">
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
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm text-left transition-all"
                style={{
                  border: `1.5px solid ${selected ? "#9a2119" : "#ede8e5"}`,
                  background: selected ? "#fdf0ef" : "#fff",
                  color: selected ? "#9a2119" : "#1a1512",
                  fontWeight: selected ? 600 : 400,
                }}
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
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

        {/* Next button */}
        <button
          onClick={() =>
            isLast ? setCompleted(true) : setCurrent((c) => c + 1)
          }
          disabled={answers[current] === null}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-85"
          style={{ background: "#9a2119" }}
        >
          {isLast ? "Finish quiz" : "Next question"}
          <ArrowRightOutlined />
        </button>
      </div>
    );
  }

  // ── Catalog ───────────────────────────────────────────────────
  return (
    <div className="space-y-7">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-[#fdf0ef]"
      >
        ← Back
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Choose your quiz
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Test your knowledge and identify where to grow next.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quizCatalog.map((quiz, index) => (
          <div
            key={quiz.title}
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#fff",
              border: "1.5px solid #e8dcd9",
              boxShadow: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#9a2119";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(154,33,25,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8dcd9";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: "#9a2119", borderRadius: "16px 16px 0 0" }}
            />

            {/* Decorative circle */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-5 transition-all duration-300 group-hover:opacity-10 group-hover:scale-110"
              style={{ background: "#9a2119" }}
            />

            {/* Icon */}
            <div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-xl"
              style={{
                background: "#fdf0ef",
                color: "#9a2119",
              }}
            >
              {QUIZ_ICONS[index % QUIZ_ICONS.length]}
            </div>

            {/* Text */}
            <p
              className="relative text-[15px] font-bold mb-1.5 tracking-tight"
              style={{ color: "#1a1512" }}
            >
              {quiz.title}
            </p>
            <p
              className="relative text-[13px] leading-relaxed mb-5"
              style={{ color: "#6b6560" }}
            >
              {quiz.description}
            </p>

            {/* Footer */}
            <div className="relative flex items-center justify-between">
              <span
                className="text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full"
                style={{
                  background: "#fdf0ef",
                  color: "#9a2119",
                  border: "1px solid #f5cdc9",
                }}
              >
                {quiz.questions} questions
              </span>

              {/* Arrow button */}
              <button
                onClick={() => setActiveQuiz(index)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:scale-110"
                style={{
                  background: "#fdf0ef",
                  color: "#9a2119",
                  border: "1.5px solid #f5cdc9",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                  e.currentTarget.style.background = "#9a2119";
                  e.currentTarget.style.borderColor = "#9a2119";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#9a2119";
                  e.currentTarget.style.background = "#fdf0ef";
                  e.currentTarget.style.borderColor = "#f5cdc9";
                }}
              >
                <ArrowRightOutlined />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}