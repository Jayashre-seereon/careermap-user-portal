import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  LoadingOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Select, Spin, message } from "antd";
import { getAttemptResult } from "../../../api/psychometricAssessmentApi";
import { useAuthStore } from "../../../store/authStore";
import {
  CLUSTERS,
  CLUSTER_MAP,
  INTERP,
  pct,
  band,
} from "../data/careerCompassData";
import "./AssessmentReportPage.css";

const LOGO_URL = "https://res.cloudinary.com/tj6xmmar/image/upload/v1789970133/logo_white.png";

// Common Header Component for Pages 2 to 31
function PageHeader({ studentFirstName }) {
  return (
    <div className="pdf-header">
      <div className="pdf-header-top">
        <div className="pdf-header-name">{studentFirstName || "Student"}</div>
        <div className="pdf-header-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#9C2A1F"/>
          </svg>
          <div className="pdf-header-logo-text">CAREER<br/>MAP</div>
        </div>
      </div>
      <div className="pdf-header-line"></div>
    </div>
  );
}

// Common Footer Component for Pages 2 to 31
function PageFooter({ pageNum }) {
  return (
    <div className="pdf-footer">
      <div className="pdf-footer-line"></div>
      <div className="pdf-footer-pill">
        <div className="pdf-footer-contact">
          <div className="pdf-footer-item">
            <span>📞</span> +91 94372 08179
          </div>
          <div className="pdf-footer-item">
            <span>✉️</span> careermap2016@gmail.com
          </div>
        </div>
        <div className="pdf-footer-page">Page No {pageNum}</div>
      </div>
    </div>
  );
}

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
      if (data && (data.report || data.data?.report || data.topCareerCluster || data.data?.topCareerCluster)) {
        setReportData(data.data || data);
      } else {
        setReportData(null);
      }
    } catch (err) {
      console.warn("Could not fetch remote result:", err?.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadJSON() {
    try {
      const payload = {
        student: { name: studentName, class: studentClass, school: studentSchool },
        completedAt: completedDate,
        hollandCode,
        topCluster,
        top5Clusters,
        scores,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `career-compass-${(studentName || "report").replace(/\s+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error("Could not download report JSON");
    }
  }

  function scrollToPage(pageId) {
    const el = document.getElementById(pageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EAEFF4]">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#9C2A1F" }} spin />} />
          <h2 className="mt-4 text-2xl font-black text-[#1E232A]">
            Generating Career Compass Report...
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Synthesizing 31 pages of RIASEC, OCEAN, Schwartz Values, Aptitudes, and Pathways
          </p>
        </div>
      </div>
    );
  }

  // Normalize API data
  const rawData = reportData || {};
  const report = rawData.report || {};
  const student = report.student || {};
  const studentName = student.name || rawData.studentName || user?.name || "Aryaman Singh";
  const studentFirstName = studentName.split(" ")[0] || "Aryaman";
  const studentClass = student.class || rawData.className || user?.selectedClass || "10th";
  const studentSchool = student.school || rawData.school || user?.school || "DAV, Pokhariput, BBSR";
  const studentEmail = student.email || rawData.email || user?.email || "aryaman1012@gmail.com";
  const studentPhone = student.phone || rawData.phone || user?.mobile || "+91-88958 12485";
  const completedDate = student.completedAt || rawData.completedAt || new Date().toISOString();

  const formattedDate = new Date(completedDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hollandCode = rawData.hollandCode || report.hollandProfile?.code || "ECS";
  const scores = rawData.scores || {};
  const domains = report.domains || {};

  // Goal Orientation
  const goalObj = domains.goalOrientation || {};
  const longPct = goalObj.longTerm?.percentage ?? pct(scores.goalLong ?? 0.8);
  const shortPct = goalObj.shortTerm?.percentage ?? pct(scores.goalShort ?? 1.0);
  const goalDiff = (longPct - shortPct) / 100;
  const goalKey = Math.abs(goalDiff) < 0.1 ? "balanced" : goalDiff > 0 ? "long_term" : "short_term";
  const goalMeta = INTERP.goal_orientation[goalKey] || INTERP.goal_orientation.balanced;

  // Top Cluster & Top 5
  const rawTopCluster = report.careerClusters?.topCluster || {};
  const rawTop5 = report.careerClusters?.top5 || rawData.top5Clusters || [];

  const topClusterCode = rawTopCluster.code || rawTopCluster.clusterId || "ENT";
  const topClusterMeta = CLUSTER_MAP[topClusterCode] || CLUSTER_MAP[rawData.topCareerCluster] || CLUSTERS[5];

  const topCluster = {
    code: topClusterCode,
    name: rawTopCluster.name || rawData.topCareerCluster || topClusterMeta.name,
    matchPercentage: rawTopCluster.matchPercentage || rawData.topCareerMatch || 67,
    description: rawTopCluster.description || topClusterMeta.description,
    why_fit: topClusterMeta.why_fit,
    streams_and_pathways_india: topClusterMeta.streams_and_pathways_india,
    careers: topClusterMeta.careers || [],
  };

  // 5 Default fallback clusters matching the PDF
  const defaultTop5 = [
    CLUSTER_MAP["ENT"] || CLUSTERS[5],
    CLUSTER_MAP["HSP"] || CLUSTERS[9],
    CLUSTER_MAP["SPT"] || CLUSTERS[14],
    CLUSTER_MAP["GOV"] || CLUSTERS[8],
    CLUSTER_MAP["PRS"] || CLUSTERS[12],
  ];

  const top5Clusters = (rawTop5.length >= 5 ? rawTop5 : defaultTop5).map((item, idx) => {
    const code = item.code || item.cluster_id || item.clusterId || "ENT";
    const meta = CLUSTER_MAP[code] || CLUSTER_MAP[item.name || item.cluster] || CLUSTERS[idx % CLUSTERS.length];
    const matchVal = item.matchPercentage ?? item.match ?? (67 - idx * 2);
    return {
      rank: idx + 1,
      code,
      name: item.name || item.cluster || meta.name,
      matchPercentage: matchVal,
      description: item.description || meta.description,
      why_fit: meta.why_fit,
      streams_and_pathways_india: meta.streams_and_pathways_india,
      careers: meta.careers || [],
    };
  });

  // Interests Scores (RIASEC)
  const interestFacets = ["E", "C", "S", "R", "I", "A"];
  const domainInterests = domains.interests || [];
  const interestScoreMap = { E: 100, C: 95, S: 85, R: 80, I: 55, A: 55 };
  domainInterests.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      interestScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });

  const interestRank = [...interestFacets]
    .map((f) => [f, interestScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);

  // Personality Scores (OCEAN)
  const personFacets = ["ES", "O", "Cn", "Ex", "Ag"];
  const domainPerson = domains.personality || [];
  const personScoreMap = { ES: 75, O: 63, Cn: 50, Ex: 50, Ag: 46 };
  domainPerson.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      personScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });
  const personRank = [...personFacets]
    .map((f) => [f, personScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);

  // Work Values Scores (Schwartz)
  const valFacets = ["OC", "SE", "ST", "CO"];
  const domainValues = domains.values || [];
  const valScoreMap = { OC: 100, SE: 95, ST: 60, CO: 56 };
  domainValues.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      valScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });
  const valRank = [...valFacets]
    .map((f) => [f, valScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);

  // Learning Styles Scores (VARK)
  const varkScoreMap = { V: 100, Rd: 85, A: 75, K: 60 };
  const domainVark = domains.learningStyles || [];
  domainVark.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      varkScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });

  // Aptitude Scores (6 Core)
  const aptScoreMap = { Verb: 43, Log: 33, Voc: 33, Mech: 33, Spat: 15, Num: 14 };
  const domainApt = domains.aptitudes || [];
  domainApt.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      aptScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });
  const aptList = [
    { key: "Num", label: "Numerical", val: aptScoreMap.Num },
    { key: "Log", label: "Logical", val: aptScoreMap.Log },
    { key: "Verb", label: "Verbal", val: aptScoreMap.Verb },
    { key: "Voc", label: "Vocabulary", val: aptScoreMap.Voc },
    { key: "Mech", label: "Mechanical", val: aptScoreMap.Mech },
    { key: "Spat", label: "Spatial", val: aptScoreMap.Spat },
  ];

  const topAptName = "VERBAL APTITUDE";

  return (
    <div className="report-app-container">
      {/* Floating Action Bar (Hidden on Print) */}
      <div className="report-action-bar">
        <div className="report-action-bar-inner">
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/app/assessment")}
              className="rounded-full font-bold"
            >
              Assessments
            </Button>
            <Select
              defaultValue="page-1"
              style={{ width: 220 }}
              onChange={scrollToPage}
              options={[
                { value: "page-1", label: "Page 1: Cover Page" },
                { value: "page-2", label: "Page 2: Declaration" },
                { value: "page-3", label: "Page 3: Introduction" },
                { value: "page-4", label: "Page 4: Interest Overview" },
                { value: "page-7", label: "Page 7: Interest Scores" },
                { value: "page-8", label: "Page 8: Personality Overview" },
                { value: "page-10", label: "Page 10: Personality Scores" },
                { value: "page-11", label: "Page 11: Learning Styles" },
                { value: "page-14", label: "Page 14: Learning Style Scores" },
                { value: "page-15", label: "Page 15: Work Values" },
                { value: "page-17", label: "Page 17: Work Values Scores" },
                { value: "page-18", label: "Page 18: Goal Orientation" },
                { value: "page-20", label: "Page 20: Aptitude Overview" },
                { value: "page-25", label: "Page 25: Aptitude Scores" },
                { value: "page-26", label: "Page 26: Top Career Clusters" },
                { value: "page-29", label: "Page 29: Study & Pathway Advice" },
                { value: "page-30", label: "Page 30: Complete Career Map" },
                { value: "page-31", label: "Page 31: About Career Map" },
              ]}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              className="rounded-full border-none bg-[#9C2A1F] font-bold text-white hover:bg-[#7A1F16]"
            >
              Print / Save PDF
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadJSON}
              className="rounded-full font-semibold"
            >
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Main Document: 31 Pages */}
      <div className="pdf-pages-wrapper">
        {/* ============================================================
            PAGE 1: COVER PAGE
        ============================================================ */}
        <div className="pdf-page relative overflow-hidden" id="page-1">
          {/* Top Left Geometric Graphics */}
          <div className="absolute -top-12 -left-12 w-64 h-64 flex gap-3 transform -rotate-12 pointer-events-none">
            <div className="w-24 h-56 bg-[#9C2A1F] rounded-3xl opacity-95"></div>
            <div className="w-20 h-44 bg-[#C29D97] rounded-3xl opacity-80"></div>
          </div>
          <div className="absolute top-36 left-12 w-28 h-28 border-4 border-[#E2A75B] rounded-2xl transform rotate-45 pointer-events-none"></div>

          {/* Top Right Logo */}
          <div className="flex justify-end pt-2 pr-2">
            <div className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#9C2A1F"/>
              </svg>
              <div className="font-extrabold text-sm tracking-wider text-[#9C2A1F] leading-tight">CAREER<br/>MAP</div>
            </div>
          </div>

          {/* Main Title Section */}
          <div className="mt-20 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-black text-[#9C2A1F] tracking-tight leading-none uppercase font-['Plus_Jakarta_Sans']">
              CAREER<br/>PSYCHOMETRIC
            </h1>
            <div className="mt-3 text-xl md:text-2xl font-extrabold tracking-widest text-[#802219] uppercase">
              ASSESSMENT REPORT
            </div>
            <p className="mt-4 text-base md:text-lg font-medium text-[#4B5563]">
              Discover Your True Strengths and Potential.
            </p>
          </div>

          {/* Center Graphic: 3D Illustration */}
          <div className="my-auto py-8 text-center flex justify-center items-center">
            <div className="relative w-64 h-56 flex items-center justify-center">
              {/* Central Clipboard / Document Illustration */}
              <div className="w-44 h-52 bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-slate-300 rounded-2xl shadow-xl flex flex-col items-center pt-3 px-4 transform -rotate-6">
                <div className="w-12 h-3 bg-slate-400 rounded-full mb-4"></div>
                <div className="w-full h-2 bg-slate-300 rounded mb-2"></div>
                <div className="w-full h-2 bg-slate-300 rounded mb-2"></div>
                <div className="w-3/4 h-2 bg-slate-300 rounded mb-4 self-start"></div>
              </div>

              {/* Glowing Hand & Brain */}
              <div className="absolute inset-0 flex items-center justify-center pt-8">
                <div className="w-28 h-28 bg-[#9C2A1F] rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
                  <span className="text-4xl">🧠</span>
                </div>
              </div>

              {/* Floating Red Cubes */}
              <div className="absolute top-2 left-6 w-8 h-8 bg-[#9C2A1F] rounded-md shadow-lg transform rotate-12"></div>
              <div className="absolute top-12 right-4 w-9 h-9 bg-[#7A1F16] rounded-md shadow-lg transform -rotate-12"></div>
              <div className="absolute bottom-6 left-2 w-7 h-7 bg-[#B83E32] rounded-md shadow-md transform rotate-45"></div>
              <div className="absolute bottom-2 right-10 w-8 h-8 bg-[#9C2A1F] rounded-md shadow-md transform -rotate-6"></div>
            </div>
          </div>

          {/* Bottom Left Student Info Box */}
          <div className="z-10 pb-6">
            <div className="inline-block bg-[#F3F4F6] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm max-w-md">
              <div className="text-sm font-extrabold text-[#9C2A1F] uppercase tracking-wider mb-3">
                Student Information
              </div>
              <div className="space-y-1.5 text-sm text-[#1F2937]">
                <div><span className="font-bold">Name:</span> {studentName}</div>
                <div><span className="font-bold">Class:</span> {studentClass}</div>
                <div><span className="font-bold">School Name:</span> {studentSchool}</div>
                <div><span className="font-bold">Date:</span> {formattedDate}</div>
                <div><span className="font-bold">Email Id:</span> {studentEmail}</div>
                <div><span className="font-bold">Phone No:</span> {studentPhone}</div>
              </div>
            </div>
          </div>

          {/* Bottom Right Decorative Shapes */}
          <div className="absolute -bottom-10 -right-10 w-56 h-56 flex gap-3 transform rotate-45 pointer-events-none">
            <div className="w-24 h-48 bg-[#D1D5DB] rounded-3xl opacity-70"></div>
            <div className="w-24 h-56 bg-[#9C2A1F] rounded-3xl opacity-95"></div>
          </div>
        </div>

        {/* ============================================================
            PAGE 2: DECLARATION
        ============================================================ */}
        <div className="pdf-page" id="page-2">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">DECLARATION</span>
            </div>

            <div className="text-base font-bold text-[#1E232A] mb-4">
              Dear {studentFirstName},
            </div>

            <div className="space-y-4 text-[0.92rem] leading-relaxed text-[#374151]">
              <p>
                Thank you for choosing CareerMap for your Career Psychometric Assessment.
              </p>
              <p>
                We appreciate your trust in our assessment process and recognize the importance of making informed educational and career decisions. This report has been prepared based on your responses to scientifically designed psychometric assessments and is intended to provide meaningful insights into your aptitude, <strong className="font-bold text-[#1E232A]">personality, interests and career preferences</strong>.
              </p>
              <p>
                The recommendations and observations presented in this report are designed to help you better understand your strengths, explore suitable career pathways, and make well-informed academic and professional choices. While every effort has been made to ensure the reliability and accuracy of the assessment, this report should be considered a decision-support tool and not the sole basis for any educational or career decision.
              </p>
              <p>
                CareerMap is committed to providing evidence-based career guidance that empowers individuals to achieve their goals with confidence. We encourage you to use this report as a foundation for self-discovery and future planning. For the best outcomes, we recommend discussing the report with a certified career counsellor who can help interpret the results in the context of your aspirations, abilities, and opportunities.
              </p>
              <p>
                We sincerely thank you for placing your trust in CareerMap and wish you every success in your educational and professional journey.
              </p>
            </div>

            <div className="mt-8 text-sm">
              <div className="font-semibold text-[#4B5563]">Best Wishes,</div>
              <div className="font-bold text-[#9C2A1F] text-base">Team CareerMap</div>
            </div>
          </div>

          <PageFooter pageNum={2} />
        </div>

        {/* ============================================================
            PAGE 3: INTRODUCTION (WHEEL / BULB DIAGRAM)
        ============================================================ */}
        <div className="pdf-page" id="page-3">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">INTRODUCTION</span>
            </div>

            <p className="page-lead-text">
              The report presented by Career Map outlines key observations about <strong className="text-[#1E232A]">{studentName}</strong>’s personality profile, career interests, work preferences, cognitive strengths, and future career orientation. These outcomes are indicative, not definitive, and must be reviewed again in subsequent counselling meetings. Recommendations may shift based on deeper interaction and continuous assessment.
            </p>

            {/* Central Lightbulb + 6 Surrounding Petal Badges */}
            <div className="relative py-12 flex justify-center items-center">
              <div className="relative w-80 h-80 flex items-center justify-center">
                {/* Central Yellow Lightbulb */}
                <div className="w-36 h-48 bg-gradient-to-b from-[#FBBF24] to-[#F59E0B] rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white z-10">
                  <span className="text-5xl">💡</span>
                  <div className="w-12 h-6 bg-slate-400 rounded-b-md mt-4"></div>
                </div>

                {/* 6 Circular/Fan Domain Badges */}
                <div className="absolute -top-4 left-10 bg-[#38BDF8] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>📚</span>
                  <span>LEARNING STYLE</span>
                </div>
                <div className="absolute -top-4 right-10 bg-[#0284C7] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>💎</span>
                  <span>WORK VALUES</span>
                </div>
                <div className="absolute top-28 -left-8 bg-[#0EA5E9] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>🧠</span>
                  <span>PERSONALITY</span>
                </div>
                <div className="absolute top-28 -right-8 bg-[#2563EB] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>🎯</span>
                  <span>GOAL ORIENTATION</span>
                </div>
                <div className="absolute -bottom-4 left-10 bg-[#38BDF8] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>🧭</span>
                  <span>INTEREST</span>
                </div>
                <div className="absolute -bottom-4 right-10 bg-[#1D4ED8] text-white px-5 py-3 rounded-2xl shadow-md font-bold text-xs uppercase tracking-wider text-center flex flex-col items-center">
                  <span>⚙️</span>
                  <span>APTITUDE</span>
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={3} />
        </div>

        {/* ============================================================
            PAGE 4: INTEREST OVERVIEW (CONCENTRIC RIASEC MODEL)
        ============================================================ */}
        <div className="pdf-page" id="page-4">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">INTEREST</span>
            </div>

            <p className="page-lead-text">
              Your interests are the areas and activities that naturally capture your attention, curiosity, and motivation. They go beyond hobbies and point to the type of work where you will feel engaged and satisfied. The RIASEC model outlines six interest areas—Realistic, Investigative, Artistic, Social, Enterprising, and Conventional—each reflecting different strengths and preferences. Most individuals show a combination of these. Understanding your interest profile helps you explore careers that align with what inspires you, making work more enjoyable, learning more natural, and success more fulfilling.
            </p>

            {/* Concentric RIASEC Rings Diagram */}
            <div className="my-8 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-[#4A607A] mb-4">
                RIASEC Model
              </div>

              <div className="grid grid-cols-2 gap-6 text-left max-w-xl mx-auto text-sm">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <div className="font-bold text-[#4D6D47]">REALISTIC</div>
                    <div className="text-xs text-slate-600">Hands-on tasks and practical skills</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">🔬</span>
                  <div>
                    <div className="font-bold text-[#D97706]">INVESTIGATIVE</div>
                    <div className="text-xs text-slate-600">Research and problem-solving</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <div className="font-bold text-[#EA580C]">ARTISTIC</div>
                    <div className="text-xs text-slate-600">Creativity and expression</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">🤝</span>
                  <div>
                    <div className="font-bold text-[#0284C7]">SOCIAL</div>
                    <div className="text-xs text-slate-600">Helping and connecting with others</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">💼</span>
                  <div>
                    <div className="font-bold text-[#BE185D]">ENTERPRISING</div>
                    <div className="text-xs text-slate-600">Leading and persuading others</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-bold text-[#9C2A1F]">CONVENTIONAL</div>
                    <div className="text-xs text-slate-600">Organising and managing details</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={4} />
        </div>

        {/* ============================================================
            PAGE 5: INTEREST DETAILS (01 - 03)
        ============================================================ */}
        <div className="pdf-page" id="page-5">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-4">
            {/* 01 ENTERPRISING */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">01</span>
                <span>ENTERPRISING</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are naturally confident, assertive, and persuasive. You enjoy leadership roles and are driven by goals, success, and influence. You're often seen as energetic, ambitious, and socially bold.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Leadership, persuasion, risk-taking, initiative.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Selling, managing people, public speaking, leading projects.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Fast-paced, entrepreneurial, competitive, leadership-driven.</div>
              </div>
            </div>

            {/* 02 CONVENTIONAL */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">02</span>
                <span>CONVENTIONAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You're an organizer — you like order, accuracy, records, plans and numbers, and people can rely on you to keep things on track.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Organized, systematic, reliable, efficient, detail-oriented.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Managing records, organising information, maintaining schedules, accounting, clerical work, following procedures.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Structured, orderly, rule-based, organized, administrative.</div>
              </div>
            </div>

            {/* 03 SOCIAL */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">03</span>
                <span>SOCIAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You care deeply about helping others and building meaningful interpersonal relationships. You are empathetic, cooperative, and emotionally intelligent.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Caring, supportive, trustworthy, socially responsible.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Teaching, counselling, mentoring, serving others.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Collaborative, service-oriented, people-focused.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={5} />
        </div>

        {/* ============================================================
            PAGE 6: INTEREST DETAILS (04 - 06)
        ============================================================ */}
        <div className="pdf-page" id="page-6">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-4">
            {/* 04 REALISTIC */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">04</span>
                <span>REALISTIC</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are action-oriented, practical, and grounded. You prefer working with your hands, tools, and tangible objects rather than abstract ideas. You find satisfaction in seeing concrete results from your efforts.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Practical, reliable, hands-on, straightforward, persistent.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Building, repairing, operating machinery, working outdoors.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Structured, physical, outdoorsy, task-focused.</div>
              </div>
            </div>

            {/* 05 INVESTIGATIVE */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">05</span>
                <span>INVESTIGATIVE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are curious, analytical, and intellectually driven. You enjoy exploring ideas, solving complex problems, and understanding how things work through observation, research, and critical thinking.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Analytical, curious, logical, observant, independent.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Research, experimentation, data analysis, solving puzzles, scientific inquiry, learning new concepts.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Research-oriented, intellectually stimulating, independent, evidence-based, problem-solving focused.</div>
              </div>
            </div>

            {/* 06 ARTISTIC */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">06</span>
                <span>ARTISTIC</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You enjoy creative activities from time to time and appreciate originality, even if creating isn't your central passion.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Creative, imaginative, expressive, original, intuitive.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Drawing, writing, music, performing arts, designing, storytelling, photography.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Creative, flexible, open-minded, innovative, self-directed.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={6} />
        </div>

        {/* ============================================================
            PAGE 7: VISUAL REPRESENTATION (INTERESTS)
        ============================================================ */}
        <div className="pdf-page" id="page-7">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            {/* Horizontal Bar Chart */}
            <div className="h-bar-chart">
              <div className="h-bar-grid-header">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>

              {[
                { label: "Enterprising", val: interestScoreMap.E },
                { label: "Conventional", val: interestScoreMap.C },
                { label: "Social", val: interestScoreMap.S },
                { label: "Realistic", val: interestScoreMap.R },
                { label: "Investigative", val: interestScoreMap.I },
                { label: "Artistic", val: interestScoreMap.A },
              ].map((item) => (
                <div key={item.label} className="h-bar-row">
                  <div className="h-bar-label">{item.label}</div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill" style={{ width: `${item.val}%` }}></div>
                  </div>
                  <div className="h-bar-val">{item.val}%</div>
                </div>
              ))}
            </div>

            {/* Top Career Interests Section */}
            <div className="top-interests-box">
              <div className="score-rep-banner" style={{ fontSize: "0.95rem" }}>
                YOUR TOP CAREER INTERESTS ARE
              </div>
              <div className="top-interests-pills-grid">
                <div className="top-interest-pill">ENTERPRISING</div>
                <div className="top-interest-pill">CONVENTIONAL</div>
                <div className="top-interest-pill">SOCIAL</div>
                <div className="top-interest-pill">REALISTIC</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={7} />
        </div>

        {/* ============================================================
            PAGE 8: PERSONALITY OVERVIEW (STACKED STEPS DIAGRAM)
        ============================================================ */}
        <div className="pdf-page" id="page-8">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header green">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">PERSONALITY</span>
            </div>

            <p className="page-lead-text">
              Your personality is the blend of traits that shape how you think, feel, and behave. It influences how you solve problems, build relationships, manage stress, and respond to opportunities. The Big Five model describes personality through five dimensions: Openness (curiosity and creativity), Conscientiousness (discipline and responsibility), Extraversion (energy and sociability), Agreeableness (cooperation and empathy), and Emotional Stability (resilience under pressure). Each trait offers strengths, and different careers may suit different combinations.
            </p>
            <p className="page-lead-text">
              For example, conscientious individuals may excel in structured roles, while those high in openness may thrive in creative or innovative environments. Understanding your personality helps you choose careers that align with your natural style and identify areas for growth, making it easier to collaborate effectively and feel at ease in your work.
            </p>

            {/* 5-Layer Stacked Steps Diagram */}
            <div className="my-8 max-w-md mx-auto space-y-2">
              <div className="flex items-center rounded-xl bg-[#67E8F9] p-3 text-[#155E75] font-extrabold text-sm shadow-sm">
                <span className="w-12 text-lg">05</span>
                <span>EMOTIONAL STABILITY</span>
              </div>
              <div className="flex items-center rounded-xl bg-[#7DD3FC] p-3 text-[#0369A1] font-extrabold text-sm shadow-sm">
                <span className="w-12 text-lg">04</span>
                <span>AGREEABLENESS</span>
              </div>
              <div className="flex items-center rounded-xl bg-[#5EEAD4] p-3 text-[#115E59] font-extrabold text-sm shadow-sm">
                <span className="w-12 text-lg">03</span>
                <span>EXTRAVERSION</span>
              </div>
              <div className="flex items-center rounded-xl bg-[#FDE68A] p-3 text-[#854D0E] font-extrabold text-sm shadow-sm">
                <span className="w-12 text-lg">02</span>
                <span>CONSCIENTIOUSNESS</span>
              </div>
              <div className="flex items-center rounded-xl bg-[#FDBA74] p-3 text-[#9A3412] font-extrabold text-sm shadow-sm">
                <span className="w-12 text-lg">01</span>
                <span>OPENNESS</span>
              </div>
            </div>
          </div>

          <PageFooter pageNum={8} />
        </div>

        {/* ============================================================
            PAGE 9: PERSONALITY SUGGESTIONS
        ============================================================ */}
        <div className="pdf-page" id="page-9">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-3.5">
            {[
              { num: "01", name: "EMOTIONAL STABILITY", band: "HIGH", text: "You stay calm and steady under pressure — a major asset for high-stakes fields like defence, medicine, aviation and competitive exams." },
              { num: "02", name: "OPENNESS", band: "MODERATE", text: "You balance curiosity with practicality — open to new ideas, while valuing what already works." },
              { num: "03", name: "CONSCIENTIOUSNESS", band: "MODERATE", text: "You're reasonably organised and dependable, finishing what matters even if some tasks slip." },
              { num: "04", name: "EXTRAVERSION", band: "MODERATE", text: "You're an ambivert — comfortable both in groups and working alone, adapting to what the situation needs." },
              { num: "05", name: "AGREEABLENESS", band: "MODERATE", text: "You cooperate well while still holding your own views — a healthy balance for teamwork and fair decisions." },
            ].map((item) => (
              <div key={item.num} className="detail-card-row">
                <div className="detail-card-left-badge green flex-col items-start justify-center">
                  <div className="flex items-center gap-2">
                    <span className="detail-card-num-circle">{item.num}</span>
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <span className="mt-2 text-[10px] bg-white text-[#4D6D47] px-2 py-0.5 rounded-full font-bold self-end">
                    {item.band}
                  </span>
                </div>
                <div className="detail-card-right-body flex items-center">
                  <div className="text-sm leading-relaxed text-[#374151]">{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <PageFooter pageNum={9} />
        </div>

        {/* ============================================================
            PAGE 10: VISUAL REPRESENTATION (PERSONALITY)
        ============================================================ */}
        <div className="pdf-page" id="page-10">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner green">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            {/* Horizontal Green Bar Chart */}
            <div className="h-bar-chart">
              <div className="h-bar-grid-header">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>

              {[
                { label: "Emotional Stability", val: personScoreMap.ES },
                { label: "Openness", val: personScoreMap.O },
                { label: "Conscientiousness", val: personScoreMap.Cn },
                { label: "Extraversion", val: personScoreMap.Ex },
                { label: "Agreeableness", val: personScoreMap.Ag },
              ].map((item) => (
                <div key={item.label} className="h-bar-row">
                  <div className="h-bar-label">{item.label}</div>
                  <div className="h-bar-track">
                    <div className="h-bar-fill green" style={{ width: `${item.val}%` }}></div>
                  </div>
                  <div className="h-bar-val">{item.val}%</div>
                </div>
              ))}
            </div>

            {/* Footnote Box */}
            <div className="mt-8 p-4 rounded-xl bg-[#EDF4EC] border border-[#D5E5D3] text-xs text-[#2D5A27] leading-relaxed">
              <strong>Note:</strong> Emotional Stability is the positive side of the Neuroticism scale — a higher score means you stay calmer under pressure.
            </div>
          </div>

          <PageFooter pageNum={10} />
        </div>

        {/* ============================================================
            PAGE 11: LEARNING STYLE OVERVIEW
        ============================================================ */}
        <div className="pdf-page" id="page-11">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header" style={{ background: "#4B5563" }}>
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">LEARNING STYLE</span>
            </div>

            <p className="page-lead-text">
              Everyone has a preferred way of learning, and knowing your style can make studying, training, and working much more effective. The VARK model highlights four main preferences: Visual learners understand best through charts, diagrams, and images; Auditory learners grasp information by listening, discussing, and explaining; Reading/Writing learners prefer text, lists, and notes; and Kinesthetic learners learn by doing, experiencing, and applying knowledge practically.
            </p>
            <p className="page-lead-text">
              While everyone can learn in all ways, most people have one or two stronger preferences. Recognizing your learning style helps you study smarter, prepare better for exams, and even choose careers that align with how you absorb and process information.
            </p>

            {/* Target Archery Diagram */}
            <div className="my-8 flex items-center justify-center gap-10">
              <div className="w-40 h-40 rounded-full border-8 border-[#EF4444] bg-white flex items-center justify-center shadow-lg">
                <div className="w-28 h-28 rounded-full border-8 border-[#F87171] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#EF4444] flex items-center justify-center text-white font-black text-xl">
                    🎯
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[#EF4444] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
                  VISUAL LEARNER
                </div>
                <div className="bg-[#EC4899] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
                  AUDITORY LEARNER
                </div>
                <div className="bg-[#F97316] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
                  READING/WRITING LEARNER
                </div>
                <div className="bg-[#EAB308] text-white px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider">
                  KINAESTHETIC LEARNER
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={11} />
        </div>

        {/* ============================================================
            PAGE 12: LEARNING STYLE DETAILS (01 - 02)
        ============================================================ */}
        <div className="pdf-page" id="page-12">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">01</span>
                <span>VISUAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You prefer to learn via images, diagrams, flow charts, maps, symbolic representations. You benefit from seeing the structure, patterns, shapes, relationships.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Grasping spatial or structural relationships; memory aided by imagery; organising information visually.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Using flowcharts, infographics, videos, colorcoded notes, visual organizers, and symbolic representations to study or plan.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Learning spaces that use visual aids, presentations, digital whiteboards, concept maps, and multimedia tools.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">02</span>
                <span>AUDITORY</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn through listening and speaking. Explaining ideas aloud helps you process them deeply. You benefit from discussions, storytelling, and audio recordings.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Expressive, articulate, and sensitive to tone and rhythm. You learn best through listening, discussion, and verbal explanation.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Participating in group discussions, lectures, podcasts, debates, or reading aloud. You often recall not just what was said, but how it was said.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Interactive classrooms, seminars, or workplaces that encourage open conversation, brainstorming, and verbal feedback.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={12} />
        </div>

        {/* ============================================================
            PAGE 13: LEARNING STYLE DETAILS (03 - 04)
        ============================================================ */}
        <div className="pdf-page" id="page-13">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">03</span>
                <span>READING / WRITING</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn best through written words, reading textbooks, taking notes, and creating summaries.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong comprehension, articulate written expression, organized note-making.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Reading comprehensive texts, writing essays, creating glossaries, reviewing written notes.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Quiet study halls, libraries, research spaces, text-oriented environments.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge">
                <span className="detail-card-num-circle">04</span>
                <span>KINAESTHETIC</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn through experience. Abstract ideas make sense when you can do something with them. You thrive when allowed to experiment, observe, and apply.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Hands-on, practical, and experiential. You grasp concepts through physical movement and real-life examples.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Experiments, demonstrations, simulations, field visits, role plays, or building and testing ideas.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Interactive, activity-based settings, workshops, labs, studios, or outdoor spaces.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={13} />
        </div>

        {/* ============================================================
            PAGE 14: VISUAL REPRESENTATION (LEARNING STYLES)
        ============================================================ */}
        <div className="pdf-page" id="page-14">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            {/* 4 Donut Gauges */}
            <div className="grid grid-cols-2 gap-8 my-8 max-w-lg mx-auto text-center">
              <div>
                <div className="w-28 h-28 mx-auto rounded-full border-8 border-[#3B82F6] flex items-center justify-center font-black text-2xl text-[#1E3A8A]">
                  100%
                </div>
                <div className="mt-2 font-bold text-xs uppercase tracking-wider text-slate-700">VISUAL</div>
              </div>
              <div>
                <div className="w-28 h-28 mx-auto rounded-full border-8 border-[#10B981] flex items-center justify-center font-black text-2xl text-[#064E3B]">
                  75%
                </div>
                <div className="mt-2 font-bold text-xs uppercase tracking-wider text-slate-700">AUDITORY</div>
              </div>
              <div>
                <div className="w-28 h-28 mx-auto rounded-full border-8 border-[#F59E0B] flex items-center justify-center font-black text-2xl text-[#78350F]">
                  85%
                </div>
                <div className="mt-2 font-bold text-xs uppercase tracking-wider text-slate-700">READING</div>
              </div>
              <div>
                <div className="w-28 h-28 mx-auto rounded-full border-8 border-[#EF4444] flex items-center justify-center font-black text-2xl text-[#7F1D1D]">
                  60%
                </div>
                <div className="mt-2 font-bold text-xs uppercase tracking-wider text-slate-700">KINESTHETIC</div>
              </div>
            </div>

            <div className="top-interests-box">
              <div className="score-rep-banner" style={{ fontSize: "0.95rem" }}>
                Your Best Learning Styles are
              </div>
              <div className="flex justify-center gap-4">
                <div className="top-interest-pill" style={{ flex: 1 }}>VISUAL</div>
                <div className="top-interest-pill" style={{ flex: 1 }}>READING</div>
                <div className="top-interest-pill" style={{ flex: 1 }}>AUDITORY</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={14} />
        </div>

        {/* ============================================================
            PAGE 15: WORK VALUES OVERVIEW
        ============================================================ */}
        <div className="pdf-page" id="page-15">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header green">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">WORK VALUES</span>
            </div>

            <p className="page-lead-text">
              "Work values are the core principles and priorities that define what matters most to you in a professional environment. They reflect what you seek from your career — whether that is achievement, recognition, security, autonomy, relationships, or making a meaningful impact. Unlike interests (what you enjoy) or personality (how you behave), work values reveal why certain careers feel more fulfilling than others."
            </p>
            <p className="page-lead-text">
              "Understanding your work values helps you evaluate job opportunities beyond salary and title. When your work aligns with your values, you feel more motivated, satisfied, and committed. Identifying your core values early helps you make career choices that bring long-term fulfilment."
            </p>

            {/* Central Schwartz Diamond Diagram */}
            <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="font-bold text-[#4A607A]">Conservation</div>
                  <div className="text-xs text-slate-500">Security & Stability</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="font-bold text-[#D97706]">Openness to Change</div>
                  <div className="text-xs text-slate-500">Autonomy & Freedom</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="font-bold text-[#4D6D47]">Self-Transcendence</div>
                  <div className="text-xs text-slate-500">Relationships & Impact</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="font-bold text-[#9C2A1F]">Self-Enhancement</div>
                  <div className="text-xs text-slate-500">Achievement & Recognition</div>
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={15} />
        </div>

        {/* ============================================================
            PAGE 16: WORK VALUES SUGGESTIONS
        ============================================================ */}
        <div className="pdf-page" id="page-16">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-4">
            <div className="title-pill-header green">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">HERE ARE THE SUGGESTIONS AS PER VALUES</span>
            </div>

            {[
              { num: "01", name: "OPENNESS TO CHANGE", band: "HIGH", text: "Freedom, creativity and new experiences drive you — you'll thrive where you can decide how you work and what you explore." },
              { num: "02", name: "SELF-ENHANCEMENT", band: "HIGH", text: "Achievement, success and recognition strongly drive you — you'll thrive with clear goals, competition, growth ladders and visible results." },
              { num: "03", name: "SELF-TRANSCENDENCE", band: "MODERATE", text: "You care about fairness and helping others as part of a balanced set of motivations." },
              { num: "04", name: "CONSERVATION", band: "MODERATE", text: "You value a reasonable amount of stability and order while staying flexible when things shift." },
            ].map((item) => (
              <div key={item.num} className="detail-card-row">
                <div className="detail-card-left-badge green flex-col items-start justify-center">
                  <div className="flex items-center gap-2">
                    <span className="detail-card-num-circle">{item.num}</span>
                    <span className="text-xs">{item.name}</span>
                  </div>
                  <span className="mt-2 text-[10px] bg-white text-[#4D6D47] px-2 py-0.5 rounded-full font-bold self-end">
                    {item.band}
                  </span>
                </div>
                <div className="detail-card-right-body flex items-center">
                  <div className="text-sm leading-relaxed text-[#374151]">{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <PageFooter pageNum={16} />
        </div>

        {/* ============================================================
            PAGE 17: VISUAL REPRESENTATION (WORK VALUES)
        ============================================================ */}
        <div className="pdf-page" id="page-17">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner green">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            <div className="space-y-6 my-8 max-w-lg mx-auto">
              {[
                { label: "OPENNESS TO CHANGE", val: valScoreMap.OC, color: "#3B5E38" },
                { label: "SELF-ENHANCEMENT", val: valScoreMap.SE, color: "#3B82F6" },
                { label: "SELF-TRANSCENDENCE", val: valScoreMap.ST, color: "#818CF8" },
                { label: "CONSERVATION", val: valScoreMap.CO, color: "#CA8A04" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between font-bold text-xs uppercase text-slate-700 mb-1.5">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="top-interests-box">
              <div className="score-rep-banner green" style={{ fontSize: "0.95rem" }}>
                Your Best Work Value Fit into
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="top-interest-pill green">OPENNESS TO CHANGE</div>
                <div className="top-interest-pill green">SELF-ENHANCEMENT</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={17} />
        </div>

        {/* ============================================================
            PAGE 18: GOAL ORIENTATION (OVERVIEW & SHORT TERM)
        ============================================================ */}
        <div className="pdf-page" id="page-18">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header gold">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">GOAL ORIENTATION</span>
            </div>

            <p className="page-lead-text">
              Goals guide your direction in studies, work, and personal growth. Your goal orientation reflects how you view success and what motivates you to achieve it. Some people focus on short-term goals—completing tasks, gaining quick skills, or achieving immediate results—while others are driven by long-term goals, such as building expertise, reaching leadership roles, or creating lasting impact. Both are important: short-term goals keep you motivated daily, while long-term goals provide vision and persistence.
            </p>

            <div className="detail-card-row mt-8">
              <div className="detail-card-left-badge gold">
                <span className="detail-card-num-circle">01</span>
                <span>SHORT TERM</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are oriented toward goals that can be achieved in the relatively near future, often within months to a year. You seek more immediate feedback, micromilestones, and concrete progress.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Action-oriented, results-focused, responsive, task-driven.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Completing tasks quickly, achieving daily or weekly targets, gaining visible results.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Fast-paced workplaces with clear, measurable short-cycle goals.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={18} />
        </div>

        {/* ============================================================
            PAGE 19: GOAL ORIENTATION (LONG TERM & VISUAL REPRESENTATION)
        ============================================================ */}
        <div className="pdf-page" id="page-19">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="detail-card-row">
              <div className="detail-card-left-badge gold">
                <span className="detail-card-num-circle">02</span>
                <span>LONG TERM</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are oriented toward broader, strategic, future-oriented outcomes that may take several years to achieve and often involve many steps. You hold a vision and work progressively toward it.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Vision, persistence, planning, stability, commitment.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Career ambition, major life objectives, mastering a field, long projects.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Long-range planning, supportive structure, milestone expectations.</div>
              </div>
            </div>

            {/* Comparison Strategy Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="block text-sm mb-1">SHORT TERM</strong>
                Aim for short milestones and rewards. Match with roles needing daily targets.
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong className="block text-sm mb-1">LONG TERM</strong>
                Use Vision boards, planning tools, long-term mentorship. Ideal for research, entrepreneurship, civil services.
              </div>
            </div>

            {/* 2 Donut Gauges */}
            <div className="score-rep-banner gold" style={{ fontSize: "0.95rem" }}>
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            <div className="flex justify-center gap-12 text-center">
              <div>
                <div className="w-24 h-24 mx-auto rounded-full border-8 border-[#B48425] flex items-center justify-center font-black text-xl text-[#78540B]">
                  100%
                </div>
                <div className="mt-2 font-bold text-xs text-slate-700">SHORT TERM</div>
              </div>
              <div>
                <div className="w-24 h-24 mx-auto rounded-full border-8 border-[#F59E0B] flex items-center justify-center font-black text-xl text-[#B45309]">
                  80%
                </div>
                <div className="mt-2 font-bold text-xs text-slate-700">LONG TERM</div>
              </div>
            </div>

            <div className="p-3 bg-[#9C6D1F] text-white rounded-xl text-center font-bold text-sm uppercase tracking-wider">
              Most Inclined towards : SHORT TERM
            </div>
          </div>

          <PageFooter pageNum={19} />
        </div>

        {/* ============================================================
            PAGE 20: APTITUDE (OVERVIEW)
        ============================================================ */}
        <div className="pdf-page" id="page-20">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header red">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">APTITUDE</span>
            </div>

            <p className="page-lead-text">
              Your aptitude reflects your natural ability to learn, understand, and apply different skills. While interests show what you enjoy, aptitudes indicate what you can do well with practice. In this test, we assess six types of aptitudes:
            </p>

            {/* 6 Hanging Clip Badges */}
            <div className="grid grid-cols-3 gap-3 my-6 text-center text-xs font-bold text-slate-800">
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">MECHANICAL</div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">LOGICAL</div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">VERBAL</div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">VOCABULARY</div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">NUMERICAL</div>
              <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-300">SPATIAL</div>
            </div>

            {/* 4 Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">MECHANICAL APTITUDE</strong>
                This shows how easily you understand machines, tools, and physical systems.
              </div>
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">LOGICAL APTITUDE</strong>
                This reflects your ability to think critically, recognize patterns, and solve problems.
              </div>
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">VERBAL APTITUDE</strong>
                This measures how well you can express ideas, understand language, and communicate clearly.
              </div>
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">VOCABULARY APTITUDE</strong>
                This shows the strength of your word knowledge and ability to use language effectively.
              </div>
            </div>
          </div>

          <PageFooter pageNum={20} />
        </div>

        {/* ============================================================
            PAGE 21: APTITUDE (NUMERICAL & SPATIAL + DETAILS)
        ============================================================ */}
        <div className="pdf-page" id="page-21">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">NUMERICAL APTITUDE</strong>
                This measures comfort with numbers, calculations, and quantitative reasoning.
              </div>
              <div className="p-4 bg-[#FDF2F1] border border-[#F5C2BE] rounded-xl text-xs leading-relaxed text-[#7A1F16]">
                <strong className="block text-sm mb-1 uppercase font-extrabold">SPATIAL APTITUDE</strong>
                This reflects your ability to imagine shapes, designs, and objects in space.
              </div>
            </div>

            <p className="page-lead-text text-xs">
              By identifying your aptitudes, you can better understand where your natural strengths lie and how to build on them. A career that matches both your interests and aptitudes allows you to learn faster, perform better, and feel more confident.
            </p>

            {/* 01 NUMERICAL */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">01</span>
                <span>NUMERICAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You think in structured, analytical ways and are comfortable dealing with quantities, formulas, and logic. You enjoy the clarity that numbers provide and are skilled at identifying relationships and trends in data.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Logical, detail-oriented, and comfortable working with numbers.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Working with statistics, solving quantitative problems, budgeting, coding.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Finance, data analysis, research, science, engineering.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={21} />
        </div>

        {/* ============================================================
            PAGE 22: APTITUDE DETAILS (LOGICAL & VERBAL)
        ============================================================ */}
        <div className="pdf-page" id="page-22">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">02</span>
                <span>LOGICAL REASONING</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You have a natural ability to think clearly, reason objectively, and identify the most logical pathway to a solution. You approach challenges methodically.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Analytical, systematic, and conceptually clear thinker.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Decoding clues, troubleshooting systems, analyzing relationships.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Research, analytics, data science, technology, law, mathematics.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">03</span>
                <span>VERBAL APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You have a strong ability to understand, interpret, and communicate ideas through language. You are comfortable processing written information and expressing thoughts clearly.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong comprehension, articulate expression, attention to language details.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Reading, writing, debating ideas, storytelling, presenting ideas.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Media, journalism, education, law, marketing, public relations.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={22} />
        </div>

        {/* ============================================================
            PAGE 23: APTITUDE DETAILS (VOCABULARY & MECHANICAL)
        ============================================================ */}
        <div className="pdf-page" id="page-23">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">04</span>
                <span>VOCABULARY APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You demonstrate a strong understanding of word meanings, language nuances, and how words can be used effectively in different contexts.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong word knowledge, language awareness, comprehension of subtle differences.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Learning new words, reading diverse material, writing, editing content.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Publishing, media, education, writing, communication strategy.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">05</span>
                <span>MECHANICAL APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are able to understand how physical systems, machines, and mechanical processes work. You tend to think in practical and functional ways.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Practical thinker, strong problem-solving ability, understanding of mechanical systems.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Building, fixing, assembling, experimenting with tools or devices.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Engineering workshops, manufacturing, robotics, automotive fields.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={23} />
        </div>

        {/* ============================================================
            PAGE 24: APTITUDE DETAILS (SPATIAL)
        ============================================================ */}
        <div className="pdf-page" id="page-24">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">06</span>
                <span>SPATIAL APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You have the ability to visualize objects, shapes, and structures in three-dimensional space. You can mentally manipulate visual information, understand patterns, and imagine how different components fit together.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong visual imagination, pattern recognition, spatial awareness.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Decoding clues, troubleshooting systems, spatial visual puzzles.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Design, architecture, engineering, animation, product design.</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={24} />
        </div>

        {/* ============================================================
            PAGE 25: VISUAL REPRESENTATION (APTITUDE COLUMN CHART)
        ============================================================ */}
        <div className="pdf-page" id="page-25">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner red">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            {/* Vertical Column Bar Chart */}
            <div className="my-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto">
              <div className="h-56 flex items-end justify-between gap-4 border-b-2 border-slate-300 pb-2">
                {aptList.map((item) => (
                  <div key={item.key} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-[#9C2A1F]">{item.val}%</span>
                    <div
                      className="w-full bg-[#9C2A1F] rounded-t-md transition-all"
                      style={{ height: `${item.val * 3.5}px` }}
                    ></div>
                    <span className="text-[11px] font-bold text-slate-600 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="top-interests-box">
              <div className="score-rep-banner red" style={{ fontSize: "0.95rem" }}>
                Your Top Aptitude are
              </div>
              <div className="max-w-xs mx-auto">
                <div className="top-interest-pill red">{topAptName}</div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={25} />
        </div>

        {/* ============================================================
            PAGE 26: INTEGRATED ANALYSIS & CLUSTER #1
        ============================================================ */}
        <div className="pdf-page" id="page-26">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header gold">
              <div className="title-pill-icon-circle"></div>
              <span className="title-pill-text">INTEGRATED ANALYSIS</span>
            </div>

            <div className="text-2xl font-black text-[#1E232A] uppercase tracking-tight">
              YOUR TOP CLUSTERS
            </div>
            <p className="text-xs text-[#6B7280] mb-6">
              Each card shows what the field involves, why it suits you, how to get there, and list of careers
            </p>

            {/* Top 1 Cluster Card */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header">
                <span className="cluster-match-title">1 {top5Clusters[0].name}</span>
                <span className="cluster-match-pct">{top5Clusters[0].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[0].description}</p>
                <p className="mb-2 text-slate-600">{top5Clusters[0].why_fit}</p>
                <div className="mt-3 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[0].streams_and_pathways_india}
                </div>

                <div className="cluster-careers-grid">
                  {(top5Clusters[0].careers || []).slice(0, 9).map((c, i) => (
                    <div key={i} className="cluster-career-chip">
                      <span className="cluster-career-dot"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={26} />
        </div>

        {/* ============================================================
            PAGE 27: CLUSTERS #2 & #3
        ============================================================ */}
        <div className="pdf-page" id="page-27">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            {/* Cluster #2 */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header rose">
                <span className="cluster-match-title">2 {top5Clusters[1].name}</span>
                <span className="cluster-match-pct">{top5Clusters[1].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[1].description}</p>
                <div className="mt-2 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[1].streams_and_pathways_india}
                </div>
                <div className="cluster-careers-grid">
                  {(top5Clusters[1].careers || []).slice(0, 9).map((c, i) => (
                    <div key={i} className="cluster-career-chip">
                      <span className="cluster-career-dot rose"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cluster #3 */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header blue">
                <span className="cluster-match-title">3 {top5Clusters[2].name}</span>
                <span className="cluster-match-pct">{top5Clusters[2].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[2].description}</p>
                <div className="mt-2 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[2].streams_and_pathways_india}
                </div>
                <div className="cluster-careers-grid">
                  {(top5Clusters[2].careers || []).slice(0, 9).map((c, i) => (
                    <div key={i} className="cluster-career-chip">
                      <span className="cluster-career-dot blue"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={27} />
        </div>

        {/* ============================================================
            PAGE 28: CLUSTERS #4 & #5
        ============================================================ */}
        <div className="pdf-page" id="page-28">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            {/* Cluster #4 */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header green">
                <span className="cluster-match-title">4 {top5Clusters[3].name}</span>
                <span className="cluster-match-pct">{top5Clusters[3].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[3].description}</p>
                <div className="mt-2 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[3].streams_and_pathways_india}
                </div>
                <div className="cluster-careers-grid">
                  {(top5Clusters[3].careers || []).slice(0, 9).map((c, i) => (
                    <div key={i} className="cluster-career-chip">
                      <span className="cluster-career-dot green"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cluster #5 */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header gold">
                <span className="cluster-match-title">5 {top5Clusters[4].name}</span>
                <span className="cluster-match-pct">{top5Clusters[4].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[4].description}</p>
                <div className="mt-2 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[4].streams_and_pathways_india}
                </div>
                <div className="cluster-careers-grid">
                  {(top5Clusters[4].careers || []).slice(0, 9).map((c, i) => (
                    <div key={i} className="cluster-career-chip">
                      <span className="cluster-career-dot gold"></span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <PageFooter pageNum={28} />
        </div>

        {/* ============================================================
            PAGE 29: YOUR DIRECTION: STUDY & PATHWAY ADVICE
        ============================================================ */}
        <div className="pdf-page" id="page-29">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="score-rep-banner gold" style={{ fontSize: "1.1rem" }}>
              YOUR DIRECTION: STUDY & PATHWAY ADVICE
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Turning your learning style and goal orientation into concrete next steps.
            </p>

            <div className="flex gap-6 text-sm font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-200">
              <div>Learning style: <strong className="text-[#9C2A1F]">Visual</strong></div>
              <div>Goal orientation: <strong className="text-[#9C2A1F]">Balanced Planner</strong></div>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div>
                <strong className="block text-sm font-bold text-slate-900 mb-1.5 uppercase">
                  HOW TO STUDY, BASED ON HOW YOU LEARN
                </strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Convert chapters into mind-maps, flowcharts and labelled diagrams.</li>
                  <li>Use colour-coding for formulas, dates and key terms.</li>
                  <li>Watch good video explanations, then redraw the idea from memory.</li>
                  <li>Sit where you can clearly see the board and the teacher's demonstrations.</li>
                </ul>
              </div>

              <div className="pt-2">
                <strong className="block text-sm font-bold text-slate-900 mb-1.5 uppercase">
                  YOUR PATHWAY APPROACH
                </strong>
                <ul className="list-disc pl-5 space-y-1">
                  <li>You're balanced between studying further and starting work early.</li>
                  <li>A smart path: choose degree courses that include internships, apprenticeships or placement years — you earn experience while keeping the door open to higher studies.</li>
                </ul>
              </div>
            </div>

            {/* 6-Lightbulb Study Roadmap */}
            <div className="mt-8">
              <strong className="block text-sm font-bold text-slate-900 mb-4">
                A general route from where you are now
              </strong>
              <div className="roadmap-container">
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Class 8–10</div>
                  <div className="roadmap-sub">Build basics</div>
                </div>
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Stream Choice</div>
                  <div className="roadmap-sub">Class 11 onward</div>
                </div>
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Entrance Prep</div>
                  <div className="roadmap-sub">If required</div>
                </div>
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Degree / Course</div>
                  <div className="roadmap-sub">College years</div>
                </div>
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Internship</div>
                  <div className="roadmap-sub">Real experience</div>
                </div>
                <div className="roadmap-stop">
                  <div className="roadmap-bulb-icon">💡</div>
                  <div className="roadmap-title">Career</div>
                  <div className="roadmap-sub">Your Destination</div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              Highlighted stops are where your current goal orientation matters most — this is a general route, not a fixed plan. Talk it through with a teacher, counsellor or parent before locking in big decisions.
            </div>
          </div>

          <PageFooter pageNum={29} />
        </div>

        {/* ============================================================
            PAGE 30: YOUR COMPLETE CAREER MAP (SUMMARY)
        ============================================================ */}
        <div className="pdf-page" id="page-30">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="text-xl font-black text-slate-900 uppercase">
              YOUR COMPLETE CAREER MAP
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Everything above, brought together into one summary
            </p>

            <div className="text-2xl font-black text-[#9C2A1F] uppercase mb-6 tracking-wide">
              {studentName}
            </div>

            {/* 6 Summary Metric Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">HOLLAND CODE</div>
                <div className="text-base font-extrabold text-[#9C2A1F]">{hollandCode}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP CLUSTER</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">{top5Clusters[0].name} ({top5Clusters[0].matchPercentage}%)</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP VALUE</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Openness to Change</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP TRAIT</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Emotional Stability</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">LEARNING STYLE</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Visual</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">GOAL ORIENTATION</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Balanced Planner</div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 mb-6">
              {studentName} shows an {hollandCode} interest pattern, which combined with emotional stability and a strong pull toward openness to change points most clearly toward {top5Clusters[0].name} ({top5Clusters[0].matchPercentage}% match). Aptitude-wise, {studentName}’s strongest results are in Verbal Reasoning and Logical Reasoning, which support that direction. As a visual learner with a balanced planner approach to the path ahead, the study tips and route in Section 3 are the most relevant starting point.
            </p>

            {/* What to do next checklist */}
            <div className="p-4 bg-[#F0F4F8] border border-[#D0DBE5] rounded-xl text-xs space-y-1.5 mb-4">
              <strong className="block text-sm font-bold text-[#1E3A8A] mb-2 uppercase">WHAT TO DO NEXT</strong>
              <div>• Read through your top 5 clusters in Section 1 with a parent, teacher or counsellor.</div>
              <div>• Shortlist 2–3 clusters and look up their stream/subject requirements for your class.</div>
              <div>• Use the study tips in Section 3 for the next exam cycle.</div>
              <div>• Retake this assessment in 6–12 months — interests and skills develop, especially in these years.</div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Match percentages compare clusters with each other — a lower score doesn't mean you can't succeed there, only that other clusters fit your current profile more naturally. Interests can grow with exposure, and aptitude grows with practice. Retake this assessment after 6–12 months — interests develop as you try new things.
            </p>
          </div>

          <PageFooter pageNum={30} />
        </div>

        {/* ============================================================
            PAGE 31: ABOUT CAREER MAP (BACK COVER)
        ============================================================ */}
        <div className="pdf-page" id="page-31">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-[#9C2A1F] uppercase leading-tight">
                DISCOVER YOUR DIRECTION.<br/>DESIGN YOUR FUTURE.
              </h2>
            </div>

            <div>
              <div className="inline-block bg-[#9C2A1F] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider mb-2">
                ABOUT CAREER MAP
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Career Map (A Unit of Identity Group) — Odisha's pioneering career counselling platform since 2016, guiding school students, graduates, and working professionals through Career Selection, Career Planning, and Career Mentorship.
              </p>
            </div>

            <div>
              <div className="text-sm font-black text-[#9C2A1F] uppercase tracking-wide mb-3">
                WHY CAREER MAP?
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-800">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">PSYCHOMETRIC-BASED COUNSELLING</div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">CAREER COUNSELING CELL</div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">ONE-TO-ONE CAREER COUNSELLING</div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">BEHAVIORAL & PSYCHOLOGICAL COUNSELLING</div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">MULTIDIMENSIONAL STUDENT MENTORSHIP</div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">INFORMATION DASHBOARD & APP</div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              Career Guidance Partner to the Government of Odisha, in association with UNICEF, OSEPA & DHSE. Present across 10,000+ students in CBSE, ICSE & residential schools — including with Knowledge Partnerships spanning and other leading institutions.
            </div>

            <div className="p-4 bg-[#9C2A1F] text-white rounded-2xl text-center">
              <div className="font-extrabold text-sm mb-1">Your Future Deserves More Than a Guess.</div>
              <div className="text-xs text-rose-100">Schedule your counselling session today.</div>
              <div className="mt-3 text-xs flex justify-center gap-6 text-amber-200 font-semibold">
                <span>🌐 www.thecareermap.in</span>
                <span>✉️ careermap2016@gmail.com</span>
              </div>
              <div className="mt-1 text-xs text-white font-bold">
                📞 +91 94372 08179, +91 97768 08179
              </div>
            </div>
          </div>

          <PageFooter pageNum={31} />
        </div>
      </div>
    </div>
  );
}
