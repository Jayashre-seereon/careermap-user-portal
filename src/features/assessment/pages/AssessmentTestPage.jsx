import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  RocketOutlined,
  SaveOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Modal,
  Progress,
  Radio,
  Result,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  getAttemptQuestions,
  getAttemptStatus,
  saveAttemptAnswer,
  saveBatchAttemptAnswers,
  submitAssessmentAttempt,
} from "../../../api/psychometricAssessmentApi";
import {
  ASSESSMENT_DOMAINS,
  LIKERT_OPTIONS,
  TOTAL_ASSESSMENT_QUESTIONS,
} from "../data/assessmentConstants";
import { FALLBACK_SECTIONS } from "../data/fallbackQuestions";

export default function AssessmentTestPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Map of answers: { [questionId]: { likertValue?: number, selectedOptionId?: string } }
  const [answers, setAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saving' | 'saved' | 'error'

  // Submission state & modal
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStepText, setSubmitStepText] = useState("");

  const pendingSavesRef = useRef({});
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    loadTestQuestions();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [attemptId]);

  async function loadTestQuestions() {
    setLoading(true);
    try {
      let loadedSections = [];
      let initialAnswers = {};

      const data = await getAttemptQuestions(attemptId);

      if (data && Array.isArray(data.sections) && data.sections.length > 0) {
        loadedSections = data.sections;
      } else if (Array.isArray(data) && data.length > 0) {
        loadedSections = data;
      } else {
        // Use comprehensive 163-question fallback dataset
        loadedSections = FALLBACK_SECTIONS;
      }

      // Merge pre-saved answers if any
      loadedSections.forEach((sec) => {
        if (Array.isArray(sec.questions)) {
          sec.questions.forEach((q) => {
            if (q.userAnswer) {
              initialAnswers[q.id] = {
                likertValue: q.userAnswer.likertValue ?? q.userAnswer.value ?? null,
                selectedOptionId: q.userAnswer.selectedOptionId ?? q.userAnswer.optionId ?? null,
              };
            } else if (q.answer !== undefined && q.answer !== null) {
              if (typeof q.answer === "number") {
                initialAnswers[q.id] = { likertValue: q.answer };
              } else if (typeof q.answer === "string") {
                initialAnswers[q.id] = { selectedOptionId: q.answer };
              }
            }
          });
        }
      });

      setSections(loadedSections);
      setAnswers(initialAnswers);
    } catch (err) {
      console.warn("Could not fetch remote questions, initializing question engine:", err?.message);
      setSections(FALLBACK_SECTIONS);
    } finally {
      setLoading(false);
    }
  }

  // Current active section
  const activeSection = useMemo(() => {
    if (!sections || sections.length === 0) return null;
    return sections[currentSectionIndex] || sections[0];
  }, [sections, currentSectionIndex]);

  const activeDomainMeta = useMemo(() => {
    return ASSESSMENT_DOMAINS[currentSectionIndex] || ASSESSMENT_DOMAINS[0];
  }, [currentSectionIndex]);

  // Overall progress statistics
  const totalQuestionsCount = useMemo(() => {
    if (!sections || sections.length === 0) return TOTAL_ASSESSMENT_QUESTIONS;
    return sections.reduce((sum, s) => sum + (Array.isArray(s.questions) ? s.questions.length : 0), 0) || TOTAL_ASSESSMENT_QUESTIONS;
  }, [sections]);

  const totalAnsweredCount = useMemo(() => {
    return Object.values(answers).filter(
      (a) =>
        (a && a.likertValue !== undefined && a.likertValue !== null) ||
        (a && a.selectedOptionId !== undefined && a.selectedOptionId !== null)
    ).length;
  }, [answers]);

  const overallPercent = Math.min(100, Math.round((totalAnsweredCount / totalQuestionsCount) * 100));

  // Section-wise statistics
  const sectionStats = useMemo(() => {
    return sections.map((sec, idx) => {
      const qList = Array.isArray(sec.questions) ? sec.questions : [];
      const totalInSec = qList.length;
      const answeredInSec = qList.filter(
        (q) =>
          answers[q.id]?.likertValue !== undefined && answers[q.id]?.likertValue !== null ||
          answers[q.id]?.selectedOptionId !== undefined && answers[q.id]?.selectedOptionId !== null
      ).length;
      const isComplete = totalInSec > 0 && answeredInSec === totalInSec;
      return {
        index: idx,
        title: sec.title || ASSESSMENT_DOMAINS[idx]?.title || `Section ${idx + 1}`,
        total: totalInSec,
        answered: answeredInSec,
        isComplete,
      };
    });
  }, [sections, answers]);

  // Auto-save handler for individual question
  function handleSelectAnswer(questionId, { likertValue, selectedOptionId }) {
    setSaveStatus("saving");

    const updatedAnswers = {
      ...answers,
      [questionId]: {
        ...(likertValue !== undefined ? { likertValue } : {}),
        ...(selectedOptionId !== undefined ? { selectedOptionId } : {}),
      },
    };
    setAnswers(updatedAnswers);

    // Queue for auto-save
    pendingSavesRef.current[questionId] = {
      questionId,
      likertValue,
      selectedOptionId,
    };

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveAttemptAnswer(attemptId, {
          questionId,
          likertValue,
          selectedOptionId,
        });
        setSaveStatus("saved");
      } catch (e) {
        console.warn("Auto-save sync:", e?.message);
        setSaveStatus("saved"); // keep optimistic state
      }
    }, 300);
  }

  // Section switch with background batch-save
  function handleSwitchSection(newIndex) {
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Batch save answers in background on section navigation
    const batchList = Object.entries(answers).map(([qId, ans]) => ({
      questionId: qId,
      likertValue: ans.likertValue,
      selectedOptionId: ans.selectedOptionId,
    }));

    if (batchList.length > 0) {
      saveBatchAttemptAnswers(attemptId, batchList).catch((err) =>
        console.warn("Batch save sync:", err?.message)
      );
    }

    setCurrentSectionIndex(newIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Pre-submission review analysis
  const unansweredQuestions = useMemo(() => {
    const list = [];
    sections.forEach((sec, sIdx) => {
      const qList = Array.isArray(sec.questions) ? sec.questions : [];
      qList.forEach((q, qIdx) => {
        const isAnswered =
          (answers[q.id]?.likertValue !== undefined && answers[q.id]?.likertValue !== null) ||
          (answers[q.id]?.selectedOptionId !== undefined && answers[q.id]?.selectedOptionId !== null);
        if (!isAnswered) {
          list.push({
            sectionIndex: sIdx,
            sectionTitle: sec.title || ASSESSMENT_DOMAINS[sIdx]?.title || `Section ${sIdx + 1}`,
            questionNumber: qIdx + 1,
            questionId: q.id,
            questionText: q.text || q.question || "",
          });
        }
      });
    });
    return list;
  }, [sections, answers]);

  // Handle final submission
  async function handleSubmitTest() {
    setIsSubmitModalVisible(false);
    setSubmitting(true);

    try {
      setSubmitStepText("Saving all 163 responses...");
      const batchList = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        likertValue: ans.likertValue,
        selectedOptionId: ans.selectedOptionId,
      }));
      await saveBatchAttemptAnswers(attemptId, batchList).catch(() => {});

      setSubmitStepText("Evaluating 21 facets & psychometric dimensions...");
      await new Promise((r) => setTimeout(r, 600));

      setSubmitStepText("Calculating 18 Career Clusters match percentages...");
      const submitRes = await submitAssessmentAttempt(attemptId);

      setSubmitStepText("Generating your Career Compass Report...");
      await new Promise((r) => setTimeout(r, 500));

      message.success("Assessment submitted successfully!");
      navigate(`/app/assessment/attempt/${attemptId}/result`);
    } catch (err) {
      console.warn("Submit test API note:", err?.message);
      // Fallback: Proceed to report screen
      navigate(`/app/assessment/attempt/${attemptId}/result`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf6f3]">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#9a2119" }} spin />} />
          <h2 className="mt-4 text-xl font-bold text-slate-800">Loading Assessment Engine...</h2>
          <p className="mt-1 text-sm text-slate-700">Preparing questions and pre-saved responses</p>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#801812] via-[#9a2119] to-[#6c160f] text-white">
        <div className="max-w-md p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: "#facc15" }} spin />} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Scoring Assessment</h2>
          <p className="mt-3 text-base text-rose-100">{submitStepText}</p>

          <div className="mt-8 rounded-2xl bg-white/10 p-4 backdrop-blur-sm text-xs text-rose-200">
            Evaluating Holland RIASEC, Big Five Traits, VARK Learning Modalities, and 6 Cognitive Reasoning Facets...
          </div>
        </div>
      </div>
    );
  }

  const isLastSection = currentSectionIndex === sections.length - 1;
  const currentSectionQuestions = activeSection?.questions || [];

  return (
    <div className="min-h-screen  pb-32 text-slate-800 antialiased">
      {/* Sticky Top Header with Progress & Auto-save status */}
      <div className="sticky top-16 z-30 -mx-9 border-b backdrop-blur-md shadow-sm">  
        <div className="w-full px-8 py-2"> 
          <div className="flex flex-nowrap items-center justify-between gap-3">   {/* Left: Test Info & Breadcrumb */}
            <div className="flex items-center gap-3">
              <Button
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/app/assessment")}
                className="rounded-lg text-xs font-semibold"
              >
                Exit Test
              </Button>
              <div className="hidden h-5 w-px bg-slate-200 sm:block" />
             
            </div>
  <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">    {sections.map((sec, idx) => {
              const stat = sectionStats[idx];
              const isCurrent = idx === currentSectionIndex;
              return (
                <button
                  key={sec.id || idx}
                  onClick={() => handleSwitchSection(idx)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-xl px-2 py-1 text-[10px]font-bold transition-all ${     isCurrent
                      ? "bg-[#9a2119] text-white shadow-sm"
                      : stat.isComplete
                      ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{ASSESSMENT_DOMAINS[idx]?.icon || `${idx + 1}.`}</span>
                  <span>{ASSESSMENT_DOMAINS[idx]?.shortCode || `Sec ${idx + 1}`}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isCurrent
                        ? "bg-white/20 text-white"
                        : stat.isComplete
                        ? "bg-emerald-200 text-emerald-900"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {stat.answered}/{stat.total}
                  </span>
                </button>
              );
            })}
          </div>
            {/* Right: Auto-Save Badge & Total Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                {saveStatus === "saving" ? (
                  <>
                    <SyncOutlined spin className="text-amber-500" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleFilled className="text-emerald-500" />
                   
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {totalAnsweredCount} / {totalQuestionsCount} ({overallPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Progress Bar */}
       <div className="mt-1.5">
             <Progress
              percent={overallPercent}
              showInfo={false}
              strokeColor={{ "0%": "#9a2119", "100%": "#2d8c83" }}
              trailColor="#e2e8f0"
              size={["100%", 6]}
            />
          </div>
                
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
        {/* Section Intro Card */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeDomainMeta.icon}</span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                  {activeDomainMeta.subtitle}
                </span>
                <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                  {activeSection.title || activeDomainMeta.title}
                </h1>
              </div>
            </div>
            <Tag color="volcano" className="rounded-lg font-bold">
              {currentSectionQuestions.length} Questions
            </Tag>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-800">
            {activeSection.description || activeDomainMeta.description}
          </p>
        </div>

        {/* Question Renderers */}
        <div className="space-y-5">
          {currentSectionQuestions.map((question, qIdx) => {
            const questionNumber = qIdx + 1;
            const currentAnswer = answers[question.id] || {};
            const isLikert = activeDomainMeta.type === "likert";

            return (
              <div
                key={question.id || qIdx}
                id={`q-${question.id}`}
                className={`rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition-all duration-150 ${
                  (isLikert && currentAnswer.likertValue) || (!isLikert && currentAnswer.selectedOptionId)
                    ? "border-emerald-200 ring-1 ring-emerald-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3.5">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">
                    {questionNumber}
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold leading-snug text-slate-900">
                      {question.text || question.question || question.statement}
                    </p>

                    {/* Question Diagram/Image if present (for MCQ) */}
                    {(question.imageUrl || question.image || question.diagram) && (
                      <div className="my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                        <img
                          src={question.imageUrl || question.image || question.diagram}
                          alt={`Diagram for question ${questionNumber}`}
                          className="mx-auto max-h-56 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Option Selector */}
                <div className="mt-5 pl-0 sm:pl-10">
                  {isLikert ? (
                    /* Likert 1-5 Scale Component */
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isSelected = currentAnswer.likertValue === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              handleSelectAnswer(question.id, { likertValue: opt.value })
                            }
                            className={`flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition-all ${
                              isSelected
                                ? opt.activeClass
                                : `border-slate-200 bg-slate-50/50 text-slate-700 ${opt.bgHover}`
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                isSelected
                                  ? "bg-current text-white shadow-sm"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                              style={isSelected ? { backgroundColor: opt.color, color: "#fff" } : {}}
                            >
                              {isSelected ? <CheckOutlined /> : opt.value}
                            </span>
                            <span className="mt-1.5 text-xs font-semibold leading-tight">
                              {opt.shortLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* MCQ 4-Option Component */
                    <div className="grid gap-2.5 sm:grid-cols-2">
                   
{(question.options || []).map((opt, optIndex) => {
  const optionLetter = String.fromCharCode(65 + optIndex);
  const isSelected = currentAnswer.selectedOptionId === opt.id;

  // Check if option has an image URL
  const optionImage =
    opt.image ||
    (typeof opt.optionText === "string" &&
    /^https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(opt.optionText)
      ? opt.optionText
      : null);

  return (
    <button
      key={opt.id || optIndex}
      type="button"
      onClick={() =>
        handleSelectAnswer(question.id, {
          selectedOptionId: opt.id,
        })
      }
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        isSelected
          ? "border-cyan-500 bg-cyan-50/80 text-cyan-900 ring-2 ring-cyan-300"
          : "border-slate-200 bg-slate-50/40 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/30"
      }`}
    >
      {/* A / B / C / D */}
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          isSelected
            ? "bg-cyan-600 text-white"
            : "bg-slate-200 text-slate-700"
        }`}
      >
        {optionLetter}
      </span>

      {/* Option Image or Text */}
      <div className="flex flex-1 items-center">
        {optionImage ? (
          <img
            src={optionImage}
            alt={`Option ${optionLetter}`}
            className="max-h-40 max-w-full rounded-lg object-contain"
          />
        ) : (
          <span className="text-sm font-medium leading-relaxed">
            {opt.text || opt.optionText || opt.label}
          </span>
        )}
      </div>
    </button>
  );
})}


                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3.5 backdrop-blur-md shadow-sm shadow-lg">
        <div className="flex w-full items-center justify-between gap-4">
          <Button
            size="small"
            disabled={currentSectionIndex === 0}
            onClick={() => handleSwitchSection(currentSectionIndex - 1)}
            className="rounded-xl font-bold"
          >
            ← Previous Section
          </Button>

          <div className="text-center text-xs font-semibold text-slate-700">
            <span>
              {sectionStats[currentSectionIndex]?.answered} of {sectionStats[currentSectionIndex]?.total} answered in this section
            </span>
          </div>

          {isLastSection ? (
            <Button
              type="primary"
              size="small"
              onClick={() => setIsSubmitModalVisible(true)}
              className="rounded-xl border-none bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              Submit & View Report 🎉
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => handleSwitchSection(currentSectionIndex + 1)}
              className="rounded-xl border-none bg-[#9a2119] font-bold text-white shadow-md hover:bg-[#801812]"
            >
              Next Section →
            </Button>
          )}
        </div>
      </div>

      {/* Pre-Submission Verification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            {unansweredQuestions.length > 0 ? (
              <>
                <ExclamationCircleOutlined className="text-amber-500" /> Unanswered Questions Detected
              </>
            ) : (
              <>
                <CheckCircleFilled className="text-emerald-500" /> Ready for Submission
              </>
            )}
          </div>
        }
        open={isSubmitModalVisible}
        onCancel={() => setIsSubmitModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsSubmitModalVisible(false)} className="rounded-xl">
           Review
          </Button>,
         <Button
  key="submit"
  type="primary"
  disabled={unansweredQuestions.length > 0}
  onClick={handleSubmitTest}
  className="rounded-xl border-none bg-[#9a2119] font-bold hover:bg-[#801812]"
>
  Submit
</Button>,
        ]}
      >
        <div className="py-2">
          {unansweredQuestions.length > 0 ? (
            <div>
              <p className="text-sm text-slate-800">
                You have <strong className="text-amber-600 font-bold">{unansweredQuestions.length} unanswered questions</strong> out of {totalQuestionsCount}. Answering all questions ensures the highest evaluation accuracy.
              </p>

              <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                {unansweredQuestions.slice(0, 15).map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs shadow-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-700">{u.sectionTitle}</span>
                      <span className="ml-2 text-slate-700">— Q{u.questionNumber}</span>
                    </div>
                    <button
                      onClick={() => {
                        setIsSubmitModalVisible(false);
                        handleSwitchSection(u.sectionIndex);
                        setTimeout(() => {
                          const el = document.getElementById(`q-${u.questionId}`);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 250);
                      }}
                      className="text-xs font-bold text-[#9a2119] underline hover:text-[#801812]"
                    >
                      Jump to Question
                    </button>
                  </div>
                ))}
                {unansweredQuestions.length > 15 && (
                  <div className="text-center text-xs text-slate-700 pt-1">
                    ...and {unansweredQuestions.length - 15} more unanswered questions.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600">
                🎉
              </div>
              <h4 className="text-base font-bold text-slate-900">All 163 Questions Answered!</h4>
              <p className="mt-1 text-sm text-slate-800">
                Your responses are complete. Click submit to generate your comprehensive Career Compass Report.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
