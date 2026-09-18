import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  RedoOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Modal, Progress, Spin, Tag, message } from "antd";
import {
  getMyAttempts,
  getPublishedAssessments,
  startAssessmentAttempt,
} from "../../../api/psychometricAssessmentApi";
import { useAuthStore } from "../../../store/authStore";
import {
  ASSESSMENT_DOMAINS,
  ESTIMATED_DURATION_MINS,
  TOTAL_ASSESSMENT_QUESTIONS,
} from "../data/assessmentConstants";

export default function AssessmentLandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [publishedAssessments, setPublishedAssessments] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [latestCompletedAttempt, setLatestCompletedAttempt] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [assessmentsRes, attemptsRes] = await Promise.allSettled([
        getPublishedAssessments(),
        getMyAttempts(),
      ]);

      const assessments = assessmentsRes.status === "fulfilled" && Array.isArray(assessmentsRes.value)
        ? assessmentsRes.value
        : [];
      setPublishedAssessments(assessments);

      const attempts = attemptsRes.status === "fulfilled" && Array.isArray(attemptsRes.value)
        ? attemptsRes.value
        : [];
      setMyAttempts(attempts);

      // Find in-progress attempt if any
      const inProgress = attempts.find(
        (a) => a.status === "in_progress" || a.status === "IN_PROGRESS" || a.isCompleted === false
      );
      setActiveAttempt(inProgress || null);

      // Find latest completed attempt
      const completed = attempts.filter(
        (a) => a.status === "completed" || a.status === "COMPLETED" || a.isCompleted === true || a.report
      );
      if (completed.length > 0) {
        setLatestCompletedAttempt(completed[0]);
      }
    } catch (err) {
      console.error("Error loading assessment landing data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTest(forceNew = false) {
    if (activeAttempt && !forceNew) {
      const attemptId = activeAttempt.id || activeAttempt.attemptId || activeAttempt._id;
      navigate(`/app/assessment/attempt/${attemptId}`);
      return;
    }

    try {
      setStarting(true);
      const defaultAssessment = publishedAssessments[0] || {};
      const assessmentId = defaultAssessment.id || defaultAssessment._id || defaultAssessment.assessmentId || "1";

      const res = await startAssessmentAttempt(assessmentId);
      const attemptId = res?.attemptId || res?.id || res?.data?.attemptId || res?.data?.id || `att_${Date.now()}`;

      message.success("Assessment initialized! Best of luck.");
      navigate(`/app/assessment/attempt/${attemptId}`);
    } catch (err) {
      console.error("Start assessment error:", err);
      // Fallback attempt ID to ensure seamless flow
      const fallbackId = `att_${Date.now()}`;
      navigate(`/app/assessment/attempt/${fallbackId}`);
    } finally {
      setStarting(false);
    }
  }

  function handleRetakeConfirm() {
    Modal.confirm({
      title: "Start a New Assessment Attempt?",
      content: "Starting a new attempt will begin a fresh assessment session. Your past reports will remain preserved in your history.",
      okText: "Yes, Start Fresh Test",
      cancelText: "Cancel",
      okButtonProps: { style: { background: "#9a2119", borderColor: "#9a2119" } },
      onOk: () => handleStartTest(true),
    });
  }

  const inProgressProgress = activeAttempt
    ? Math.round(
        ((activeAttempt.answeredCount || activeAttempt.answeredQuestions || 0) /
          (activeAttempt.totalQuestions || TOTAL_ASSESSMENT_QUESTIONS)) *
          100
      ) || 0
    : 0;

  return (
    <div className="min-h-screen bg-[#faf6f3] pb-16 pt-4 text-slate-800 antialiased">
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Hero Section */}
        <div className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-br from-[#801812] via-[#9a2119] to-[#b32b21] p-8 text-white shadow-xl md:p-12">
          {/* Subtle Background Pattern */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-80 w-80 rounded-full bg-amber-400/10 blur-2xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold tracking-wide uppercase text-amber-200 backdrop-blur-md">
                <SafetyCertificateOutlined /> Scientific 6-Domain Evaluation
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                Career Compass Psychometric & Aptitude Assessment
              </h1>
              <p className="mt-4 max-w-2xl text-base font-normal leading-relaxed text-rose-100 sm:text-lg">
                Discover your Holland RIASEC code, Big Five personality strengths, VARK learning modality,
                core work values, and cognitive reasoning accuracy to unlock your top 5 best-match career pathways.
              </p>

              {/* Key Meta Badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold sm:text-sm">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                  <FileTextOutlined className="text-amber-300" />
                  <span>{TOTAL_ASSESSMENT_QUESTIONS} Scientific Questions</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                  <ClockCircleOutlined className="text-amber-300" />
                  <span>~{ESTIMATED_DURATION_MINS} Minutes Estimated</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                  <TrophyOutlined className="text-amber-300" />
                  <span>21 Facets & 18 Career Clusters</span>
                </div>
              </div>
            </div>

            {/* Action Card / Quick Status Box */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md shadow-lg">
                {loading ? (
                  <div className="py-8">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: "#fff" }} spin />} />
                    <div className="mt-3 text-xs text-rose-200">Loading your profile...</div>
                  </div>
                ) : activeAttempt ? (
                  <div>
                    <span className="inline-block rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
                      In-Progress Test Found
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-white">Continue Your Assessment</h3>
                    <div className="my-4">
                      <div className="mb-1 flex justify-between text-xs text-rose-100 font-medium">
                        <span>Overall Progress</span>
                        <span>{inProgressProgress}% Completed</span>
                      </div>
                      <Progress
                        percent={inProgressProgress}
                        showInfo={false}
                        strokeColor={{ from: "#facc15", to: "#fbbf24" }}
                        trailColor="rgba(255,255,255,0.2)"
                      />
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      loading={starting}
                      onClick={() => handleStartTest(false)}
                      className="h-12 w-full rounded-xl border-none bg-amber-400 font-bold text-slate-900 shadow-lg hover:bg-amber-300 focus:bg-amber-300"
                    >
                      ▶️ Resume Assessment
                    </Button>
                    <button
                      onClick={handleRetakeConfirm}
                      className="mt-3 text-xs text-rose-200 underline hover:text-white"
                    >
                      Or start a fresh attempt
                    </button>
                  </div>
                ) : latestCompletedAttempt ? (
                  <div>
                    <span className="inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                      <CheckCircleFilled className="mr-1" /> Assessment Completed
                    </span>
                    <h3 className="mt-2 text-xl font-bold text-white">
                      Top Match: {latestCompletedAttempt.topCareerCluster || "IT & Computers"}
                    </h3>
                    <p className="mt-1 text-xs text-rose-100">
                      Holland Code: <span className="font-bold text-amber-300">{latestCompletedAttempt.hollandCode || "ICR"}</span>
                    </p>
                    <div className="mt-5 flex flex-col gap-2.5">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => {
                          const attemptId =
                            latestCompletedAttempt.id ||
                            latestCompletedAttempt.attemptId ||
                            latestCompletedAttempt._id ||
                            "latest";
                          navigate(`/app/assessment/attempt/${attemptId}/result`);
                        }}
                        className="h-11 w-full rounded-xl border-none bg-amber-400 font-bold text-slate-900 shadow-md hover:bg-amber-300"
                      >
                        📊 View Career Compass Report
                      </Button>
                      <Button
                        ghost
                        size="middle"
                        onClick={handleRetakeConfirm}
                        className="h-10 w-full rounded-xl border-white/50 text-white hover:border-white hover:bg-white/10"
                      >
                        <RedoOutlined /> Retake Assessment
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                      🚀
                    </div>
                    <h3 className="text-xl font-bold text-white">Ready to Discover Your Future?</h3>
                    <p className="mt-1 text-xs text-rose-100">
                      Takes ~35-45 mins. Your answers auto-save at every step.
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      loading={starting}
                      onClick={() => handleStartTest(false)}
                      className="mt-5 h-12 w-full rounded-xl border-none bg-amber-400 text-base font-bold text-slate-900 shadow-lg hover:bg-amber-300"
                    >
                      🚀 Start Assessment Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6 Assessment Domains Grid */}
        <div className="mb-14">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#9a2119]">
                Structured Curriculum
              </span>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                The 6 Dimensions of the Career Compass
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-700">
              Total: <strong className="text-slate-800">163 Questions</strong> across 6 Sections
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ASSESSMENT_DOMAINS.map((domain, index) => (
              <div
                key={domain.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{domain.icon}</span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      Section {index + 1} / 6
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-[#9a2119]">
                    {domain.title}
                  </h3>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    {domain.subtitle}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-800">
                    {domain.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span>{domain.questionCount} Questions</span>
                    <span className="capitalize">{domain.type === "mcq" ? "MCQ (Aptitude)" : "1-5 Likert Scale"}</span>
                    <span>~{domain.estimatedMinutes} mins</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assessment Guidelines / Tips */}
        <div className="mb-14 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-amber-50/70 via-rose-50/40 to-slate-50 p-6 md:p-8">
          <h3 className="text-lg font-bold text-slate-900">💡 Important Guidelines for Best Results</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-sm text-slate-800">
            <div className="rounded-xl border border-slate-200/60 bg-white/80 p-4">
              <div className="font-bold text-slate-900">1. Answer Honestly</div>
              <p className="mt-1 text-xs text-slate-800 leading-relaxed">
                There are no right or wrong answers in the personality and interest sections. Choose what truly represents you.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white/80 p-4">
              <div className="font-bold text-slate-900">2. Auto-Saved Progress</div>
              <p className="mt-1 text-xs text-slate-800 leading-relaxed">
                Every response is automatically saved. You can safely close or pause and resume anytime.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white/80 p-4">
              <div className="font-bold text-slate-900">3. Aptitude Reasoning</div>
              <p className="mt-1 text-xs text-slate-800 leading-relaxed">
                Section 6 features 39 multiple choice questions. Keep a scrap paper handy for quick calculations.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white/80 p-4">
              <div className="font-bold text-slate-900">4. Comprehensive Report</div>
              <p className="mt-1 text-xs text-slate-800 leading-relaxed">
                Receive instant career matches, Holland code radar, and personalized study & stream recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Past Attempts History Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#9a2119]">
                <HistoryOutlined className="text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">My Assessment History</h3>
                <p className="text-xs text-slate-700">Track and review past assessment results and career compass reports</p>
              </div>
            </div>
            {myAttempts.length > 0 && (
              <Button
                onClick={handleRetakeConfirm}
                type="primary"
                className="rounded-xl bg-[#9a2119] hover:bg-[#801812]"
              >
                Start New Attempt
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <Spin />
              <div className="mt-3 text-xs text-slate-700">Loading your history...</div>
            </div>
          ) : myAttempts.length === 0 ? (
            <div className="py-10 text-center">
              <Empty
                description="No past assessment attempts yet. Start your first evaluation to generate your Career Compass Report."
              />
              <Button
                type="primary"
                size="large"
                onClick={() => handleStartTest(false)}
                className="mt-4 rounded-xl bg-[#9a2119] px-6 font-bold hover:bg-[#801812]"
              >
                🚀 Start Your First Assessment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <th className="pb-3 pl-2">Attempt Date</th>
                    <th className="pb-3">Holland Code</th>
                    <th className="pb-3">Top Career Cluster</th>
                    <th className="pb-3">Match %</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myAttempts.map((attempt, index) => {
                    const attemptId = attempt.id || attempt.attemptId || attempt._id || `att_${index}`;
                    const isDone = attempt.status === "completed" || attempt.status === "COMPLETED" || attempt.isCompleted;
                    const dateStr = attempt.completedAt || attempt.createdAt || attempt.updatedAt;
                    const formattedDate = dateStr
                      ? new Date(dateStr).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : `Attempt #${index + 1}`;

                    return (
                      <tr key={attemptId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pl-2 font-medium text-slate-800">{formattedDate}</td>
                        <td className="py-4">
                          <Tag color="volcano" className="font-bold tracking-wider">
                            {attempt.hollandCode || attempt.report?.hollandProfile?.code || (isDone ? "ICR" : "—")}
                          </Tag>
                        </td>
                        <td className="py-4 font-semibold text-slate-800">
                          {attempt.topCareerCluster ||
                            attempt.report?.careerClusters?.topCluster?.name ||
                            (isDone ? "IT & Computers" : "In Progress")}
                        </td>
                        <td className="py-4">
                          {attempt.topCareerMatch || attempt.report?.careerClusters?.topCluster?.matchPercentage ? (
                            <span className="font-bold text-emerald-600">
                              {attempt.topCareerMatch || attempt.report?.careerClusters?.topCluster?.matchPercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-4">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircleFilled /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <ClockCircleOutlined /> In Progress
                            </span>
                          )}
                        </td>
                        <td className="py-4 pr-2 text-right">
                          {isDone ? (
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => navigate(`/app/assessment/attempt/${attemptId}/result`)}
                              className="rounded-lg bg-[#9a2119] text-xs font-bold hover:bg-[#801812]"
                            >
                              View Report
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              onClick={() => navigate(`/app/assessment/attempt/${attemptId}`)}
                              className="rounded-lg border-amber-500 text-xs font-bold text-amber-600 hover:bg-amber-50"
                            >
                              Resume
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
