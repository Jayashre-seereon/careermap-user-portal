import { useEffect, useState } from "react";
import {
  BookOutlined,
  BranchesOutlined,
  CreditCardOutlined,
  ExperimentOutlined,
  FolderOpenOutlined,
  ToolOutlined,
  LockOutlined,
  UnlockOutlined,
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  TrophyOutlined,
  BankOutlined,
  DollarOutlined,
  RocketOutlined,
  ReadOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Button, Space, Timeline, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { careerLibrary } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SectionCard, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

const streamIcons = {
  Science: <ExperimentOutlined />,
  Commerce: <CreditCardOutlined />,
  "Arts & Humanities": <BookOutlined />,
  Vocational: <ToolOutlined />,
  Neutral: <BranchesOutlined />,
};

/* ── Breadcrumb ── */
function LibraryBreadcrumb({ stream, category, program, level }) {
  const parts = [];
  if (stream)   parts.push(stream);
  if (category) parts.push(category);
  if (program && level === "details") parts.push(program);
  if (!parts.length) return null;

  return (
    <div className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mb-2">
      <span>Career Library</span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <RightOutlined className="text-[10px] opacity-40" />
          <span className={i === parts.length - 1 ? "text-[#9a2119] font-semibold" : ""}>{p}</span>
        </span>
      ))}
    </div>
  );
}

