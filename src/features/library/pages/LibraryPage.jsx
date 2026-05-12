import { useEffect, useState } from "react";
import {
  BookOutlined,
  BranchesOutlined,
  CreditCardOutlined,
  ExperimentOutlined,
  FolderOpenOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  List,
  Modal,
  Row,
  Space,
  Statistic,
  Timeline,
  Typography,
} from "antd";
import { useSearchParams } from "react-router-dom";
import { careerLibrary } from "../../../data/careermapData";
import { PageHero, SectionCard, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import {
  PremiumGate,
  usePortalNavigation,
} from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

/* ─── Design tokens ─────────────────────────────────────── */
const C = {
  crimson: "#9a2119",
  crimsonDark: "#6e160f",
  crimsonLight: "#f7ebe6",
  crimsonMid: "#c94030",
  cream: "#fdf6f0",
  ink: "#1a0a08",
  muted: "#7a5c56",
  border: "#eedad4",
  cardBg: "#fffaf7",
  white: "#ffffff",
};

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
`;

const globalStyles = `
  ${fontImport}

  .lib-root { font-family: 'DM Sans', sans-serif; background: ${C.cream}; min-height: 100vh; }

  /* ── Stream cards ── */
  .lib-stream-card {
    background: ${C.cardBg} !important;
    border: 1.5px solid ${C.border} !important;
    border-radius: 16px !important;
    transition: all 0.25s ease !important;
    overflow: hidden !important;
    position: relative;
  }
  .lib-stream-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: ${C.crimson};
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.25s ease;
  }
  .lib-stream-card:hover::before { transform: scaleY(1); }
  .lib-stream-card:hover {
    box-shadow: 0 8px 32px rgba(154,33,25,0.12) !important;
    transform: translateY(-3px) !important;
    border-color: ${C.crimsonLight} !important;
  }

  /* ── Category / program cards ── */
  .lib-cat-card {
    background: ${C.cardBg} !important;
    border: 1.5px solid ${C.border} !important;
    border-radius: 14px !important;
    transition: all 0.22s ease !important;
  }
  .lib-cat-card:hover {
    box-shadow: 0 6px 24px rgba(154,33,25,0.10) !important;
    border-color: ${C.crimson} !important;
    transform: translateY(-2px) !important;
  }

  /* ── Program list cards ── */
  .lib-program-item .ant-list-item { border: none !important; padding: 6px 0 !important; }
  .lib-program-card {
    background: ${C.cardBg} !important;
    border: 1.5px solid ${C.border} !important;
    border-radius: 12px !important;
    transition: all 0.2s ease !important;
  }
  .lib-program-card:hover {
    box-shadow: 0 4px 20px rgba(154,33,25,0.10) !important;
    border-color: ${C.crimsonMid} !important;
    background: ${C.white} !important;
  }

  /* ── Icon badge ── */
  .lib-icon-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px; height: 42px;
    border-radius: 12px;
    background: ${C.crimsonLight};
    color: ${C.crimson};
    font-size: 18px;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
  }
  .lib-stream-card:hover .lib-icon-badge,
  .lib-cat-card:hover .lib-icon-badge,
  .lib-program-card:hover .lib-icon-badge {
    background: ${C.crimson};
    color: ${C.white};
  }

  /* ── Card heading text ── */
  .lib-card-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 700;
    color: ${C.ink};
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  /* ── Card desc ── */
  .lib-card-desc {
    font-size: 13.5px;
    color: ${C.muted};
    line-height: 1.6;
    margin-top: 6px;
  }

  /* ── Tag overrides ── */
  .lib-tag-free {
    background: #e6f9f0 !important;
    border-color: #a3e0c2 !important;
    color: #1a7a4a !important;
    border-radius: 20px !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.04em !important;
    padding: 1px 10px !important;
  }
  .lib-tag-lock {
    background: #f5f5f5 !important;
    border-color: #e0e0e0 !important;
    color: #888 !important;
    border-radius: 20px !important;
    font-size: 10.5px !important;
    font-weight: 600 !important;
    letter-spacing: 0.04em !important;
    padding: 1px 10px !important;
  }

  /* ── Section card / detail overrides ── */
  .lib-section-card .ant-card {
    border: 1.5px solid ${C.border} !important;
    border-radius: 14px !important;
    background: ${C.cardBg} !important;
  }
  .lib-section-card .ant-card-head {
    border-bottom: 1px solid ${C.border} !important;
    padding: 16px 24px !important;
  }
  .lib-section-card .ant-card-head-title {
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    color: ${C.ink} !important;
  }

  /* ── Timeline dot color ── */
  .lib-root .ant-timeline-item-head { border-color: ${C.crimson} !important; }
  .lib-root .ant-timeline-item-tail { border-color: ${C.border} !important; }

  /* ── Statistic ── */
  .lib-root .ant-statistic-content-value {
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 28px !important;
    color: ${C.crimson} !important;
    font-weight: 700 !important;
  }

  /* ── Wishlist button ── */
  .lib-wishlist-btn {
    border-color: ${C.border} !important;
    color: ${C.crimson} !important;
    background: transparent !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
  }
  .lib-wishlist-btn:hover {
    background: ${C.crimsonLight} !important;
    border-color: ${C.crimson} !important;
  }

  /* ── Modal ── */
  .lib-modal .ant-modal-content {
    border-radius: 18px !important;
    padding: 0 !important;
    overflow: hidden;
  }
  .lib-modal .ant-modal-header {
    padding: 22px 28px 0 !important;
    border-bottom: none !important;
    background: ${C.cardBg} !important;
  }
  .lib-modal .ant-modal-title {
    font-family: 'Cormorant Garamond', serif !important;
    font-size: 22px !important;
    font-weight: 700 !important;
    color: ${C.ink} !important;
  }
  .lib-modal .ant-modal-body {
    padding: 16px 28px 28px !important;
    background: ${C.cardBg} !important;
  }

  /* ── Primary button ── */
  .lib-btn-primary {
    background: ${C.crimson} !important;
    border-color: ${C.crimson} !important;
    border-radius: 9px !important;
    font-weight: 500 !important;
    font-size: 13.5px !important;
    height: 38px !important;
    padding: 0 20px !important;
    transition: background 0.2s !important;
  }
  .lib-btn-primary:hover {
    background: ${C.crimsonDark} !important;
    border-color: ${C.crimsonDark} !important;
  }
  .lib-btn-outline {
    border-color: ${C.border} !important;
    color: ${C.muted} !important;
    border-radius: 9px !important;
    font-size: 13.5px !important;
    height: 38px !important;
    padding: 0 20px !important;
  }
  .lib-btn-outline:hover {
    border-color: ${C.crimson} !important;
    color: ${C.crimson} !important;
  }

  /* ── Section heading band ── */
  .lib-level-heading {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 700;
    color: ${C.ink};
    letter-spacing: -0.02em;
    margin-bottom: 4px;
  }
  .lib-level-sub {
    font-size: 13.5px;
    color: ${C.muted};
    margin-bottom: 24px;
  }

  /* ── Breadcrumb strip ── */
  .lib-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: ${C.muted};
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .lib-breadcrumb-sep { opacity: 0.4; }
  .lib-breadcrumb-active { color: ${C.crimson}; font-weight: 600; }

  /* ── List item rule ── */
  .lib-root .ant-list-item {
    border-bottom: 1px solid ${C.border} !important;
    padding: 10px 0 !important;
    font-size: 14px !important;
    color: ${C.ink} !important;
  }

  /* ── Fade-in animation ── */
  @keyframes libFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .lib-fade { animation: libFadeUp 0.35s ease both; }
  .lib-fade-d1 { animation-delay: 0.05s; }
  .lib-fade-d2 { animation-delay: 0.10s; }
  .lib-fade-d3 { animation-delay: 0.15s; }
  .lib-fade-d4 { animation-delay: 0.20s; }
  .lib-fade-d5 { animation-delay: 0.25s; }
