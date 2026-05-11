import { useEffect, useState } from "react";
import { BookOutlined, BranchesOutlined, CreditCardOutlined, ExperimentOutlined, FolderOpenOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Card, Col, List, Modal, Row, Space, Statistic, Timeline, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { careerLibrary } from "../../../data/careermapData";
import { PageHero, SectionCard, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

export default function LibraryPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess, savedCareers, toggleSavedCareer } = useAppState();
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
  const detailUnlocked = !selectedDetail || unlocked || canAccessFreeDetail("career-library", selectedDetail);
  const streamIcons = {
    Science: <ExperimentOutlined />,
    Commerce: <CreditCardOutlined />,
    "Arts & Humanities": <BookOutlined />,
    Vocational: <ToolOutlined />,
    Neutral: <BranchesOutlined />,
  };

  function buildLibraryReturnTo(detailName = selectedDetail) {
    const nextParams = new URLSearchParams();
    if (selectedStream) nextParams.set("stream", selectedStream);
    if (selectedCategory) nextParams.set("category", selectedCategory);
    if (selectedProgram) nextParams.set("program", selectedProgram);
    if (detailName) nextParams.set("detail", detailName);
    if (detailName) nextParams.set("level", "details");
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
    const stream = params.get("stream");
    const category = params.get("category");
    const program = params.get("program");
    const detailName = params.get("detail");
    const requestedLevel = params.get("level");
    if (!stream && !category && !program && !detailName) return;
    if (stream) setSelectedStream(stream);
    if (category) setSelectedCategory(category);
    if (program) setSelectedProgram(program);
    if (detailName) setSelectedDetail(detailName);
    if (requestedLevel === "details" && detailName) setLevel("details");
    else if (program || category) setLevel("programs");
    else if (stream) setLevel("categories");
  }, [params]);

  function renderLibraryCardHeading(title, icon) {
    return (
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7ebe6] text-lg text-[#9a2119]">
          {icon}
        </span>
        <span className="text-lg font-black text-ink">{title}</span>
      </div>
    );
  }

  function back() {
    if (level === "details") {
      setLevel("programs");
      setSelectedDetail(null);
    } else if (level === "programs") {
      setLevel("categories");
      setSelectedProgram(null);
    } else if (level === "categories") {
      setLevel("streams");
      setSelectedCategory(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={level !== "streams" ? back : () => navigate(-1)} />
      {level === "streams" ? (
        <Row gutter={[16, 16]}>
          {careerLibrary.streams.map((stream) => (
            <Col xs={24} md={12} lg={8} key={stream.name}>
              <Card hoverable className="!border-[#eedad4]" onClick={() => { setSelectedStream(stream.name); setLevel("categories"); }}>
                <div className="space-y-2">
                  {renderLibraryCardHeading(stream.name, streamIcons[stream.name] || <BookOutlined />)}
                  <Text>{stream.desc}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
      {level === "categories" ? (
        <Row gutter={[16, 16]}>
          {(careerLibrary.categories[selectedStream] || []).map((category) => (
            <Col xs={24} md={12} key={category}>
              <Card hoverable className="!border-[#eedad4]" onClick={() => { setSelectedCategory(category); setLevel("programs"); }}>
                {renderLibraryCardHeading(category, <FolderOpenOutlined />)}
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
      {level === "programs" ? (
        <List
          dataSource={careerLibrary.specializations[selectedProgram] || careerLibrary.programs[selectedCategory] || []}
          renderItem={(item) => {
            const unlockedItem = unlocked || canAccessFreeDetail("career-library", item);
            return (
              <List.Item>
                <Card hoverable className="!w-full !border-[#eedad4]" onClick={() => handleLockedCareerClick(item)}>
                  <div className="flex items-center justify-between gap-3">
                    {renderLibraryCardHeading(item, <BookOutlined />)}
                    {!unlocked ? <SoftTag color={unlockedItem ? "green" : "default"}>{unlockedItem ? "FREE" : "LOCK"}</SoftTag> : null}
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      ) : null}
      {level === "details" ? (
        <div className="space-y-6">
          {!detailUnlocked ? <PremiumGate title="Unlock Career Library" description="Subscribe to more careers, salary insights, education paths, and institute details." returnTo={buildLibraryReturnTo()} /> : null}
          <SectionCard title={detail.title} extra={<Button onClick={() => toggleSavedCareer(detail.title)}>{isSaved ? "Saved to Wishlist" : "Save to Wishlist"}</Button>}>
            <Paragraph>{detail.overview}</Paragraph>
          </SectionCard>
          <SectionCard title="Career Path"><Timeline items={detail.path.map((item) => ({ children: item }))} /></SectionCard>
          <SectionCard title="Education"><Text>{detail.education}</Text></SectionCard>
          <SectionCard title="Entrance Exams"><List dataSource={detail.exams} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
          <SectionCard title="Job Opportunities"><List dataSource={detail.jobs} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
          <SectionCard title="Salary Range"><Statistic value={detail.salary} /></SectionCard>
          <SectionCard title="Top Institutes"><List dataSource={detail.institutes} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        </div>
      ) : null}
      <Modal open={Boolean(unlockModalItem)} onCancel={() => setUnlockModalItem(null)} footer={null} centered title="Unlock Career Library">
        <Space direction="vertical" size="large" className="!w-full">
          <Paragraph className="!mb-0">
            Your free Career Library access has already been used. Subscribe to unlock <strong>{unlockModalItem}</strong> and continue this flow without losing your place.
          </Paragraph>
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={handleGoToPlans}>View Plans</Button>
            <Button type="primary" onClick={handleGoToPlans}>Unlock Now</Button>
          </div>
        </Space>
      </Modal>
    </div>
  );
}