/* ── Section header inside detail cards ── */
function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0e4e2]">
      <span className="text-[#9a2119] text-sm">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">{title}</span>
    </div>
  );
}

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

  function buildLibraryReturnTo(detailName = selectedDetail) {
    const nextParams = new URLSearchParams();
    if (selectedStream)   nextParams.set("stream", selectedStream);
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
    const stream         = params.get("stream");
    const category       = params.get("category");
    const program        = params.get("program");
    const detailName     = params.get("detail");
    const requestedLevel = params.get("level");
    if (!stream && !category && !program && !detailName) return;
    if (stream)      setSelectedStream(stream);
    if (category)    setSelectedCategory(category);
    if (program)     setSelectedProgram(program);
    if (detailName)  setSelectedDetail(detailName);
    if (requestedLevel === "details" && detailName) setLevel("details");
    else if (program || category) setLevel("programs");
    else if (stream) setLevel("categories");
  }, [params]);

  function back() {
    if (level === "details")     { setLevel("programs");    setSelectedDetail(null); }
    else if (level === "programs")    { setLevel("categories"); setSelectedProgram(null); }
    else if (level === "categories")  { setLevel("streams");    setSelectedCategory(null); }
  }

  const levelMeta = {
    streams:    { heading: "Career Library",        sub: "Choose a stream to begin exploring career paths." },
    categories: { heading: selectedStream || "",    sub: "Select a category within this stream." },
    programs:   { heading: selectedCategory || "",  sub: "Choose a career to view full details." },
    details:    { heading: detail.title || "",      sub: null },
  };
  const meta = levelMeta[level];

  return (
    <ModuleScreen className="space-y-5">
      <PageHero backOnly onBack={level !== "streams" ? back : () => navigate(-1)} />

      {/* Breadcrumb */}
      <LibraryBreadcrumb
        stream={selectedStream}
        category={selectedCategory}
        program={selectedProgram}
        level={level}
      />

      {/* Level heading */}
      {meta.heading && (
        <div className="mb-2">
          <h1 className="text-2xl font-black text-[#1a0a09] m-0 leading-snug">{meta.heading}</h1>
          {meta.sub && <p className="text-xs text-[#b8837e] mt-1 mb-0">{meta.sub}</p>}
          <div className="w-8 h-[3px] bg-[#9a2119] rounded-full mt-2" />
        </div>
      )}

      {/* ── STREAMS ── */}
      {level === "streams" && (
        <div className="content-stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {careerLibrary.streams.map((stream) => (
            <div
              key={stream.name}
              onClick={() => { setSelectedStream(stream.name); setLevel("categories"); }}
              className="group bg-white rounded-2xl border border-[#f0e4e2] border-t-[3px] border-t-[#9a2119] p-5 cursor-pointer flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10"
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#fdf0ee] text-[#9a2119] flex items-center justify-center text-lg shrink-0 group-hover:bg-[#9a2119] group-hover:text-white transition-colors">
                  {streamIcons[stream.name] || <BookOutlined />}
                </span>
                <p className="text-base font-bold text-[#1a0a09] m-0 leading-snug group-hover:text-[#9a2119] transition-colors">
                  {stream.name}
                </p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed m-0 flex-1">{stream.desc}</p>
              <div className="flex items-center gap-1 text-[#9a2119] text-xs font-semibold mt-auto">
                Explore <ArrowRightOutlined className="text-[10px]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CATEGORIES ── */}
      {level === "categories" && (
        <div className="content-stagger grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(careerLibrary.categories[selectedStream] || []).map((category) => (
            <div
              key={category}
              onClick={() => { setSelectedCategory(category); setLevel("programs"); }}
              className="group bg-white rounded-2xl border border-[#f0e4e2] p-5 cursor-pointer flex items-center gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10 hover:border-[#9a2119]"
            >
              <span className="w-10 h-10 rounded-xl bg-[#fdf0ee] text-[#9a2119] flex items-center justify-center text-lg shrink-0 group-hover:bg-[#9a2119] group-hover:text-white transition-colors">
                <FolderOpenOutlined />
              </span>
              <p className="text-sm font-bold text-[#1a0a09] m-0 flex-1 group-hover:text-[#9a2119] transition-colors">
                {category}
              </p>
              <ArrowRightOutlined className="text-[#9a2119] opacity-30 group-hover:opacity-100 transition-opacity text-xs" />
            </div>
          ))}
        </div>
      )}

      {/* ── PROGRAMS ── */}
      {level === "programs" && (
        <div className="content-stagger flex flex-col gap-2">
          {(
            careerLibrary.specializations[selectedProgram] ||
            careerLibrary.programs[selectedCategory] ||
            []
          ).map((item) => {
            const unlockedItem = unlocked || canAccessFreeDetail("career-library", item);
            return (
              <div
                key={item}
                onClick={() => handleLockedCareerClick(item)}
                className="group bg-white rounded-2xl border border-[#f0e4e2] p-4 cursor-pointer flex items-center gap-3 transition-all duration-200 hover:border-[#9a2119] hover:shadow-md hover:shadow-[#9a2119]/10"
              >
                <span className="w-9 h-9 rounded-xl bg-[#fdf0ee] text-[#9a2119] flex items-center justify-center text-base shrink-0 group-hover:bg-[#9a2119] group-hover:text-white transition-colors">
                  <BookOutlined />
                </span>
                <p className="text-sm font-semibold text-[#1a0a09] m-0 flex-1 group-hover:text-[#9a2119] transition-colors">
                  {item}
                </p>
                {!unlocked && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2.5 py-0.5 shrink-0 ${
                      unlockedItem
                        ? "bg-green-100 text-green-700"
                        : "bg-[#fdf0ee] text-[#9a2119]"
                    }`}
                  >
                    {unlockedItem ? <UnlockOutlined /> : <LockOutlined />}
                    {unlockedItem ? "Free" : "Locked"}
                  </span>
                )}
                <ArrowRightOutlined className="text-[#9a2119] opacity-30 group-hover:opacity-100 transition-opacity text-xs shrink-0" />
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAILS ── */}
      {level === "details" && (
        <div className="content-stagger space-y-3">
          {!detailUnlocked && (
            <PremiumGate
              title="Unlock Career Library"
              description="Subscribe to more careers, salary insights, education paths, and institute details."
              returnTo={buildLibraryReturnTo()}
            />
          )}

          {/* Overview */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#f0e4e2]">
              <div className="flex items-center gap-2">
                <ReadOutlined className="text-[#9a2119] text-sm" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">
                  {detail.title}
                </span>
              </div>
              <button
                onClick={() => toggleSavedCareer(detail.title)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9a2119] bg-[#fdf0ee] border border-[#f0e4e2] rounded-lg px-3 py-1.5 hover:bg-[#9a2119] hover:text-white transition-colors"
              >
                {isSaved ? <HeartFilled /> : <HeartOutlined />}
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 leading-relaxed m-0">{detail.overview}</p>
            </div>
          </div>

          {/* Career Path */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<RocketOutlined />} title="Career Path" />
            <div className="p-5">
              <div className="flex flex-col gap-0">
                {detail.path.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <span className="w-6 h-6 rounded-full bg-[#fdf0ee] text-[#9a2119] flex items-center justify-center text-[10px] font-bold border border-[#f0e4e2]">
                        {i + 1}
                      </span>
                      {i < detail.path.length - 1 && (
                        <span className="w-px h-6 bg-[#f0e4e2]" />
                      )}
                    </div>
                    <p className={`text-sm m-0 pb-3 ${i === detail.path.length - 1 ? "font-bold text-[#9a2119]" : "text-gray-600"}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<BookOutlined />} title="Education" />
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed m-0">{detail.education}</p>
            </div>
          </div>

          {/* Entrance Exams */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<SolutionOutlined />} title="Entrance Exams" />
            <div className="px-5 py-2">
              {detail.exams.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 py-2.5 ${i < detail.exams.length - 1 ? "border-b border-[#fdf0ee]" : ""}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9a2119] shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Job Opportunities */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<BankOutlined />} title="Job Opportunities" />
            <div className="px-5 py-2">
              {detail.jobs.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 py-2.5 ${i < detail.jobs.length - 1 ? "border-b border-[#fdf0ee]" : ""}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9a2119] shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<DollarOutlined />} title="Salary Range" />
            <div className="p-5">
              <p className="text-3xl font-black text-[#9a2119] m-0">{detail.salary}</p>
            </div>
          </div>

          {/* Top Institutes */}
          <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
            <SectionHeader icon={<TrophyOutlined />} title="Top Institutes" />
            <div className="p-5 flex flex-wrap gap-2">
              {detail.institutes.map((inst, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a0a09] bg-[#fdf9f9] border border-[#f0e4e2] rounded-lg px-3 py-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9a2119] shrink-0" />
                  {inst}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Unlock modal ── */}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Career Library"
        itemLabel={unlockModalItem}
        description="Your free Career Library access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={handleGoToPlans}
      />
    </ModuleScreen>
  );
}
