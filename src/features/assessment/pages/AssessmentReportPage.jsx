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
  INTERP,
  pct,
  band,
} from "../data/careerCompassData";
import "./AssessmentReportPage.css";

// Common Header Component for Pages 2 to 31 matching PDF
function PageHeader({ studentFirstName }) {
  return (
    <div className="pdf-header">
      <div className="pdf-header-top">
        <div className="pdf-header-name">{studentFirstName || "Aryaman"}</div>
        <div className="pdf-header-logo">
          <img
            src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789970133/logo_white.png"
            alt="CareerMap"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>
      <div className="pdf-header-line"></div>
    </div>
  );
}

// Common Footer Component for Pages 2 to 31 matching PDF
function PageFooter({ pageNum }) {
  return (
    <div className="pdf-footer">
      <div className="pdf-footer-line"></div>
      <div className="pdf-footer-content">
        <div className="pdf-footer-contact">
          <div className="pdf-footer-item">
            <span className="pdf-footer-icon-circle">📞</span>
            <span>+91 94372 08179</span>
          </div>
          <div className="pdf-footer-item">
            <span className="pdf-footer-icon-circle">✉️</span>
            <span>careermap2016@gmail.com</span>
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
      if (attemptId && attemptId !== "demo") {
        const data = await getAttemptResult(attemptId);
        if (data && (data.report || data.data?.report || data.topCareerCluster || data.data?.topCareerCluster)) {
          setReportData(data.data || data);
        } else {
          setReportData(null);
        }
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

  // Normalize API data or use full high-fidelity default dataset matching the PDF
  const rawData = reportData || {};
  const report = rawData.report || {};
  const student = report.student || {};
  const studentName = student.name || rawData.studentName || user?.name || "Aryaman Singh";
  const studentFirstName = studentName.split(" ")[0] || "Aryaman";
  const studentClass = student.class || rawData.className || user?.selectedClass || "10th";
  const studentSchool = student.school || rawData.school || user?.school || "DAV, Pokhariput, BBSR";
  const studentEmail = student.email || rawData.email || user?.email || "aryaman1012@gmail.com";
  const studentPhone = student.phone || rawData.phone || user?.mobile || "+91-88958 12485";
  const completedDate = student.completedAt || rawData.completedAt || "2025-11-26T10:00:00.000Z";

  const formattedDate = new Date(completedDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hollandCode = rawData.hollandCode || report.hollandProfile?.code || "ECS";
  const scores = rawData.scores || {};
  const domains = report.domains || {};

  // Goal Orientation
  const goalObj = domains.goalOrientation || {};
  const longPct = goalObj.longTerm?.percentage ?? (scores.goalLong != null ? pct(scores.goalLong) : 80);
  const shortPct = goalObj.shortTerm?.percentage ?? (scores.goalShort != null ? pct(scores.goalShort) : 100);
  const goalDiff = (longPct - shortPct) / 100;
  const goalKey = Math.abs(goalDiff) < 0.1 ? "balanced" : goalDiff > 0 ? "long_term" : "short_term";

  // Interests Scores (RIASEC)
  const interestScoreMap = { E: 100, C: 95, S: 85, R: 80, I: 55, A: 55 };
  const domainInterests = domains.interests || [];
  domainInterests.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      interestScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });

  // Personality Scores (OCEAN)
  const personScoreMap = { ES: 75, O: 63, Cn: 50, Ex: 50, Ag: 46 };
  const domainPerson = domains.personality || [];
  domainPerson.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      personScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });

  // Work Values Scores (Schwartz)
  const valScoreMap = { OC: 100, SE: 95, ST: 60, CO: 56 };
  const domainValues = domains.values || [];
  domainValues.forEach((d) => {
    if (d.facet && (d.percentage != null || d.score != null)) {
      valScoreMap[d.facet] = d.percentage ?? pct(d.score);
    }
  });

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

  // 5 Top Default fallback clusters matching the PDF
  const defaultTop5 = [
    {
      rank: 1,
      code: "BIZ",
      name: "BUSINESS & ENTREPRENEURSHIP",
      matchPercentage: 67,
      description: "Careers that build and run organisations — marketing, sales, operations, HR, startups and entrepreneurship.",
      why_fit: "You like leading, persuading and organising people and resources, and you're energised by goals, competition and building something of your own.",
      streams_and_pathways_india: "Commerce or any stream. Pathways: BBA (IPMAT/CUET), B.Com, entrepreneurship cells & competitions in school/college, MBA later.",
      careers: [
        "Marketing Manager",
        "Operations Manager",
        "Sales Manager",
        "Supply Chain Manager",
        "E-commerce Manager",
        "Retail Manager",
        "Office Administrator/HR Admin",
        "Business Analyst",
        "Import-Export Manager",
        "Human Resource (HR) Manager",
      ],
    },
    {
      rank: 2,
      code: "HSP",
      name: "HOSPITALITY",
      matchPercentage: 65,
      description: "Careers that create great experiences for guests — hotels, food, travel, aviation service and events. You're energetic with people, gracious under pressure, and you enjoy organising experiences others will remember.",
      why_fit: "You're energetic with people, gracious under pressure, and you enjoy organising experiences others will remember.",
      streams_and_pathways_india: "Any stream. Pathways: NCHM JEE for hotel management, culinary institutes, aviation/cabin crew training after Class 12, event management degrees.",
      careers: [
        "Hotel/Resort Manager",
        "Tour/Travel Consultant",
        "Baker",
        "Human Resource (HR) Manager",
        "Bartender",
        "Butler",
        "Cabin Crew (Air Hostess/Flight Steward)",
        "Tour Guide",
        "Cruise Manager",
        "Front Office/Guest Relations/Housekeeping Manager",
        "Restaurant/Cloud Kitchen /Catering Manager",
      ],
    },
    {
      rank: 3,
      code: "SPT",
      name: "SPORTS & ATHLETICS",
      matchPercentage: 65,
      description: "Careers in and around the game — playing, coaching, sports science, analysis and sports media. You're physically driven and competitive, you train with discipline, and you perform best when the pressure is highest.",
      why_fit: "You're physically driven and competitive, you train with discipline, and you perform best when the pressure is highest.",
      streams_and_pathways_india: "Any stream. Pathways: sports quotas and academies, B.P.Ed / physical education, sports science degrees, SAI schemes; for sports media/analytics combine with mass comm or data skills.",
      careers: [
        "Professional Athlete & Coach",
        "Professional Player",
        "Sports Nutritionist",
        "Physical Education Teacher",
        "Sports Physiotherapist",
        "Armed Forces Sports Instructor",
        "Sports Psychologist",
        "Umpire",
        "Referee",
        "Sports Coach/Trainer",
      ],
    },
    {
      rank: 4,
      code: "GOV",
      name: "GOVERNMENT, LAW & PUBLIC POLICY",
      matchPercentage: 63,
      description: "Careers that run the country and uphold the law — civil services, law, judiciary, policy and regulation. You're disciplined and dutiful, strong in language and reasoning, and you respect systems — with the ambition to serve and lead within them.",
      why_fit: "You're disciplined and dutiful, strong in language and reasoning, and you respect systems — with the ambition to serve and lead within them.",
      streams_and_pathways_india: "Any stream; Humanities (Polity, History, Economics) aligns best. Pathways: CLAT/AILET for law after Class 12, any degree then UPSC/State PSC, policy programmes.",
      careers: [
        "Rural Development Officer",
        "Banker",
        "BMC Officer",
        "Passport Officer",
        "BDO",
        "Tahasildar",
        "Food Safety Officer",
        "DEO",
        "Cyber Crime Officer",
        "Civil Servant (IAS, IPS, IFS) / Bureaucrat",
      ],
    },
    {
      rank: 5,
      code: "PSF",
      name: "PERSONAL SERVICES & FREELANCE",
      matchPercentage: 62,
      description: "Careers built on personal skill and client relationships — fitness, styling, coaching, wellness, freelancing. You connect easily one-on-one, you have a sense of style or wellbeing you love sharing, and independence matters to you.",
      why_fit: "You connect easily one-on-one, you have a sense of style or wellbeing you love sharing, and independence matters to you.",
      streams_and_pathways_india: "Any stream. Pathways: certified courses (fitness, cosmetology, yoga — e.g., YCB), apprenticeships with professionals, building a client portfolio early.",
      careers: [
        "Fashion Stylist",
        "Image Consultant",
        "Life Coach",
        "Fitness/Personal Trainer",
        "Yoga/Zumba/Aerobics Instructor",
        "Nutrition Coach",
        "Career Coach",
        "Personal Assistant/Executive",
        "Spa/Massage Therapist",
        "Cosmetologist (Hair stylist/Makeup Artist/Nail Artist)",
      ],
    },
  ];

  const rawTopCluster = report.careerClusters?.topCluster || {};
  const rawTop5 = report.careerClusters?.top5 || rawData.top5Clusters || [];

  const clusterMap = (CLUSTERS || []).reduce((acc, c) => {
    acc[c.cluster_id] = c;
    acc[c.name] = c;
    return acc;
  }, {});

  const top5Clusters = rawTop5.length >= 5
    ? rawTop5.map((item, idx) => {
        const code = item.code || item.cluster_id || item.clusterId || defaultTop5[idx].code;
        const meta = clusterMap[code] || clusterMap[item.name || item.cluster] || CLUSTERS[idx % CLUSTERS.length] || {};
        return {
          rank: idx + 1,
          code,
          name: (item.name || item.cluster || meta.name || defaultTop5[idx].name).toUpperCase(),
          matchPercentage: item.matchPercentage ?? item.match ?? defaultTop5[idx].matchPercentage,
          description: item.description || meta.description || defaultTop5[idx].description,
          why_fit: meta.why_fit || defaultTop5[idx].why_fit,
          streams_and_pathways_india: meta.streams_and_pathways_india || defaultTop5[idx].streams_and_pathways_india,
          careers: meta.careers && meta.careers.length > 0 ? meta.careers.slice(0, 10) : defaultTop5[idx].careers,
        };
      })
    : defaultTop5;

  const topCluster = top5Clusters[0];

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
          {/* Top Left Geometric Graphics matching PDF */}
          <div className="absolute -top-10 -left-12 flex gap-3 transform -rotate-12 pointer-events-none z-0">
            <div className="w-24 h-64 bg-[#8C1814] rounded-3xl opacity-95 shadow-lg"></div>
            <div className="w-20 h-48 bg-[#C2BCBA] rounded-3xl opacity-80"></div>
          </div>
          <div className="absolute top-36 left-12 w-24 h-24 border-[3.5px] border-[#E5A964] rounded-2xl transform rotate-45 pointer-events-none"></div>

          {/* Top Right Logo */}
          <div className="flex justify-end pt-2 pr-2 z-10">
            <img
              src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789970133/logo_white.png"
              alt="CareerMap Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Main Title Section */}
          <div className="mt-14 text-center z-10">
            <h1 className="text-4xl md:text-5xl font-black text-[#8C1814] tracking-tight leading-none uppercase font-['Plus_Jakarta_Sans']">
              CAREER<br/>PSYCHOMETRIC
            </h1>
            <div className="mt-2 text-lg md:text-xl font-bold tracking-[0.2em] text-[#8C1814] uppercase">
              ASSESSMENT REPORT
            </div>
            <p className="mt-5 text-base font-normal text-[#374151]">
              Discover Your True Strengths<br/>and Potential.
            </p>
          </div>

          {/* Center Graphic: 3D Illustration matching PDF */}
          <div className="my-auto py-6 text-center flex justify-center items-center z-10">
            <img
              src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982830/9.png"
              alt="Career Assessment 3D Brain"
              className="max-h-[300px] w-auto mx-auto object-contain drop-shadow-md"
            />
          </div>

          {/* Bottom Left Student Info Box */}
          <div className="z-10 pb-6">
            <div className="inline-block bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-5 shadow-xs max-w-md text-left">
              <div className="text-sm font-extrabold text-[#111827] mb-2.5">
                Student Information
              </div>
              <div className="space-y-1 text-sm text-[#1F2937]">
                <div><span className="font-normal text-slate-900">Name:</span> <strong className="font-semibold text-slate-900">{studentName}</strong></div>
                <div><span className="font-normal text-slate-900">Class:</span> <strong className="font-semibold text-slate-900">{studentClass}</strong></div>
                <div><span className="font-normal text-slate-900">School Name:</span> <strong className="font-semibold text-slate-900">{studentSchool}</strong></div>
                <div><span className="font-normal text-slate-900">Date:</span> <strong className="font-semibold text-slate-900">{formattedDate}</strong></div>
                <div><span className="font-normal text-slate-900">Email Id:</span> <strong className="font-semibold text-slate-900">{studentEmail}</strong></div>
                <div><span className="font-normal text-slate-900">Phone No:</span> <strong className="font-semibold text-slate-900">{studentPhone}</strong></div>
              </div>
            </div>
          </div>

          {/* Bottom Right Decorative Shapes matching PDF */}
          <div className="absolute -bottom-10 -right-10 flex gap-3 transform rotate-45 pointer-events-none z-0">
            <div className="w-24 h-48 bg-[#D1D5DB] rounded-3xl opacity-70"></div>
            <div className="w-28 h-60 bg-[#8C1814] rounded-3xl opacity-95 shadow-lg"></div>
          </div>
          <div className="absolute bottom-16 right-20 w-24 h-24 border-[3px] border-[#E5A964] rounded-2xl transform rotate-45 pointer-events-none"></div>
        </div>

        {/* ============================================================
            PAGE 2: DECLARATION
        ============================================================ */}
        <div className="pdf-page" id="page-2">
          <PageHeader studentFirstName={studentFirstName} />

          <div className="my-auto">
            <div className="title-pill-header">
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
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
                We appreciate your trust in our assessment process and recognize the importance of making informed educational and career decisions. This report has been prepared based on your responses to scientifically designed psychometric assessments and is intended to provide meaningful insights into your <strong className="font-bold text-[#1E232A]">aptitude, personality, interests and career preferences</strong>.
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">INTRODUCTION</span>
            </div>

            <p className="page-lead-text">
              The report presented by Career Map outlines key observations about <strong className="text-[#1E232A] font-bold">{studentName}</strong>’s personality profile, career interests, work preferences, cognitive strengths, and future career orientation. These outcomes are indicative, not definitive, and must be reviewed again in subsequent counselling meetings. Recommendations may shift based on deeper interaction and continuous assessment.
            </p>

            {/* Central Lightbulb + 6 Surrounding Petal Badges matching PDF Page 3 */}
            <div className="my-6 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982678/1.png"
                alt="Introduction Wheel"
                className="max-h-[420px] w-auto mx-auto object-contain"
              />
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">INTEREST</span>
            </div>

            <p className="page-lead-text">
              Your interests are the areas and activities that naturally capture your attention, curiosity, and motivation. They go beyond hobbies and point to the type of work where you will feel engaged and satisfied. The RIASEC model outlines six interest areas—Realistic, Investigative, Artistic, Social, Enterprising, and Conventional—each reflecting different strengths and preferences. Most individuals show a combination of these. Understanding your interest profile helps you explore careers that align with what inspires you, making work more enjoyable, learning more natural, and success more fulfilling.
            </p>

            {/* Concentric RIASEC Rings Diagram matching PDF */}
            <div className="my-6 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982703/2.png"
                alt="RIASEC Model"
                className="max-h-[420px] w-auto mx-auto object-contain"
              />
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

            {/* Horizontal Bar Chart matching PDF */}
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">PERSONALITY</span>
            </div>

            <p className="page-lead-text">
              Your personality is the blend of traits that shape how you think, feel, and behave. It influences how you solve problems, build relationships, manage stress, and respond to opportunities. The Big Five model describes personality through five dimensions: Openness (curiosity and creativity), Conscientiousness (discipline and responsibility), Extraversion (energy and sociability), Agreeableness (cooperation and empathy), and Emotional Stability (resilience under pressure). Each trait offers strengths, and different careers may suit different combinations.
            </p>
            <p className="page-lead-text">
              For example, conscientious individuals may excel in structured roles, while those high in openness may thrive in creative or innovative environments. Understanding your personality helps you choose careers that align with your natural style and identify areas for growth, making it easier to collaborate effectively and feel at ease in your work.
            </p>

            {/* 5-Tier Inverted Trapezoid Pyramid Stack matching PDF Page 8 */}
            <div className="my-6 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982721/3.png"
                alt="Big Five Personality"
                className="max-h-[360px] w-auto mx-auto object-contain"
              />
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
                <div className="detail-card-left-badge green flex flex-col items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="detail-card-num-circle">{item.num}</span>
                    <span className="text-[11px] font-extrabold leading-tight">{item.name}</span>
                  </div>
                  <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold self-end ${
                    item.band === "HIGH" ? "bg-white text-[#9C2A1F]" : "bg-white text-[#4D6D47]"
                  }`}>
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

            {/* Horizontal Green Bar Chart matching PDF */}
            <div className="h-bar-chart">
              <div className="h-bar-grid-header">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
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
              Emotional Stability is the positive side of the Neuroticism scale — a higher score means you stay calmer under pressure.
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
            <div className="title-pill-header lavender">
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">LEARNING STYLE</span>
            </div>

            <p className="page-lead-text">
              Everyone has a preferred way of learning, and knowing your style can make studying, training, and working much more effective. The VARK model highlights four main preferences: Visual learners understand best through charts, diagrams, and images; Auditory learners grasp information by listening, discussing, and explaining; Reading/Writing learners prefer text, lists, and notes; and Kinesthetic learners learn by doing, experiencing, and applying knowledge practically.
            </p>
            <p className="page-lead-text">
              While everyone can learn in all ways, most people have one or two stronger preferences. Recognizing your learning style helps you study smarter, prepare better for exams, and even choose careers that align with how you absorb and process information. For instance, a kinesthetic learner may feel more comfortable in hands-on professions, while a visual learner may enjoy design or engineering. Knowing your learning style empowers you to adapt your strategies in school and at work, making learning feel more natural and less stressful.
            </p>

            {/* Target Archery Diagram + 4 Pills matching PDF Page 11 */}
            <div className="my-6 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982739/4.png"
                alt="Learning Styles VARK"
                className="max-h-[360px] w-auto mx-auto object-contain"
              />
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
              <div className="detail-card-left-badge lavender">
                <span className="detail-card-num-circle">01</span>
                <span>VISUAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You prefer to learn via images, diagrams, flow charts, maps, symbolic representations. You benefit from seeing the structure, patterns, shapes, relationships.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Grasping spatial or structural relationships; memory aided by imagery; organising information visually.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Using flowcharts, infographics, videos, colorcoded notes, visual organizers, and symbolic representations to study or plan.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Learning spaces that use visual aids, presentations, digital whiteboards, concept maps, and multimedia tools — classrooms or workplaces where design, structure, and visual clarity are valued.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge lavender">
                <span className="detail-card-num-circle">02</span>
                <span>AUDITORY</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn through listening and speaking. Explaining ideas aloud helps you process them deeply. You benefit from discussions, storytelling, and audio recordings. You thrive in environments where oral communication is valued — such as teaching, counselling, performing, or team collaboration.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Expressive, articulate, and sensitive to tone and rhythm. You learn best through listening, discussion, and verbal explanation. You may remember information better when it’s heard rather than read.</div>
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
              <div className="detail-card-left-badge lavender">
                <span className="detail-card-num-circle">03</span>
                <span>READING/WRITING</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn best through written words, reading textbooks, taking notes, and creating summaries. You prefer books, articles, written instructions, and text-based research to absorb information deeply.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong comprehension, articulate expression, attention to written details, and organized text structuring.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Reading in-depth material, writing notes, creating glossaries, reviewing written summaries, and essay writing.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Libraries, quiet study halls, research institutions, and text-oriented environments.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge lavender">
                <span className="detail-card-num-circle">04</span>
                <span>KINAESTHETIC</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You learn through experience. Abstract ideas make sense when you can do something with them. You thrive when allowed to experiment, observe, and apply. This learning style supports success in applied fields like engineering, design, healthcare, sports, and performing arts anywhere learning connects mind and body.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Hands-on, practical, and experiential. You grasp concepts through physical movement, real-life examples, and direct engagement. You like “learning by doing” rather than only reading or listening.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Experiments, demonstrations, simulations, field visits, role plays, or building and testing ideas. You prefer tactile engagement and movement during learning.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Interactive, activity-based settings workshops, labs, studios, or outdoor spaces - where theory connects directly with practice.</div>
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
            <div className="score-rep-banner lavender">
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            {/* 4 Donut Gauges matching PDF Page 14 */}
            <div className="grid grid-cols-2 gap-8 my-8 max-w-md mx-auto text-center">
              <div>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#436CB3" strokeDasharray="100, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-xl text-[#1E3A8A]">100%</div>
                </div>
                <div className="mt-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">VISUAL</div>
              </div>

              <div>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#4E7B44" strokeDasharray="75, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-xl text-[#14532D]">75%</div>
                </div>
                <div className="mt-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">AUDITORY</div>
              </div>

              <div>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#9A8025" strokeDasharray="85, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-xl text-[#78350F]">85%</div>
                </div>
                <div className="mt-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">READING</div>
              </div>

              <div>
                <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#914545" strokeDasharray="60, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-xl text-[#7F1D1D]">60%</div>
                </div>
                <div className="mt-2 font-extrabold text-xs uppercase tracking-wider text-slate-800">KINESTHETIC</div>
              </div>
            </div>

            <div className="top-interests-box">
              <div className="score-rep-banner lavender" style={{ fontSize: "0.95rem" }}>
                Your Best Learning Styles are
              </div>
              <div className="flex justify-center gap-4">
                <div className="top-interest-pill lavender flex-1">VISUAL</div>
                <div className="top-interest-pill lavender flex-1">READING</div>
              </div>
              <div className="max-w-xs mx-auto mt-3">
                <div className="top-interest-pill lavender">AUDITORY</div>
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">WORK VALUES</span>
            </div>

            <p className="page-lead-text">
              "Work values are the core principles and priorities that define what matters most to you in a professional environment. They reflect what you seek from your career — whether that is achievement, recognition, security, autonomy, relationships, or making a meaningful impact. Unlike interests (what you enjoy) or personality (how you behave), work values reveal why certain careers feel more fulfilling than others.
            </p>
            <p className="page-lead-text">
              Understanding your work values helps you evaluate job opportunities beyond salary and title. When your work aligns with your values, you feel more motivated, satisfied, and committed. When it does not, even a well-paying or prestigious role can feel empty. Identifying your core values early helps you make career choices that bring long-term fulfilment."
            </p>

            {/* Schwartz Values Diamond Diagram matching PDF Page 15 */}
            <div className="my-6 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982759/5.png"
                alt="Schwartz Values"
                className="max-h-[360px] w-auto mx-auto object-contain"
              />
            </div>

            <p className="page-lead-text text-xs text-slate-600">
              Each trait brings strengths, and different careers suit different combinations. For example, highly conscientious individuals may excel in structured roles, while those high in openness may thrive in creative or innovative environments. Understanding your personality helps you choose careers that fit your natural style, identify areas for growth, and work more effectively with others.
            </p>
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">HERE ARE THE SUGGESTIONS AS PER VALUES</span>
            </div>

            {[
              { num: "01", name: "OPENNESS TO CHANGE", band: "HIGH", text: "Freedom, creativity and new experiences drive you — you'll thrive where you can decide how you work and what you explore." },
              { num: "02", name: "SELF-ENHANCEMENT", band: "HIGH", text: "Achievement, success and recognition strongly drive you — you'll thrive with clear goals, competition, growth ladders and visible results." },
              { num: "03", name: "SELF-TRANSCENDENCE", band: "MODERATE", text: "You care about fairness and helping others as part of a balanced set of motivations." },
              { num: "04", name: "CONSERVATION", band: "MODERATE", text: "You value a reasonable amount of stability and order while staying flexible when things shift." },
            ].map((item) => (
              <div key={item.num} className="detail-card-row">
                <div className="detail-card-left-badge green flex flex-col items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="detail-card-num-circle">{item.num}</span>
                    <span className="text-[11px] font-extrabold leading-tight">{item.name}</span>
                  </div>
                  <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-bold self-end ${
                    item.band === "HIGH" ? "bg-white text-[#9C2A1F]" : "bg-white text-[#4D6D47]"
                  }`}>
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
                { label: "OPENNESS TO CHANGE", val: valScoreMap.OC, color: "#4B6640" },
                { label: "SELF-ENHANCEMENT", val: valScoreMap.SE, color: "#5687BF" },
                { label: "SELF-TRANSCENDENCE", val: valScoreMap.ST, color: "#7584C4" },
                { label: "CONSERVATION", val: valScoreMap.CO, color: "#9B7C23" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between font-bold text-xs uppercase text-slate-800 mb-1.5">
                    <span>{item.label}</span>
                    <span>{item.val}%</span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">GOAL ORIENTATION</span>
            </div>

            <p className="page-lead-text">
              Goals guide your direction in studies, work, and personal growth. Your goal orientation reflects how you view success and what motivates you to achieve it. Some people focus on short-term goals—completing tasks, gaining quick skills, or achieving immediate results—while others are driven by long-term goals, such as building expertise, reaching leadership roles, or creating lasting impact. Both are important: short-term goals keep you motivated daily, while long-term goals provide vision and persistence.
            </p>
            <p className="page-lead-text">
              Understanding your orientation helps you balance present actions with future ambitions. Those with strong long-term focus may need to break goals into smaller steps, while short-term–focused individuals may benefit from planning for bigger aspirations. Knowing your goal orientation helps you use your energy effectively and stay aligned with your personal and career goals.
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
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Action-oriented, results-focused, responsive, task-driven, motivated by immediate feedback.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Completing tasks quickly, achieving daily or weekly targets, gaining visible and prompt results.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Fast-paced workplaces with clear, measurable short-cycle goals and regular performance check-ins.</div>
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
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Career ambition, major life objectives, mastering a field, long projects, cumulative growth.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Long-range planning, supportive structure, milestone expectations, clarity of desired destination.</div>
              </div>
            </div>

            {/* Comparison Strategy Cards matching PDF Page 19 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FDF8EE] border border-[#E8D39E] text-xs text-[#78540B] leading-relaxed">
                <strong className="block text-sm mb-1 uppercase text-[#4D370A] font-extrabold">SHORT TERM</strong>
                Aim for short milestones and rewards. Match with roles needing daily targets.
              </div>
              <div className="p-4 rounded-xl bg-[#FDF8EE] border border-[#E8D39E] text-xs text-[#78540B] leading-relaxed">
                <strong className="block text-sm mb-1 uppercase text-[#4D370A] font-extrabold">LONG TERM</strong>
                Use Vision boards, planning tools, long-term mentorship. Ideal for research, entrepreneurship, civil services.
              </div>
            </div>

            {/* 2 Donut Gauges */}
            <div className="score-rep-banner gold" style={{ fontSize: "0.95rem" }}>
              VISUAL REPRESENTATION OF YOUR SCORE
            </div>

            <div className="flex justify-center gap-16 text-center">
              <div>
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#8A701E" strokeDasharray="100, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-lg text-[#78540B]">100%</div>
                </div>
              </div>
              <div>
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path stroke="#B89635" strokeDasharray="80, 100" strokeWidth="4.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute font-black text-lg text-[#B45309]">80%</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#966B1D] text-white rounded-xl text-center font-extrabold text-sm uppercase tracking-wider shadow-xs">
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">APTITUDE</span>
            </div>

            <p className="page-lead-text">
              Your aptitude reflects your natural ability to learn, understand, and apply different skills. While interests show what you enjoy, aptitudes indicate what you can do well with practice. They are not fixed and can improve with training, but knowing your strongest aptitudes helps you identify areas where success may come more easily. Aptitude plays a key role in choosing a career because it shows which tasks, problem-solving styles, and skills will feel more comfortable and rewarding.
            </p>
            <div className="font-bold text-sm text-[#111827] mb-3">
              In this test, we assess six types of aptitudes:
            </div>

            {/* 6 Hanging Clip Badges matching PDF Page 20 */}
            <div className="my-4 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982779/6.png"
                alt="Aptitude Categories"
                className="max-h-[140px] w-auto mx-auto object-contain"
              />
            </div>

            {/* 4 Summary Cards matching PDF */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">MECHANICAL APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This shows how easily you understand machines, tools, and physical systems. If strong here, you may enjoy careers in engineering, mechanics, or technology where practical problem-solving is needed.
                </div>
              </div>
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">LOGICAL APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This reflects your ability to think critically, recognize patterns, and solve problems step by step. Strong logical reasoning is valuable in coding, mathematics, law, and research careers.
                </div>
              </div>
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">VERBAL APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This measures how well you can express ideas, understand language, and communicate clearly. Strong verbal skills are useful in teaching, law, media, and leadership roles.
                </div>
              </div>
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">VOCABULARY APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This shows the strength of your word knowledge and ability to use language effectively. It supports careers that rely on reading, writing, public speaking, or persuasion.
                </div>
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
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">NUMERICAL APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This measures comfort with numbers, calculations, and quantitative reasoning. It is crucial in careers related to finance, data science, economics, and technology.
                </div>
              </div>
              <div className="rounded-xl border border-[#9C2A1F] overflow-hidden">
                <div className="bg-[#9C2A1F] text-white p-2 text-center text-xs font-black uppercase">SPATIAL APTITUDE</div>
                <div className="p-3 text-xs leading-relaxed text-[#374151] bg-[#FDF2F1]">
                  This reflects your ability to imagine shapes, designs, and objects in space. Strong spatial skills are important for architecture, design, surgery, engineering, and visual arts.
                </div>
              </div>
            </div>

            <p className="page-lead-text text-xs">
              By identifying your aptitudes, you can better understand where your natural strengths lie and how to build on them. A career that matches both your interests and aptitudes allows you to learn faster, perform better, and feel more confident in your abilities.
            </p>

            {/* 01 NUMERICAL */}
            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">01</span>
                <span>NUMERICAL</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You think in structured, analytical ways and are comfortable dealing with quantities, formulas, and logic. You enjoy the clarity that numbers provide and are skilled at identifying relationships and trends in data. This aptitude helps you excel in problem-solving and evidence-based decision-making.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Logical, detail-oriented, and comfortable working with numbers and quantitative data. Strong in mathematical reasoning, pattern recognition, and data interpretation.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Working with statistics, solving quantitative problems, budgeting, coding, logical puzzles, or analyzing data.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Finance, data analysis, research, science, engineering, or technology-driven spaces that rely on precision and logic.</div>
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
                  You have a natural ability to think clearly, reason objectively, and identify the most logical pathway to a solution. You approach challenges methodically, preferring to understand why and how something works rather than just what happens.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Analytical, systematic, and conceptually clear thinker. You are skilled at recognizing patterns, making inferences, and drawing conclusions from abstract or structured information.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> You enjoy situations where reasoning matters more than rote learning — for example, decoding clues, troubleshooting systems, or analyzing cause-and-effect relationships.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> You thrive in spaces that reward rational thought — such as research, analytics, data science, technology, law, mathematics, or strategic planning.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">03</span>
                <span>VERBAL APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You have a strong ability to understand, interpret, and communicate ideas through language. You are comfortable processing written information and expressing thoughts clearly. This aptitude helps you analyze complex texts, articulate arguments effectively, and communicate ideas in a structured and meaningful way.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong comprehension, articulate expression, attention to language details, and the ability to interpret written information accurately. Skilled in reasoning with words and explaining concepts clearly.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Reading, writing, debating ideas, storytelling, analyzing written material, presenting ideas, or communicating information clearly to others.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Communication-focused fields such as media, journalism, education, law, marketing, public relations, and roles that involve presenting, writing, or explaining ideas.</div>
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
                  You demonstrate a strong understanding of word meanings, language nuances, and how words can be used effectively in different contexts. This aptitude helps you grasp complex ideas through language and communicate with clarity and precision.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong word knowledge, language awareness, comprehension of subtle differences in meaning, and the ability to use language effectively.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Learning new words, reading diverse material, writing, language-based quizzes or puzzles, editing content, and refining communication.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Language-rich environments such as publishing, media, education, writing, communication strategy, and roles that require strong language and articulation skills.</div>
              </div>
            </div>

            <div className="detail-card-row">
              <div className="detail-card-left-badge red">
                <span className="detail-card-num-circle">05</span>
                <span>MECHANICAL APTITUDE</span>
              </div>
              <div className="detail-card-right-body">
                <div className="detail-card-desc">
                  You are able to understand how physical systems, machines, and mechanical processes work. You tend to think in practical and functional ways, recognizing how components interact and how systems operate in real-world environments.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Practical thinker, strong problem-solving ability, understanding of mechanical systems, and an interest in how machines or tools function.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> Building, fixing, assembling, experimenting with tools or devices, understanding how machines operate, and solving practical technical problems.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Engineering workshops, manufacturing, technical industries, robotics, automotive environments, or hands-on technical fields that involve machinery and systems.</div>
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
                  You have the ability to visualize objects, shapes, and structures in three-dimensional space. You can mentally manipulate visual information, understand patterns, and imagine how different components fit together. This aptitude supports creativity, design thinking, and structural understanding.
                </div>
                <div className="detail-card-meta-row"><strong>Key Traits:</strong> Strong visual imagination, pattern recognition, spatial awareness, and the ability to mentally rotate or visualize objects.</div>
                <div className="detail-card-meta-row"><strong>Enjoys:</strong> You enjoy situations where reasoning matters more than rote learning — for example, decoding clues, troubleshooting systems, or analyzing cause-and-effect relationships.</div>
                <div className="detail-card-meta-row"><strong>Ideal Environments:</strong> Design, architecture, engineering, animation, product design, construction planning, and fields that require visual thinking and spatial planning.</div>
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

            {/* Vertical Column Bar Chart matching PDF Page 25 */}
            <div className="my-10 p-6 bg-white border border-slate-200 rounded-2xl max-w-lg mx-auto">
              <div className="h-64 flex items-end justify-between gap-4 border-b-2 border-slate-300 pb-2 relative">
                {/* Y-Axis Guidelines at 0, 10, 20, 30, 40, 50 */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
                  <div className="border-b border-slate-100 w-full text-left">50</div>
                  <div className="border-b border-slate-100 w-full text-left">40</div>
                  <div className="border-b border-slate-100 w-full text-left">30</div>
                  <div className="border-b border-slate-100 w-full text-left">20</div>
                  <div className="border-b border-slate-100 w-full text-left">10</div>
                  <div className="text-left">0</div>
                </div>

                {aptList.map((item) => (
                  <div key={item.key} className="flex-1 flex flex-col items-center gap-2 z-10">
                    <span className="text-xs font-bold text-slate-800">{item.val}%</span>
                    <div
                      className="w-full max-w-[36px] bg-[#933D3D] rounded-t-sm transition-all"
                      style={{ height: `${item.val * 3.8}px` }}
                    ></div>
                    <span className="text-[11px] font-bold text-slate-700 truncate">{item.label}</span>
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
              <div className="title-pill-icon-circle">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <span className="title-pill-text">INTEGRATED ANALYSIS</span>
            </div>

            <div className="text-xl font-black text-[#1E232A] uppercase tracking-tight">
              YOUR TOP CLUSTERS
            </div>
            <p className="text-xs text-[#6B7280] mb-4">
              Each card shows what the field involves, why it suits you, how to get there, and list of careers
            </p>

            {/* Counsellor + 5 Node Map Graphic matching PDF Page 26 */}
            <div className="my-4 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982787/7.png"
                alt="Top Clusters Map"
                className="max-h-[160px] w-auto mx-auto object-contain"
              />
            </div>

            {/* Top 1 Cluster Card */}
            <div className="cluster-match-card">
              <div className="cluster-match-card-header">
                <span className="cluster-match-title">1 {top5Clusters[0].name}</span>
                <span className="cluster-match-pct">{top5Clusters[0].matchPercentage}%</span>
              </div>
              <div className="cluster-match-card-body">
                <p className="mb-2 font-medium">{top5Clusters[0].description}</p>
                <p className="mb-2 text-slate-600">{top5Clusters[0].why_fit}</p>
                <div className="mt-2 text-xs">
                  <strong>Pathway in India:</strong> {top5Clusters[0].streams_and_pathways_india}
                </div>

                <div className="cluster-careers-grid">
                  {(top5Clusters[0].careers || []).slice(0, 10).map((c, i) => (
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
                  {(top5Clusters[1].careers || []).slice(0, 11).map((c, i) => (
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
                  {(top5Clusters[2].careers || []).slice(0, 10).map((c, i) => (
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
                  {(top5Clusters[3].careers || []).slice(0, 10).map((c, i) => (
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
                  {(top5Clusters[4].careers || []).slice(0, 10).map((c, i) => (
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
            <div className="score-rep-banner gold" style={{ fontSize: "1.05rem" }}>
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

            {/* 6-Lightbulb Study Roadmap matching PDF Page 29 */}
            <div className="mt-6 mb-4 flex justify-center items-center">
              <img
                src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789982823/8.png"
                alt="Study & Pathway Roadmap"
                className="max-h-[160px] w-full mx-auto object-contain"
              />
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

            {/* 6 Summary Metric Cards matching PDF Page 30 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">HOLLAND CODE</div>
                <div className="text-base font-extrabold text-[#9C2A1F]">{hollandCode}</div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP CLUSTER</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Business & Entrepreneurship <span className="text-[#9C2A1F] font-black">67%</span></div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP VALUE</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Openness to Change</div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">TOP TRAIT</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Emotional Stability</div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">LEARNING STYLE</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Visual</div>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase text-slate-500">GOAL ORIENTATION</div>
                <div className="text-sm font-extrabold text-slate-900 truncate">Balanced Planner</div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 mb-6">
              {studentName} shows an {hollandCode} interest pattern, which combined with emotional stability and a strong pull toward openness to change points most clearly toward Business & Entrepreneurship (67% match). Aptitude-wise, {studentName}’s strongest results are in Verbal Reasoning and Logical Reasoning, which support that direction. As a visual learner with a balanced planner approach to the path ahead, the study tips and route in Section 3 are the most relevant starting point.
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
          {/* Header with Logo */}
          <div className="flex justify-end pt-1 pr-1 mb-4">
            <img
              src="https://res.cloudinary.com/tj6xmmar/image/upload/v1789970133/logo_white.png"
              alt="CareerMap Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="my-auto space-y-5">
            <div className="relative">
              <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight">
                DISCOVER YOUR DIRECTION.<br/>
                <span className="text-[#9C2A1F]">DESIGN YOUR FUTURE.</span>
              </h2>
              {/* Paper airplane curve */}
              <div className="absolute top-0 right-4 text-3xl">✈️</div>
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
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>📊</span>
                  <span>PSYCHOMETRIC-BASED COUNSELLING</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>🏛️</span>
                  <span>CAREER COUNSELING CELL</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>👥</span>
                  <span>ONE-TO-ONE CAREER COUNSELLING</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>🧠</span>
                  <span>BEHAVIORAL & PSYCHOLOGICAL COUNSELLING</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>🎓</span>
                  <span>MULTIDIMENSIONAL STUDENT MENTORSHIP</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
                  <span>📱</span>
                  <span>INFORMATION DASHBOARD & APP</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
              Career Guidance Partner to the Government of Odisha, in association with UNICEF, OSEPA & DHSE. Present across 10,000+ students in CBSE, ICSE & residential schools — including with Knowledge Partnerships spanning and other leading institutions.
            </div>

            <div className="p-4 bg-[#9C2A1F] text-white rounded-2xl text-center shadow-md">
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
