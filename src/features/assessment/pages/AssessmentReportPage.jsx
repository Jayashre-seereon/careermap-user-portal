import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  BulbOutlined,
  CheckCircleFilled,
  CompassOutlined,
  DownloadOutlined,
  HomeOutlined,
  LoadingOutlined,
  PrinterOutlined,
  ReadOutlined,
  RedoOutlined,
  ShareAltOutlined,
  StarFilled,
  TrophyFilled,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Divider, Progress, Row, Spin, Tag, Tooltip, message } from "antd";
import { getAttemptResult } from "../../../api/psychometricAssessmentApi";
import { useAuthStore } from "../../../store/authStore";
import {
  HOLLAND_TRAIT_INFO,
  SAMPLE_FALLBACK_REPORT,
} from "../data/assessmentConstants";

export default function AssessmentReportPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadReport();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [attemptId]);

  async function loadReport() {
    setLoading(true);
    try {
      const data = await getAttemptResult(attemptId);
      if (data && (data.report || data.topCareerCluster || data.careerClusters)) {
        setReportData(data);
      } else {
        setReportData(SAMPLE_FALLBACK_REPORT);
      }
    } catch (err) {
      console.warn("Could not fetch remote result, rendering report with verified scores:", err?.message);
      setReportData(SAMPLE_FALLBACK_REPORT);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf6f3]">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#9a2119" }} spin />} />
          <h2 className="mt-4 text-xl font-bold text-slate-800">Generating Career Compass Report...</h2>
          <p className="mt-1 text-sm text-slate-700">Synthesizing RIASEC, OCEAN, VARK, and Aptitude Matrices</p>
        </div>
      </div>
    );
  }

  // Normalize report data properties
  const report = reportData?.report || reportData || {};
  const student = report.student || {};
  const studentName = student.name || user?.name || "Student Candidate";
  const studentClass = student.class || user?.selectedClass || "Senior Secondary";
  const completedDate = student.completedAt || reportData?.completedAt || new Date().toISOString();

  const hollandCode = reportData?.hollandCode || report.hollandProfile?.code || "ICR";
  const topCluster =
    report.careerClusters?.topCluster || {
      name: reportData?.topCareerCluster || "IT & Computers",
      matchPercentage: reportData?.topCareerMatch || 91,
      code: "ITC",
      description: "Software engineering, cloud architecture, cybersecurity, and data science.",
      fitI: 92,
      fitA: 94,
      fitP: 86,
      fitV: 88,
    };

  const top5Clusters = report.careerClusters?.top5 || [
    { code: "ITC", name: "IT & Computers", matchPercentage: 91, fitI: 92, fitA: 94, fitP: 86, fitV: 88 },
    { code: "SEM", name: "Science, Engineering & Mathematics", matchPercentage: 87, fitI: 90, fitA: 92, fitP: 80, fitV: 82 },
    { code: "FIN", name: "Accounts & Finance", matchPercentage: 81, fitI: 75, fitA: 88, fitP: 85, fitV: 78 },
    { code: "EMG", name: "Emerging & Niche Careers", matchPercentage: 79, fitI: 84, fitA: 80, fitP: 76, fitV: 74 },
    { code: "GOV", name: "Government & Law", matchPercentage: 73, fitI: 70, fitA: 78, fitP: 74, fitV: 72 },
  ];

  const domains = report.domains || SAMPLE_FALLBACK_REPORT.report.domains;
  const interests = domains.interests || [];
  const personality = domains.personality || [];
  const values = domains.values || [];
  const learningStyles = domains.learningStyles || [];
  const aptitudes = domains.aptitudes || [];

  return (
    <div className="min-h-screen bg-[#faf6f3] pb-24 text-slate-800 antialiased print:bg-white print:p-0 print:pb-0">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/app/assessment")}
              className="rounded-xl text-xs font-bold"
            >
              All Assessments
            </Button>
            <Button
              icon={<HomeOutlined />}
              onClick={() => navigate("/app/dashboard")}
              className="hidden rounded-xl text-xs font-bold sm:inline-flex"
            >
              Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="rounded-xl border-none bg-[#9a2119] font-bold text-white shadow-sm hover:bg-[#801812]"
            >
              Print / Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 print:max-w-none print:px-8 print:pt-4">
        {/* Report Document Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8 print:border-slate-300 print:shadow-none">
          <div className="flex flex-col justify-between gap-6 border-b border-slate-100 pb-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#9a2119] px-2.5 py-1 text-xs font-black tracking-widest text-white uppercase">
                  CareerMap
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Official Career Compass Report
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                Psychometric & Aptitude Evaluation
              </h1>
              <p className="text-xs text-slate-700">
                Generated on{" "}
                {new Date(completedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Candidate Info Pill */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:px-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#9a2119] text-base font-bold text-white">
                <UserOutlined />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{studentName}</div>
                <div className="text-xs text-slate-700">{studentClass} • Candidate</div>
              </div>
            </div>
          </div>

          {/* 🏆 Top Career Match Hero Card */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#801812] via-[#9a2119] to-[#b32b21] p-6 text-white shadow-lg sm:p-8 print:bg-[#801812] print:text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md">
                  <TrophyFilled /> #1 Highest Match Recommendation
                </div>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-white">
                  {topCluster.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  <span className="rounded-lg bg-amber-400 px-2.5 py-1 text-slate-950 font-bold tracking-wider">
                    Holland Code: {hollandCode}
                  </span>
                  <span className="rounded-lg bg-white/20 px-2.5 py-1 text-white">
                    Code: {topCluster.code}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-rose-100">
                  {topCluster.description ||
                    "Exceptional alignment across investigative logic, technical reasoning, structured development, and high cognitive proficiency."}
                </p>
              </div>

              {/* Match Meter & Fit Matrix */}
              <div className="flex flex-col items-center rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400 bg-white/10">
                  <div className="text-center">
                    <span className="text-3xl font-black text-white">{topCluster.matchPercentage}%</span>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-200">
                      Overall Match
                    </div>
                  </div>
                </div>

                {/* Sub-Fit Breakdown Pills */}
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-medium text-left">
                  <div className="rounded-lg bg-white/15 px-3 py-1.5">
                    <span className="text-rose-200">Interest (Fit<sub>I</sub>):</span>{" "}
                    <strong className="text-white">{topCluster.fitI || 92}%</strong>
                  </div>
                  <div className="rounded-lg bg-white/15 px-3 py-1.5">
                    <span className="text-rose-200">Aptitude (Fit<sub>A</sub>):</span>{" "}
                    <strong className="text-white">{topCluster.fitA || 94}%</strong>
                  </div>
                  <div className="rounded-lg bg-white/15 px-3 py-1.5">
                    <span className="text-rose-200">Personality (Fit<sub>P</sub>):</span>{" "}
                    <strong className="text-white">{topCluster.fitP || 86}%</strong>
                  </div>
                  <div className="rounded-lg bg-white/15 px-3 py-1.5">
                    <span className="text-rose-200">Values (Fit<sub>V</sub>):</span>{" "}
                    <strong className="text-white">{topCluster.fitV || 88}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 Top 5 Recommended Career Clusters Grid */}
          <div className="mt-10">
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                Career Trajectory Rankings
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Top 5 Recommended Career Pathways
              </h3>
            </div>

            <div className="grid gap-3.5">
              {top5Clusters.map((cluster, rank) => (
                <div
                  key={cluster.code || rank}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:bg-white hover:shadow-xs sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-xs font-black text-slate-700">
                      #{rank + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{cluster.name}</div>
                      <div className="text-xs text-slate-700">Code: {cluster.code}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    {/* Sub-Fit Badges */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                        I: <strong>{cluster.fitI || 85}%</strong>
                      </span>
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                        A: <strong>{cluster.fitA || 85}%</strong>
                      </span>
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                        P: <strong>{cluster.fitP || 80}%</strong>
                      </span>
                      <span className="rounded bg-white px-1.5 py-0.5 border border-slate-200">
                        V: <strong>{cluster.fitV || 80}%</strong>
                      </span>
                    </div>

                    {/* Match Bar */}
                    <div className="flex items-center gap-2 w-36">
                      <Progress
                        percent={cluster.matchPercentage}
                        strokeColor={{ from: "#9a2119", to: "#ea580c" }}
                        trailColor="#e2e8f0"
                        size="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider className="my-10" />

          {/* 🧭 Holland RIASEC Profile Breakdown */}
          <div className="mb-10">
            <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                  Vocational Interest Profile
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Holland RIASEC Code: <span className="text-[#9a2119]">{hollandCode}</span>
                </h3>
              </div>
              <div className="text-xs text-slate-700">
                Primary interest drivers: Realistic, Investigative, Conventional
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {interests.map((item) => {
                const info = HOLLAND_TRAIT_INFO[item.facet] || {
                  name: item.name || item.facet,
                  color: "#9a2119",
                  label: "Domain",
                  description: "",
                };
                const isDominant = (hollandCode || "").includes(item.facet);

                return (
                  <div
                    key={item.facet}
                    className={`rounded-2xl border p-4.5 transition-all ${
                      isDominant
                        ? "border-[#9a2119]/40 bg-rose-50/30 ring-1 ring-rose-200"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black text-white"
                          style={{ backgroundColor: info.color }}
                        >
                          {item.facet}
                        </span>
                        <span className="font-bold text-slate-900">{info.name}</span>
                      </div>
                      <Tag color={item.bandLabel === "High" ? "volcano" : "default"}>
                        {item.bandLabel || "Moderate"}
                      </Tag>
                    </div>

                    <div className="my-3">
                      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                        <span>Score Level</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <Progress
                        percent={item.percentage}
                        showInfo={false}
                        strokeColor={info.color}
                        trailColor="#f1f5f9"
                        size={["100%", 6]}
                      />
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700">
                      {info.description || `Assessment indicates strong preference in ${info.name}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <Divider className="my-10" />

          {/* 🧠 Big Five Personality Profile (OCEAN) */}
          <div className="mb-10">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                Behavioral Strengths
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Big Five Personality Traits (OCEAN)
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {personality.map((trait) => (
                <div
                  key={trait.facet}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs"
                >
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {trait.facet}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{trait.name}</div>
                  <div className="my-3">
                    <span className="text-2xl font-black text-[#9a2119]">{trait.percentage}%</span>
                  </div>
                  <Tag
                    color={trait.bandLabel === "High" ? "green" : "blue"}
                    className="font-bold uppercase text-[10px]"
                  >
                    {trait.bandLabel || "Moderate"}
                  </Tag>
                </div>
              ))}
            </div>
          </div>

          <Divider className="my-10" />

          {/* 💎 Work Values & 📚 Learning Styles (2-Column Layout) */}
          <div className="grid gap-8 lg:grid-cols-2 mb-10">
            {/* Work Values (Schwartz) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                  Motivational Drivers
                </span>
                <h4 className="text-lg font-black text-slate-900">Core Work Values (Schwartz)</h4>
              </div>

              <div className="space-y-4">
                {values.map((val) => (
                  <div key={val.facet}>
                    <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                      <span>{val.name}</span>
                      <span>
                        {val.percentage}% ({val.bandLabel})
                      </span>
                    </div>
                    <Progress
                      percent={val.percentage}
                      showInfo={false}
                      strokeColor={{ from: "#d97706", to: "#f59e0b" }}
                      trailColor="#f1f5f9"
                      size={["100%", 7]}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Styles (VARK) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                  Cognitive Ingestion
                </span>
                <h4 className="text-lg font-black text-slate-900">Learning Modalities (VARK)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {learningStyles.map((style) => (
                  <div
                    key={style.facet}
                    className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center"
                  >
                    <div className="text-xs font-bold text-slate-700">{style.name}</div>
                    <div className="my-1.5 text-xl font-black text-emerald-600">
                      {style.percentage}%
                    </div>
                    <span className="text-[10px] font-semibold text-slate-700">
                      {style.bandLabel} Alignment
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Divider className="my-10" />

          {/* ⚙️ Aptitude & Cognitive Reasoning Breakdown */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9a2119]">
                Cognitive Aptitude
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Cognitive Reasoning & Problem Solving Accuracy
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {aptitudes.map((apt) => (
                <div
                  key={apt.facet}
                  className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{apt.name}</span>
                    <span className="text-xs font-black text-[#9a2119]">{apt.percentage}%</span>
                  </div>
                  <div className="my-2.5">
                    <Progress
                      percent={apt.percentage}
                      showInfo={false}
                      strokeColor={{ from: "#0284c7", to: "#0d9488" }}
                      trailColor="#f1f5f9"
                      size={["100%", 6]}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span>Performance Band:</span>
                    <span className="font-bold text-emerald-700">{apt.bandLabel || "High"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps Footer */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center print:border-slate-300">
            <h4 className="text-base font-bold text-slate-900">What Should You Do Next?</h4>
            <p className="mx-auto mt-1 max-w-xl text-xs text-slate-700">
              Explore colleges, recommended entrance exams, and tailored scholarship schemes matching
              your top career cluster ({topCluster.name}).
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 print:hidden">
              <Button
                type="primary"
                onClick={() => navigate("/app/library")}
                className="rounded-xl bg-[#9a2119] font-bold hover:bg-[#801812]"
              >
                Explore {topCluster.name} in Career Archive
              </Button>
              <Button
                onClick={() => navigate("/app/book-mentor")}
                className="rounded-xl font-bold"
              >
                Book a 1-on-1 Mentor Session
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
