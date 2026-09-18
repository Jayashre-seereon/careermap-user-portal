import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  HomeOutlined,
  LoadingOutlined,
  PrinterOutlined,
  DownloadOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Spin, message } from "antd";
import { getAttemptResult } from "../../../api/psychometricAssessmentApi";
import { useAuthStore } from "../../../store/authStore";
import {
  CLUSTERS,
  CLUSTER_MAP,
  INTERP,
  SEM_SUB,
  SEM_BLEND,
  CHART_COLOR,
  INTEREST_COLOR,
  VALUES_COLOR,
  PERSON_COLOR,
  VARK_COLOR,
  pct,
  band,
  bandColorHex,
} from "../data/careerCompassData";
import {
  DonutChart,
  ColumnChart,
  LineChart,
  TwinBars,
  HBarChart,
} from "../components/CareerCompassCharts";
import "./AssessmentReportPage.css";

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
        domains,
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F2F4F6]">
        <div className="text-center">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#9C2A1F" }} spin />} />
          <h2 className="mt-4 font-['Big_Shoulders_Display'] text-2xl font-black text-[#211B19]">
            Generating Career Compass Report...
          </h2>
          <p className="mt-1 font-['Source_Sans_3'] text-sm text-[#6E7075]">
            Synthesizing RIASEC, OCEAN, Schwartz Values, Aptitude and Goal Orientation
          </p>
        </div>
      </div>
    );
  }

  // Normalize API data
  const rawData = reportData || {};
  const report = rawData.report || {};
  const student = report.student || {};
  const studentName = student.name || rawData.studentName || user?.name || "Student Candidate";
  const studentClass = student.class || rawData.className || user?.selectedClass || "Senior Secondary";
  const studentSchool = student.school || rawData.school || user?.school || "";
  const completedDate = student.completedAt || rawData.completedAt || new Date().toISOString();

  const hollandCode = rawData.hollandCode || report.hollandProfile?.code || "SEC";
  const scores = rawData.scores || {};

  // Extract / calculate Goal Orientation percentages
  const domains = report.domains || {};
  const goalObj = domains.goalOrientation || {};
  const longScore =
    goalObj.longTerm?.score ??
    (goalObj.longTerm?.percentage != null ? goalObj.longTerm.percentage / 100 : null) ??
    scores.goalLong ??
    0.6875;
  const shortScore =
    goalObj.shortTerm?.score ??
    (goalObj.shortTerm?.percentage != null ? goalObj.shortTerm.percentage / 100 : null) ??
    scores.goalShort ??
    0.75;

  const longPct = goalObj.longTerm?.percentage ?? pct(longScore);
  const shortPct = goalObj.shortTerm?.percentage ?? pct(shortScore);

  const goalDiff = (longPct - shortPct) / 100;
  const goalKey = Math.abs(goalDiff) < 0.1 ? "balanced" : goalDiff > 0 ? "long_term" : "short_term";
  const goalMeta = INTERP.goal_orientation[goalKey] || INTERP.goal_orientation.balanced;

  // Top Cluster & Top 5
  const rawTopCluster = report.careerClusters?.topCluster || {};
  const rawTop5 = report.careerClusters?.top5 || rawData.top5Clusters || [];

  const topClusterCode = rawTopCluster.code || rawTopCluster.clusterId || "GOV";
  const topClusterMeta = CLUSTER_MAP[topClusterCode] || CLUSTER_MAP[rawData.topCareerCluster] || CLUSTERS[8];

  const topCluster = {
    code: topClusterCode,
    name: rawTopCluster.name || rawData.topCareerCluster || topClusterMeta.name,
    matchPercentage: rawTopCluster.matchPercentage || rawData.topCareerMatch || 67,
    description: rawTopCluster.description || topClusterMeta.description,
    why_fit: topClusterMeta.why_fit,
    streams_and_pathways_india: topClusterMeta.streams_and_pathways_india,
    careers: topClusterMeta.careers || [],
    fitI: rawTopCluster.fitI || 71,
    fitA: rawTopCluster.fitA || 51,
    fitP: rawTopCluster.fitP || 77,
    fitV: rawTopCluster.fitV || 74,
  };

  const top5Clusters = (rawTop5.length > 0 ? rawTop5 : [topCluster]).map((item, idx) => {
    const code = item.code || item.clusterId || "GOV";
    const meta = CLUSTER_MAP[code] || CLUSTER_MAP[item.name || item.cluster] || CLUSTERS[idx % CLUSTERS.length];
    return {
      rank: idx + 1,
      code,
      name: item.name || item.cluster || meta.name,
      matchPercentage: item.matchPercentage ?? item.match ?? 65,
      description: item.description || meta.description,
      why_fit: meta.why_fit,
      streams_and_pathways_india: meta.streams_and_pathways_india,
      careers: meta.careers || [],
      hollandCode: item.hollandCode || meta.holland_code,
      fitI: item.fitI || 70,
      fitA: item.fitA || 50,
      fitP: item.fitP || 75,
      fitV: item.fitV || 72,
    };
  });

  // Fit Composition breakdown for #1 match
  const fitItems = [
    { label: "Interests", value: 0.35 * topCluster.fitI, color: CHART_COLOR.slate },
    { label: "Aptitude", value: 0.3 * topCluster.fitA, color: CHART_COLOR.red },
    { label: "Personality", value: 0.2 * topCluster.fitP, color: CHART_COLOR.gold },
    { label: "Values", value: 0.15 * topCluster.fitV, color: CHART_COLOR.sage },
  ];
  const fitTotal = fitItems.reduce((a, b) => a + b.value, 0) || 1;

  // Domain 1: Interests (RIASEC)
  const interestFacets = ["R", "I", "A", "S", "E", "C"];
  const domainInterests = domains.interests || [];
  const interestScoreMap = {};
  domainInterests.forEach((d) => {
    interestScoreMap[d.facet] = d.percentage ?? pct(d.score);
  });
  interestFacets.forEach((f) => {
    if (interestScoreMap[f] == null) {
      interestScoreMap[f] = pct(scores[f] ?? 0.6);
    }
  });

  const riItems = interestFacets.map((f) => ({
    label: f,
    value: interestScoreMap[f],
    color: INTEREST_COLOR[f],
  }));
  const riRank = [...interestFacets]
    .map((f) => [f, interestScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);

  // Domain 2: Personality (OCEAN)
  const personFacets = ["O", "Cn", "Ex", "Ag", "ES"];
  const domainPerson = domains.personality || [];
  const personScoreMap = {};
  domainPerson.forEach((d) => {
    personScoreMap[d.facet] = d.percentage ?? pct(d.score);
  });
  personFacets.forEach((f) => {
    if (personScoreMap[f] == null) {
      personScoreMap[f] = pct(scores[f] ?? 0.7);
    }
  });
  const ocRank = [...personFacets]
    .map((f) => [f, personScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);
  const personChartItems = ocRank.map(([f, v]) => ({
    label: INTERP.personality[f]?.name || f,
    pct: v,
    color: PERSON_COLOR[f],
  }));

  // Domain 3: Values (Schwartz)
  const valFacets = ["OC", "SE", "CO", "ST"];
  const domainValues = domains.values || [];
  const valScoreMap = {};
  domainValues.forEach((d) => {
    valScoreMap[d.facet] = d.percentage ?? pct(d.score);
  });
  valFacets.forEach((f) => {
    if (valScoreMap[f] == null) {
      valScoreMap[f] = pct(scores[f] ?? 0.7);
    }
  });
  const valItems = valFacets.map((f) => ({
    label: f,
    value: valScoreMap[f],
    color: VALUES_COLOR[f],
  }));
  const valRank = [...valFacets]
    .map((f) => [f, valScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);

  // Domain 4: Aptitudes
  const aptFacets = ["Log", "Num", "Verb", "Voc", "Mech", "Spat"];
  const domainApt = domains.aptitudes || [];
  const aptScoreMap = {};
  domainApt.forEach((d) => {
    aptScoreMap[d.facet] = d.percentage ?? pct(d.score);
  });
  aptFacets.forEach((f) => {
    if (aptScoreMap[f] == null) {
      aptScoreMap[f] = pct(scores[f] ?? 0.5);
    }
  });
  const aptRank = [...aptFacets]
    .map((f) => [f, aptScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);
  const aptChartItems = aptRank.map(([f, v]) => ({
    label: f,
    pct: v,
    color: bandColorHex(v),
  }));

  // Domain 5: Learning Styles (VARK)
  const varkFacets = ["V", "A", "Rd", "K"];
  const domainVark = domains.learningStyles || [];
  const varkScoreMap = {};
  domainVark.forEach((d) => {
    varkScoreMap[d.facet] = d.percentage ?? pct(d.score);
  });
  varkFacets.forEach((f) => {
    if (varkScoreMap[f] == null) {
      varkScoreMap[f] = pct(scores.vark?.[f] ?? scores[f] ?? 0.7);
    }
  });
  const varkChartItems = varkFacets.map((f) => ({
    label: f,
    pct: varkScoreMap[f],
  }));
  const varkRank = [...varkFacets]
    .map((f) => [f, varkScoreMap[f]])
    .sort((a, b) => b[1] - a[1]);
  const varkGap = varkRank[0][1] - varkRank[1][1];
  const varkMulti = varkGap < 8; // less than 8% difference
  const varkName = (f) => INTERP.learning_style[f]?.name || f;
  const learnLabel = varkMulti
    ? `${varkName(varkRank[0][0])} + ${varkName(varkRank[1][0])} (multimodal)`
    : varkName(varkRank[0][0]);
  const tipFacets = varkMulti ? [varkRank[0][0], varkRank[1][0]] : [varkRank[0][0]];
  const tips = tipFacets.flatMap((f) => INTERP.learning_style[f]?.tips || []);

  // Roadmap Stops & Highlight based on Goal Orientation
  const roadStops = [
    { b: "Class 8–10", s: "Build basics", k: "base" },
    { b: "Stream choice", s: "Class 11 onward", k: "stream" },
    { b: "Entrance prep", s: "If required", k: "entrance" },
    { b: "Degree / course", s: "College years", k: "degree" },
    { b: "Internship", s: "Real experience", k: "intern" },
    { b: "Career", s: "Your destination", k: "career" },
  ];
  const hiSet = {
    long_term: ["stream", "entrance", "degree"],
    short_term: ["stream", "intern", "career"],
    balanced: ["stream", "degree", "intern"],
  }[goalKey] || ["stream", "degree", "intern"];

  // Leg 4 Passport Narrative
  const top1 = top5Clusters[0] || topCluster;
  const topValue = INTERP.values[valRank[0][0]]?.name || "Self-Enhancement";
  const topTrait = INTERP.personality[ocRank[0][0]]?.name || "Conscientiousness";
  const topApt1 = INTERP.aptitude[aptRank[0][0]]?.name || "Mechanical Reasoning";
  const topApt2 = INTERP.aptitude[aptRank[1][0]]?.name || "Logical Reasoning";

  const narrative = `${studentName} shows a ${hollandCode} interest pattern, which combined with ${topTrait.toLowerCase()} and a strong pull toward ${topValue.toLowerCase()} points most clearly toward ${top1.name} (${top1.matchPercentage}% match). Aptitude-wise, ${studentName}'s strongest results are in ${topApt1} and ${topApt2}, which support that direction. As a ${learnLabel.toLowerCase()} learner with a ${goalMeta.name.toLowerCase()} approach to the path ahead, the study tips and route in Section 3 are the most relevant starting point.`;

  return (
    <div className="career-compass-page ">
      {/* Sticky Top Bar with brand logo, stage label, and navigation */}
      <div className="topbar">
        <div className="topbar-inner">
         <div className="brandrow">
  <div className="flex items-center gap-3 pb-2">
    <button
      onClick={() => navigate("/app/assessment")}
      className="btn btn-accent btn-sm !rounded-full !px-3 py-1 inline-flex items-center gap-1.5"
    >
      <ArrowLeftOutlined /> Assessments
    </button>
  </div>

  <div className="flex items-center">
    <button
      onClick={handlePrint}
      className="btn btn-accent btn-sm !rounded-full !px-3 py-1 inline-flex items-center gap-1.5"
    >
      <PrinterOutlined /> Print / PDF
    </button>
  </div>
</div>
        </div>
      </div>

      <div className="wrap">
        {/* Report Header */}
        <div className="report-head">
          <div className="eyebrow">Career Compass · Final Report</div>
          <h2>{studentName}&apos;s Career Map</h2>
          <div className="report-meta">
            {studentClass}
            {studentSchool ? ` · ${studentSchool}` : ""} · Completed{" "}
            {new Date(completedDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Subnav Anchor Links */}
        <nav className="subnav">
          <a href="#leg1">1 · Clusters</a>
          <a href="#leg2">2 · Your Profile</a>
          <a href="#leg3">3 · Direction</a>
          <a href="#leg4">4 · Summary</a>
        </nav>

        {/* ============================================================
            LEG 1: Career Clusters Suited to You
        ============================================================ */}
        <section className="leg" id="leg1">
          <span className="legtag">
            <span className="pinmini"></span>Section 1 of 4
          </span>
          <h2>Career Clusters Suited to You</h2>
          <p className="lede">
            Your top 5 matches out of 18 career clusters and 360+ careers, ranked by how closely they fit
            your interests, aptitude, personality and values.
          </p>

          {/* Holland Strip */}
          <div className="holland-strip">
            {hollandCode.split("").slice(0, 3).map((L, i) => (
              <div key={i} className="tile">
                {L}
              </div>
            ))}
            <div className="holland-label">
              Your <b>Holland Code: {hollandCode}</b> — your three strongest interest types, used worldwide
              to describe career fit.
            </div>
          </div>

          {/* Top 5 Clusters Card */}
          <div className="rcard">
            <h3>Your Top 5 Clusters</h3>
            <div className="sub">
              Each card shows what the field involves, why it suits you, how to get there in India, and
              example careers.
            </div>

            {top5Clusters.map((cluster) => {
              const careers = cluster.careers || [];
              const shown = careers.slice(0, 10);
              const rest = careers.slice(10);
              const isSem = cluster.code === "SEM" || cluster.name.includes("Science, Engineering");

              return (
                <div key={cluster.code} className="cluster-row">
                  <div className="cluster-top">
                    <span className="cluster-name">
                      <span className="pinbadge">
                        <span>{cluster.rank}</span>
                      </span>
                      {cluster.name}
                    </span>
                    <span className="cluster-pct">{cluster.matchPercentage}%</span>
                  </div>

                  <div className="matchbar">
                    <i style={{ width: `${cluster.matchPercentage}%` }}></i>
                  </div>

                  <div className="clusterdesc">{cluster.description}</div>
                  {cluster.why_fit && <div className="whyfit">{cluster.why_fit}</div>}
                  {cluster.streams_and_pathways_india && (
                    <div className="pathway">
                      <b>Pathway in India: </b>
                      {cluster.streams_and_pathways_india}
                    </div>
                  )}

                  {shown.length > 0 && (
                    <div className="chips">
                      {shown.map((c, ci) => (
                        <span key={ci} className="chip">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  {rest.length > 0 && (
                    <details className="morejobs">
                      <summary>+ {rest.length} more careers in this cluster</summary>
                      <div className="chips">
                        {rest.map((c, ci) => (
                          <span key={ci} className="chip">
                            {c}
                          </span>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* SEM Sub-cluster Card if SEM is in top clusters */}
                  {isSem && (
                    <div className="semcard">
                      <h4>Within Science, Engineering &amp; Mathematics — your best-fit science fields</h4>
                      {SEM_SUB.slice(0, 3).map((sub, si) => (
                        <div key={sub.sub_id} className="semrow">
                          <div className="top">
                            <span>
                              {si + 1}. {sub.name}
                            </span>
                            <span>{cluster.matchPercentage - si * 2}%</span>
                          </div>
                          <div className="sig">
                            {sub.signature} <i>Example careers: {sub.careers_hint}.</i>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fit Composition Block for Top Cluster */}
          <div className="rcard">
            <h3>What&apos;s Driving Your #1 Match</h3>
            <div className="sub">
              {topCluster.name} — {topCluster.matchPercentage}% overall match, built from four parts of your
              profile.
            </div>
            <div className="fitcomp">
              <DonutChart items={fitItems} size={150} thickness={24} />
              <div className="fitlegend">
                {fitItems.map((it) => (
                  <div key={it.label} className="row">
                    <span className="swatch" style={{ background: it.color }}></span>
                    <span>{it.label}</span>
                    <b style={{ marginLeft: "auto", fontFamily: "'IBM Plex Mono', monospace" }}>
                      {Math.round((it.value / fitTotal) * 100)}%
                    </b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            LEG 2: Your Profile, In Detail (6 Domains + Charts)
        ============================================================ */}
        <section className="leg" id="leg2">
          <span className="legtag">
            <span className="pinmini"></span>Section 2 of 4
          </span>
          <h2>Your Profile, In Detail</h2>
          <p className="lede">
            Six results from the assessment, each with its own chart. Bands (developing / moderate / high)
            describe where you stand relative to typical responses, not pass/fail marks.
          </p>

          {/* 1. Interests · RIASEC */}
          <div className="domain-card">
            <h3>Interests · RIASEC</h3>
            <div className="domain-desc">
              These six types describe what kinds of activities energise you — together they form your
              Holland Code.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <DonutChart items={riItems} size={176} thickness={30} />
              </div>
              <div className="legendcol">
                {riRank.map(([f, val]) => {
                  const bd = band(val);
                  const meta = INTERP.interest[f] || {};
                  return (
                    <div key={f} className="legrow">
                      <div className="head">
                        <span className="name">
                          <span className="swatch" style={{ background: INTEREST_COLOR[f] }}></span>
                          {meta.name || f}
                        </span>
                        <span className="pctval">{val}%</span>
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        <span className={`bandchip ${bd}`}>{bd}</span>
                      </div>
                      <div className="blurb">{meta.blurbs?.[bd] || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Personality · OCEAN */}
          <div className="domain-card">
            <h3>Personality · OCEAN</h3>
            <div className="domain-desc">
              Five broad traits that describe how you typically think, feel and act.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <HBarChart items={personChartItems} width={320} />
              </div>
              <div className="legendcol">
                {ocRank.map(([f, val]) => {
                  const bd = band(val);
                  const meta = INTERP.personality[f] || {};
                  return (
                    <div key={f} className="legrow">
                      <div className="head">
                        <span className="name">
                          <span className="swatch" style={{ background: PERSON_COLOR[f] }}></span>
                          {meta.name || f}
                        </span>
                        <span className="pctval">{val}%</span>
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        <span className={`bandchip ${bd}`}>{bd}</span>
                      </div>
                      <div className="blurb">{meta.blurbs?.[bd] || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="note">{INTERP.report_disclaimers.es_note}</div>
          </div>

          {/* 3. Values · Schwartz Values */}
          <div className="domain-card">
            <h3>What You Value · Schwartz Values</h3>
            <div className="domain-desc">
              What matters to you when you imagine your work and your life.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <DonutChart items={valItems} size={176} thickness={30} />
              </div>
              <div className="legendcol">
                {valRank.map(([f, val]) => {
                  const bd = band(val);
                  const meta = INTERP.values[f] || {};
                  return (
                    <div key={f} className="legrow">
                      <div className="head">
                        <span className="name">
                          <span className="swatch" style={{ background: VALUES_COLOR[f] }}></span>
                          {meta.name || f}
                        </span>
                        <span className="pctval">{val}%</span>
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        <span className={`bandchip ${bd}`}>{bd}</span>
                      </div>
                      <div className="blurb">{meta.blurbs?.[bd] || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Aptitude */}
          <div className="domain-card">
            <h3>Aptitude</h3>
            <div className="domain-desc">
              How you performed on six kinds of reasoning — these are skills, and skills can be built
              further with practice.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <ColumnChart items={aptChartItems} width={360} height={210} />
              </div>
              <div className="legendcol">
                {aptRank.map(([f, val]) => {
                  const bd = band(val);
                  const meta = INTERP.aptitude[f] || {};
                  return (
                    <div key={f} className="legrow">
                      <div className="head">
                        <span className="name">
                          <span className="swatch" style={{ background: bandColorHex(val) }}></span>
                          {meta.name || f}
                        </span>
                        <span className="pctval">{val}%</span>
                      </div>
                      <div style={{ marginTop: "5px" }}>
                        <span className={`bandchip ${bd}`}>{bd}</span>
                      </div>
                      <div className="blurb">{meta.blurbs?.[bd] || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="note">{INTERP.report_disclaimers.apt_note}</div>
          </div>

          {/* 5. Learning Style · VARK */}
          <div className="domain-card">
            <h3>Learning Style · VARK</h3>
            <div className="domain-desc">
              How information tends to stick best for you when you&apos;re studying.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <LineChart items={varkChartItems} width={340} height={190} color={CHART_COLOR.slate} />
              </div>
              <div className="legendcol">
                {varkFacets.map((f) => {
                  const meta = INTERP.learning_style[f] || {};
                  return (
                    <div key={f} className="legrow">
                      <div className="head">
                        <span className="name">
                          <span className="swatch" style={{ background: VARK_COLOR[f] }}></span>
                          {meta.name || f}
                        </span>
                        <span className="pctval">{varkScoreMap[f]}%</span>
                      </div>
                      <div className="blurb">{meta.description || ""}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 6. Goal Orientation (Rendered prominently as requested) */}
          <div className="domain-card" id="domain-goal-orientation">
            <h3>Goal Orientation</h3>
            <div className="domain-desc">
              How you&apos;re currently weighing more years of study against starting work sooner. These are
              independent scores, not two ends of one scale.
            </div>
            <div className="chartrow">
              <div className="chartbox">
                <TwinBars longPct={longPct} shortPct={shortPct} width={340} height={110} />
              </div>
              <div className="legendcol">
                <div className="legrow">
                  <div className="head">
                    <span className="name">
                      <span className="swatch" style={{ background: CHART_COLOR.red }}></span>
                      Long-term orientation
                    </span>
                    <span className="pctval">{longPct}%</span>
                  </div>
                  <div style={{ marginTop: "5px" }}>
                    <span className={`bandchip ${band(longPct)}`}>{band(longPct)}</span>
                  </div>
                  <div className="blurb">
                    Comfort with investing several more years in education before starting a career.
                  </div>
                </div>

                <div className="legrow">
                  <div className="head">
                    <span className="name">
                      <span className="swatch" style={{ background: CHART_COLOR.slate }}></span>
                      Short-term orientation
                    </span>
                    <span className="pctval">{shortPct}%</span>
                  </div>
                  <div style={{ marginTop: "5px" }}>
                    <span className={`bandchip ${band(shortPct)}`}>{band(shortPct)}</span>
                  </div>
                  <div className="blurb">
                    Preference for entering work or skill-based training sooner.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            LEG 3: Your Direction: Study & Pathway Advice
        ============================================================ */}
        <section className="leg" id="leg3">
          <span className="legtag">
            <span className="pinmini"></span>Section 3 of 4
          </span>
          <h2>Your Direction: Study &amp; Pathway Advice</h2>
          <p className="lede">
            Turning your learning style and goal orientation into concrete next steps.
          </p>

          <div className="rcard">
            <div className="advice-recap">
              <span className="recapchip">
                Learning style <b>{learnLabel}</b>
              </span>
              <span className="recapchip">
                Goal orientation <b>{goalMeta.name}</b>
              </span>
            </div>

            <h3>How to study, based on how you learn</h3>
           <ul className="tips list-disc pl-5 space-y-2">
  {tips.map((tip, idx) => (
    <li key={idx}>{tip}</li>
  ))}
</ul>

            <h3 style={{ marginTop: "24px" }}>Your pathway approach</h3>
            <p>{goalMeta.text}</p>

            <h3 style={{ marginTop: "24px" }}>A general route from where you are now</h3>
            <div className="roadmap">
              {roadStops.map((st) => (
                <div key={st.k} className={`stop ${hiSet.includes(st.k) ? "hi" : ""}`}>
                  <div className="pin3"></div>
                  <b>{st.b}</b>
                  <span>{st.s}</span>
                </div>
              ))}
            </div>

            <div className="note">
              Highlighted stops are where your current goal orientation matters most — this is a general
              route, not a fixed plan. Talk it through with a teacher, counsellor or parent before locking
              in big decisions.
            </div>
          </div>
        </section>

        {/* ============================================================
            LEG 4: Your Complete Career Map (Passport & Next Steps)
        ============================================================ */}
        <section className="leg" id="leg4">
          <span className="legtag">
            <span className="pinmini"></span>Section 4 of 4
          </span>
          <h2>Your Complete Career Map</h2>
          <p className="lede">Everything above, brought together into one summary.</p>

          {/* The Career Passport Card */}
          <div className="passport">
            <div className="ptitle">Career Compass · Comprehensive Report</div>
            <h2>{studentName}</h2>
            <div className="stats">
              <div className="stat">
                <div className="k">Holland Code</div>
                <div className="v">{hollandCode}</div>
              </div>
              <div className="stat">
                <div className="k">Top Cluster</div>
                <div className="v">{top1.name}</div>
              </div>
              <div className="stat">
                <div className="k">Match</div>
                <div className="v">{top1.matchPercentage}%</div>
              </div>
              <div className="stat">
                <div className="k">Top Value</div>
                <div className="v">{topValue}</div>
              </div>
              <div className="stat">
                <div className="k">Top Trait</div>
                <div className="v">{topTrait}</div>
              </div>
              <div className="stat">
                <div className="k">Learning Style</div>
                <div className="v">{learnLabel}</div>
              </div>
              <div className="stat">
                <div className="k">Goal Orientation</div>
                <div className="v">{goalMeta.name}</div>
              </div>
            </div>
            <p className="narr">{narrative}</p>
          </div>

          {/* Actionable Next Steps */}
         <div className="rcard nextcard">
  <h3>What to do next</h3>

  <ul className="tips list-disc pl-6">
    <li>Read through your top 5 clusters in Section 1 with a parent, teacher or counsellor.</li>
    <li>Shortlist 2–3 clusters and look up their stream/subject requirements for your class.</li>
    <li>Use the study tips in Section 3 for the next exam cycle.</li>
    <li>
      Retake this assessment in 6–12 months — interests and skills develop,
      especially in these years.
    </li>
  </ul>
</div>

          <div className="note">
            {INTERP.report_disclaimers.match_note} {INTERP.report_disclaimers.retest_note}
          </div>

          {/* Action Buttons Row */}
          <div className="printrow">
            <button className="btn btn-primary " onClick={handlePrint}>
              <PrinterOutlined className="mr-2" /> Print / Save as PDF
            </button>
            <button className="btn btn-outline" onClick={handleDownloadJSON}>
              <DownloadOutlined className="mr-2" /> Download Report (JSON)
            </button>
            <button
              className="btn btn-accent"
              onClick={() => navigate("/app/library")}
            >
              <BookOutlined className="mr-2" /> Explore Careers Library
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