`;

/* ─── Inject styles once ─────────────────────────────────── */
function LibraryStyles() {
  return <style>{globalStyles}</style>;
}

/* ─── Breadcrumb helper ──────────────────────────────────── */
function LibraryBreadcrumb({ stream, category, program, level }) {
  const parts = [];
  if (stream)   parts.push({ label: stream });
  if (category) parts.push({ label: category });
  if (program && level === "details") parts.push({ label: program });

  if (!parts.length) return null;

  return (
    <div className="lib-breadcrumb">
      <span>Career Library</span>
      {parts.map((p, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span className="lib-breadcrumb-sep">›</span>
          <span className={i === parts.length - 1 ? "lib-breadcrumb-active" : ""}>{p.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function LibraryPage() {
  const {
    canAccessFreeDetail,
    isUnlocked,
    registerFreeDetailAccess,
    savedCareers,
    toggleSavedCareer,
  } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("career-library");
  const [level, setLevel] = useState("streams");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);

  const detail = careerLibrary.details[selectedDetail] || {
    title: selectedDetail,
    overview: `${selectedDetail} is a specialized field offering excellent career prospects.`,
    path: ["Step 1", "Step 2", "Step 3", "Career Position"],
    education: "Relevant degrees required",
    exams: ["Relevant Entrance Exams"],
    jobs: ["Career Options"],
    salary: "Rs 3-20 LPA",
    institutes: ["Leading Institutes"],
  };

  const isSaved = detail.title && savedCareers.includes(detail.title);
  const detailUnlocked =
    !selectedDetail || unlocked || canAccessFreeDetail("career-library", selectedDetail);

  const streamIcons = {
    Science: <ExperimentOutlined />,
    Commerce: <CreditCardOutlined />,
    "Arts & Humanities": <BookOutlined />,
    Vocational: <ToolOutlined />,
    Neutral: <BranchesOutlined />,
  };

  /* ── Unchanged helper functions ── */
  function buildLibraryReturnTo(detailName = selectedDetail) {
    const nextParams = new URLSearchParams();
    if (selectedStream)  nextParams.set("stream", selectedStream);
    if (selectedCategory) nextParams.set("category", selectedCategory);
    if (selectedProgram)  nextParams.set("program", selectedProgram);
    if (detailName)       nextParams.set("detail", detailName);
    if (detailName)       nextParams.set("level", "details");
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  function openCareerDetail(item) {
    registerFreeDetailAccess("career-library", item);
    setSelectedProgram(item);
    setSelectedDetail(item);
    setLevel("details");
  }

  function handleLockedCareerClick(item) {
    if (!unlocked && !canAccessFreeDetail("career-library", item)) {
      setUnlockModalItem(item);
      return;
    }
    openCareerDetail(item);
  }

  function handleGoToPlans() {
    const returnTo = buildLibraryReturnTo(unlockModalItem);
    setUnlockModalItem(null);
    navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
  }

  useEffect(() => {
    const stream      = params.get("stream");
    const category    = params.get("category");
    const program     = params.get("program");
    const detailName  = params.get("detail");
    const requestedLevel = params.get("level");
    if (!stream && !category && !program && !detailName) return;
    if (stream)    setSelectedStream(stream);
    if (category)  setSelectedCategory(category);
    if (program)   setSelectedProgram(program);
    if (detailName) setSelectedDetail(detailName);
    if (requestedLevel === "details" && detailName) setLevel("details");
    else if (program || category) setLevel("programs");
    else if (stream) setLevel("categories");
  }, [params]);

  function back() {
    if (level === "details")    { setLevel("programs");    setSelectedDetail(null); }
    else if (level === "programs")   { setLevel("categories"); setSelectedProgram(null); }
    else if (level === "categories") { setLevel("streams");    setSelectedCategory(null); }
  }

  /* ── Card heading (restyled) ── */
  function renderLibraryCardHeading(title, icon) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="lib-icon-badge">{icon}</span>
        <span className="lib-card-title">{title}</span>
      </div>
    );
  }

  /* ── Level copy map ── */
  const levelMeta = {
    streams:    { heading: "Career Library",            sub: "Choose a stream to begin exploring career paths." },
    categories: { heading: selectedStream || "",        sub: "Select a category within this stream." },
    programs:   { heading: selectedCategory || "",      sub: "Choose a career to view full details." },
    details:    { heading: detail.title || "",          sub: null },
  };
  const meta = levelMeta[level];

  return (
    <div  >
      <LibraryStyles />

      <PageHero backOnly onBack={level !== "streams" ? back : () => navigate(-1)} />

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>
        {/* Breadcrumb */}
        <LibraryBreadcrumb
          stream={selectedStream}
          category={selectedCategory}
          program={selectedProgram}
          level={level}
        />

        {/* Level heading */}
        {meta.heading && (
          <div className="lib-fade" style={{ marginBottom: 24 }}>
            <div className="lib-level-heading">{meta.heading}</div>
            {meta.sub && <div className="lib-level-sub">{meta.sub}</div>}
            <div style={{ width: 40, height: 3, background: C.crimson, borderRadius: 2 }} />
          </div>
        )}

        {/* ── STREAMS ── */}
        {level === "streams" && (
          <Row gutter={[18, 18]}>
            {careerLibrary.streams.map((stream, idx) => (
              <Col xs={24} md={12} lg={8} key={stream.name}>
                <Card
                  hoverable
                  className={`lib-stream-card lib-fade lib-fade-d${Math.min(idx + 1, 5)}`}
                  bodyStyle={{ padding: "22px 24px" }}
                  onClick={() => { setSelectedStream(stream.name); setLevel("categories"); }}
                >
                  <div style={{ marginBottom: 12 }}>
                    {renderLibraryCardHeading(stream.name, streamIcons[stream.name] || <BookOutlined />)}
                  </div>
                  <div className="lib-card-desc">{stream.desc}</div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* ── CATEGORIES ── */}
        {level === "categories" && (
          <Row gutter={[18, 18]}>
            {(careerLibrary.categories[selectedStream] || []).map((category, idx) => (
              <Col xs={24} md={12} key={category}>
                <Card
                  hoverable
                  className={`lib-cat-card lib-fade lib-fade-d${Math.min(idx + 1, 5)}`}
                  bodyStyle={{ padding: "20px 24px" }}
                  onClick={() => { setSelectedCategory(category); setLevel("programs"); }}
                >
                  {renderLibraryCardHeading(category, <FolderOpenOutlined />)}
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* ── PROGRAMS ── */}
        {level === "programs" && (
          <div className="lib-program-item">
            <List
              dataSource={
                careerLibrary.specializations[selectedProgram] ||
                careerLibrary.programs[selectedCategory] ||
                []
              }
              renderItem={(item, idx) => {
                const unlockedItem = unlocked || canAccessFreeDetail("career-library", item);
                return (
                  <List.Item style={{ border: "none", padding: "6px 0" }}>
                    <Card
                      hoverable
                      className={`lib-program-card lib-fade lib-fade-d${Math.min(idx + 1, 5)}`}
                      bodyStyle={{ padding: "16px 20px", width: "100%" }}
                      style={{ width: "100%" }}
                      onClick={() => handleLockedCareerClick(item)}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        {renderLibraryCardHeading(item, <BookOutlined />)}
                        {!unlocked && (
                          <span className={unlockedItem ? "lib-tag-free" : "lib-tag-lock"}>
                            {unlockedItem ? "FREE" : "LOCK"}
                          </span>
                        )}
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        )}

        {/* ── DETAILS ── */}
        {level === "details" && (
          <div className="space-y-6 lib-fade">
            {!detailUnlocked && (
              <PremiumGate
                title="Unlock Career Library"
                description="Subscribe to more careers, salary insights, education paths, and institute details."
                returnTo={buildLibraryReturnTo()}
              />
            )}

            <div className="lib-section-card">
              <SectionCard
                title={detail.title}
                extra={
                  <Button
                    className="lib-wishlist-btn"
                    onClick={() => toggleSavedCareer(detail.title)}
                  >
                    {isSaved ? "✦ Saved" : "Save to Wishlist"}
                  </Button>
                }
              >
                <Paragraph
                  style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.75, marginBottom: 0 }}
                >
                  {detail.overview}
                </Paragraph>
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Career Path">
                <Timeline items={detail.path.map((item) => ({ children: item }))} />
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Education">
                <Text>{detail.education}</Text>
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Entrance Exams">
                <List
                  dataSource={detail.exams}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Job Opportunities">
                <List
                  dataSource={detail.jobs}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Salary Range">
                <Statistic value={detail.salary} />
              </SectionCard>
            </div>

            <div className="lib-section-card">
              <SectionCard title="Top Institutes">
                <List
                  dataSource={detail.institutes}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </SectionCard>
            </div>
          </div>
        )}
      </div>

      {/* ── Unlock modal ── */}
      <Modal
        open={Boolean(unlockModalItem)}
        onCancel={() => setUnlockModalItem(null)}
        footer={null}
        centered
        title="Unlock Career Library"
        className="lib-modal"
      >
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Paragraph style={{ marginBottom: 0, color: C.muted, fontSize: 14, lineHeight: 1.7 }}>
            Your free Career Library access has already been used. Subscribe to unlock{" "}
            <strong style={{ color: C.ink }}>{unlockModalItem}</strong> and continue without
            losing your place.
          </Paragraph>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: 10 }}>
            <Button className="lib-btn-outline" onClick={handleGoToPlans}>
              View Plans
            </Button>
            <Button type="primary" className="lib-btn-primary" onClick={handleGoToPlans}>
              Unlock Now
            </Button>
          </div>
        </Space>
      </Modal>
    </div>
  );
}