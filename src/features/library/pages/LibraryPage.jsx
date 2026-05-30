import {
  ArrowRightOutlined,
  BankOutlined,
  BookOutlined,
  BranchesOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ExperimentOutlined,
  FolderOpenOutlined,
  HeartFilled,
  HeartOutlined,
  RightOutlined,
  ReadOutlined,
  RocketOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { Empty } from "antd";
import { getCareerLibraryCategoriesByStream, getCareerLibraryNext, getCareerLibraryStreams } from "../../../api/careerLibraryApi";
import { careerLibrary, palette } from "../../../data/careermapData";
import { ModuleScreen, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

const streamIcons = {
  Science: <ExperimentOutlined />,
  Commerce: <CreditCardOutlined />,
  "Arts & Humanities": <BookOutlined />,
  Vocational: <BranchesOutlined />,
  Neutral: <BranchesOutlined />,
};

function stripHtml(value) {
  if (!value) {
    return "";
  }

  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  return [value];
}

function getItemTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.subcategory?.title ||
    item?.secondcategory?.name ||
    item?.category?.title ||
    item?.path ||
    item?.examname ||
    item?.pathName ||
    `Item ${item?.id ?? ""}`.trim()
  );
}

function getDetailTitle(detail) {
  return detail?.subcategory?.title || detail?.secondcategory?.name || detail?.category?.title || `Career Detail ${detail?.id ?? ""}`.trim();
}

function getDetailDescription(detail) {
  return stripHtml(
    detail?.subcategory?.description ||
      detail?.secondcategory?.description ||
      detail?.category?.description ||
      detail?.subcategory?.specialization ||
      detail?.secondcategory?.specialization ||
      detail?.category?.specialization ||
      detail?.description ||
      ""
  );
}

function getStreamIcon(streamName) {
  const normalized = String(streamName || "").toLowerCase();

  if (normalized.includes("science")) {
    return "flask-outline";
  }

  if (normalized.includes("commerce")) {
    return "calculator-outline";
  }

  if (normalized.includes("arts")) {
    return "color-palette-outline";
  }

  if (normalized.includes("vocational")) {
    return "hammer-outline";
  }

  return "layers-outline";
}

function getStreamTone(streamName) {
  const normalized = String(streamName || "").toLowerCase();

  if (normalized.includes("science")) {
    return palette.blue;
  }

  if (normalized.includes("commerce")) {
    return palette.green;
  }

  if (normalized.includes("arts")) {
    return palette.orange;
  }

  if (normalized.includes("vocational")) {
    return palette.pink;
  }

  return palette.purple;
}

function getStepIcon(type, item) {
  const title = getItemTitle(item).toLowerCase();

  if (type === "category") {
    return title.includes("medical") || title.includes("science") ? "medical-outline" : "folder-open-outline";
  }

  if (type === "second") {
    return title.includes("education") || title.includes("study") ? "school-outline" : "albums-outline";
  }

  if (type === "sub") {
    return title.includes("detail") || title.includes("career") ? "sparkles-outline" : "document-text-outline";
  }

  return "chevron-forward";
}

function normalizeStreamItem(item, index = 0) {
  const fallback = careerLibrary.streams[index % careerLibrary.streams.length] || careerLibrary.streams[0];
  const title = item?.name || item?.title || item?.streamName || item?.label || fallback?.name || `Stream ${index + 1}`;

  return {
    id: item?.id ?? item?.streamId ?? index + 1,
    name: title,
    desc: stripHtml(item?.description || item?.desc || item?.about || fallback?.desc || ""),
    icon: getStreamIcon(title),
    tone: getStreamTone(title),
    raw: item,
  };
}

function normalizeStepItem(item, index = 0, type = "category") {
  const title = getItemTitle(item) || `Item ${index + 1}`;

  return {
    id: item?.id ?? item?.categoryId ?? item?.secondCategoryId ?? item?.subCategoryId ?? `${type}-${index}`,
    name: title,
    description: stripHtml(item?.description || item?.desc || item?.about || item?.specialization || item?.path || ""),
    icon: getStepIcon(type, item),
    tone: palette.primary,
    raw: item,
  };
}

function normalizeSalaryRanges(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((salary) => (typeof salary === "string" ? { label: salary } : salary));
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    return [{ label: value }];
  }

  return [{ label: String(value) }];
}

function normalizeDetailItem(item, index = 0, sourceItem = null) {
  const title = getDetailTitle(item) || getItemTitle(sourceItem) || `Career Detail ${index + 1}`;

  return {
    id: item?.id ?? sourceItem?.id ?? `${title}-${index}`,
    title,
    overview: stripHtml(
      item?.overview ||
        item?.description ||
        item?.about ||
        item?.detail ||
        sourceItem?.overview ||
        sourceItem?.description ||
        ""
    ),
    path: toList(item?.path || item?.careerPath || item?.steps || sourceItem?.path || sourceItem?.steps),
    education: stripHtml(item?.education || item?.qualification || item?.studyPath || sourceItem?.education || ""),
    exams: toList(item?.exams || item?.entranceExams || item?.exam || sourceItem?.exams || []),
    jobs: toList(item?.jobs || item?.jobScope || item?.job_scope || sourceItem?.jobs || sourceItem?.jobScope || []),
    salary: stripHtml(item?.salary || item?.salaryRange || sourceItem?.salary || ""),
    salaryRanges: normalizeSalaryRanges(item?.salaryRanges || item?.salary_ranges || sourceItem?.salaryRanges || []),
    institutes: toList(item?.institutes || item?.topInstitutes || item?.colleges || sourceItem?.institutes || []),
  };
}

function getFallbackNextItems(type, item) {
  const title = getItemTitle(item);

  if (type === "stream") {
    return (careerLibrary.categories[title] || []).map((category, index) => normalizeStepItem({ id: `${title}-${category}`, name: category }, index, "category"));
  }

  if (type === "category") {
    return (careerLibrary.programs[title] || []).map((program, index) => normalizeStepItem({ id: `${title}-${program}`, name: program }, index, "second"));
  }

  if (type === "second") {
    return (careerLibrary.specializations[title] || []).map((subCategory, index) => normalizeStepItem({ id: `${title}-${subCategory}`, name: subCategory }, index, "sub"));
  }

  if (type === "sub") {
    const detail = careerLibrary.details[title];
    return detail ? [normalizeDetailItem(detail, 0, item)] : [];
  }

  return [];
}

function normalizeStreamItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return careerLibrary.streams.map((item, index) => normalizeStreamItem(item, index));
  }

  return items.map((item, index) => normalizeStreamItem(item, index));
}

function normalizeStepItems(items, type) {
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }

  return items.map((item, index) => normalizeStepItem(item, index, type));
}

function normalizeDetailItems(items, sourceItem) {
  if (!Array.isArray(items) || items.length === 0) {
    return sourceItem ? [normalizeDetailItem(sourceItem, 0, sourceItem)] : [];
  }

  return items.map((item, index) => normalizeDetailItem(item, index, sourceItem));
}

function LibraryBreadcrumb({ stream, category, secondCategory, subCategory, detail, level }) {
  const parts = [];

  if (stream) {
    parts.push(stream);
  }
  if (category) {
    parts.push(category);
  }
  if (secondCategory) {
    parts.push(secondCategory);
  }
  if (subCategory && level === "details") {
    parts.push(subCategory);
  }
  if (detail && level === "details") {
    parts.push(detail);
  }

  if (!parts.length) {
    return null;
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <span>Career Library</span>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="flex items-center gap-1.5">
          <RightOutlined className="text-[10px] opacity-40" />
          <span className={index === parts.length - 1 ? "font-semibold text-brand" : ""}>{part}</span>
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
      <span className="text-sm text-[#9a2119]">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">{title}</span>
    </div>
  );
}

export default function LibraryPage() {
  const { isUnlocked, registerFreeDetailAccess, savedCareers, toggleSavedCareer } = useAppState();
  const { location, goToDashboard, navigate } = usePortalNavigation();
  const [currentLevel, setCurrentLevel] = useState("streams");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSecondCategory, setSelectedSecondCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedDetailSource, setSelectedDetailSource] = useState(null);
  const [streamItems, setStreamItems] = useState(normalizeStreamItems([]));
  const [categories, setCategories] = useState([]);
  const [secondCategories, setSecondCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [details, setDetails] = useState([]);
  const [detailReturnLevel, setDetailReturnLevel] = useState("streams");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [claimedFreeKey, setClaimedFreeKey] = useState(null);
  const hasSubscriptionAccess = isUnlocked("career-library");

  useEffect(() => {
    let active = true;

    async function loadStreams() {
      try {
        setLoading(true);
        setError("");
        const response = await getCareerLibraryStreams();
        const items = Array.isArray(response?.data) ? response.data : [];

        if (!active) {
          return;
        }

        setStreamItems(normalizeStreamItems(items));
      } catch (_fetchError) {
        if (active) {
          setError("Unable to load streams right now.");
          setStreamItems(normalizeStreamItems([]));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStreams();

    return () => {
      active = false;
    };
  }, []);

  const detailKey = selectedDetailSource?.id != null ? String(selectedDetailSource.id) : null;
  const detailUnlocked = hasSubscriptionAccess || claimedFreeKey === null || detailKey === claimedFreeKey;

  function getAccessKey(item) {
    return String(item?.id ?? getItemTitle(item) ?? "");
  }

  function isItemFree(item) {
    if (hasSubscriptionAccess) {
      return true;
    }

    if (claimedFreeKey === null) {
      return true;
    }

    return getAccessKey(item) === claimedFreeKey;
  }

  const pageTitle = useMemo(() => {
    if (currentLevel === "streams") {
      return "Career Library";
    }

    if (currentLevel === "categories") {
      return selectedStream?.name || "Career Library";
    }

    if (currentLevel === "secondcategory") {
      return selectedCategory?.name || "Career Library";
    }

    if (currentLevel === "subcategory") {
      return selectedSecondCategory?.name || "Career Library";
    }

    if (currentLevel === "details") {
      return getItemTitle(selectedDetailSource || selectedSubCategory || selectedSecondCategory || selectedCategory) || "Career Library";
    }

    return "Career Library";
  }, [currentLevel, selectedCategory, selectedDetailSource, selectedSecondCategory, selectedStream, selectedSubCategory]);

  function buildReturnTo() {
    return location.pathname;
  }

  function getCategoryTitle() {
    return selectedStream?.name || "Career Library";
  }

  function getSecondCategoryTitle() {
    return selectedCategory?.name || "Career Library";
  }

  function getSubCategoryTitle() {
    return selectedSecondCategory?.name || "Career Library";
  }

  function getDetailItemsLabel() {
    return getItemTitle(selectedDetailSource || selectedSubCategory || selectedSecondCategory || selectedCategory);
  }

  async function handleClick(type, id, item) {
    setLoading(true);
    setError("");
    setUnlockModalItem(null);
    setSelectedDetailSource(null);

    try {
      if (type === "stream") {
        setSelectedStream(item);
        setSelectedCategory(null);
        setSelectedSecondCategory(null);
        setSelectedSubCategory(null);
        setSecondCategories([]);
        setSubCategories([]);
        setDetails([]);
        setDetailReturnLevel("streams");

        const response = await getCareerLibraryCategoriesByStream(id);
        const items = Array.isArray(response?.data) && response.data.length > 0 ? response.data : getFallbackNextItems("stream", item);

        setCategories(normalizeStepItems(items, "category"));
        setCurrentLevel("categories");
        return;
      }

      if (type === "category") {
        setSelectedCategory(item);
        setSelectedSecondCategory(null);
        setSelectedSubCategory(null);
        setDetails([]);
        setSubCategories([]);
        setDetailReturnLevel("categories");

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const items = Array.isArray(data?.data) && data.data.length > 0 ? data.data : getFallbackNextItems("category", item);

        if (String(data?.type || "").toLowerCase() === "details") {
          const detailItems = normalizeDetailItems(items.length > 0 ? items : getFallbackNextItems("sub", item), item);
          setSelectedDetailSource(item);
          setDetails(detailItems);
          setCurrentLevel("details");
          if (item?.id != null) {
            registerFreeDetailAccess("career-library", String(item.id));
          }
          return;
        }

        setSecondCategories(normalizeStepItems(items, "second"));
        setCurrentLevel("secondcategory");
        return;
      }

      if (type === "second") {
        setSelectedSecondCategory(item);
        setSelectedSubCategory(null);
        setDetails([]);
        setDetailReturnLevel("secondcategory");

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const items = Array.isArray(data?.data) && data.data.length > 0 ? data.data : getFallbackNextItems("second", item);

        if (String(data?.type || "").toLowerCase() === "details") {
          const detailItems = normalizeDetailItems(items.length > 0 ? items : getFallbackNextItems("sub", item), item);
          setSelectedDetailSource(item);
          setDetails(detailItems);
          setCurrentLevel("details");
          if (item?.id != null) {
            registerFreeDetailAccess("career-library", String(item.id));
          }
          return;
        }

        setSubCategories(normalizeStepItems(items, "sub"));
        setCurrentLevel("subcategory");
        return;
      }

      if (type === "sub") {
        setSelectedSubCategory(item);
        setDetailReturnLevel("subcategory");

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const items =
          Array.isArray(data?.data) && data.data.length > 0
            ? data.data
            : Array.isArray(data?.details) && data.details.length > 0
              ? data.details
              : getFallbackNextItems("sub", item);

        const detailItems = normalizeDetailItems(items, item);
        setSelectedDetailSource(item);
        setDetails(detailItems);
        setCurrentLevel("details");
        if (item?.id != null) {
          registerFreeDetailAccess("career-library", String(item.id));
        }
      }
    } catch (_fetchError) {
      setError("Unable to load the next step. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (currentLevel === "details") {
      setCurrentLevel(detailReturnLevel);
      setSelectedDetailSource(null);
      return;
    }

    if (currentLevel === "subcategory") {
      setCurrentLevel("secondcategory");
      setSelectedSubCategory(null);
      return;
    }

    if (currentLevel === "secondcategory") {
      setCurrentLevel("categories");
      setSelectedSecondCategory(null);
      return;
    }

    if (currentLevel === "categories") {
      setCurrentLevel("streams");
      setSelectedCategory(null);
      return;
    }

    goToDashboard();
  }

  function handleLockedCareerClick(item, type) {
    const unlockedItem = isItemFree(item);

    if (!unlockedItem) {
      setUnlockModalItem({ item, type });
      return;
    }

    if (!hasSubscriptionAccess && claimedFreeKey === null) {
      setClaimedFreeKey(getAccessKey(item));
    }

    handleClick(type, item?.id, item);
  }

  function handleGoToPlans() {
    const returnTo = buildReturnTo();
    setUnlockModalItem(null);
    navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function renderStreamGrid(items) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={`stream-${item?.id ?? index}`}
            type="button"
            onClick={() => handleClick("stream", item?.id, item)}
            className="group flex flex-col gap-3 rounded-2xl border border-[#f0e4e2] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg transition-colors group-hover:bg-[#9a2119] group-hover:text-white"
                style={{ backgroundColor: `${item?.tone || getStreamTone(item?.name)}15`, color: item?.tone || getStreamTone(item?.name) }}
              >
                {streamIcons[item?.name] || <BookOutlined />}
              </span>
              <Text className="m-0 text-base font-bold text-ink group-hover:text-brand">{item?.name}</Text>
            </div>
            <Text className="m-0 flex-1 text-xs leading-relaxed text-muted">{item?.desc || "Explore this stream."}</Text>
            <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-brand">
              Explore <ArrowRightOutlined className="text-[10px]" />
            </div>
          </button>
        ))}
      </div>
    );
  }

  function renderCategoryGrid(items) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const unlockedItem = isItemFree(item);

          return (
            <button
              key={`category-${item?.id ?? index}`}
              type="button"
              onClick={() => handleLockedCareerClick(item, "category")}
              className="group flex w-full items-center gap-3 rounded-[18px] border border-[#f0e4e2] bg-white px-3 py-3.5 text-left transition-all duration-200 hover:border-[#9a2119] hover:shadow-md hover:shadow-[#9a2119]/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#ffeceb] text-[#9a2119] transition-colors group-hover:bg-[#9a2119] group-hover:text-white">
                <FolderOpenOutlined />
              </span>
              <div className="min-w-0 flex-1">
                <Text className="block text-[14px] font-bold text-ink group-hover:text-brand">{getItemTitle(item)}</Text>
                {item?.description ? <Text className="mt-0.5 block text-xs leading-4 text-muted">{item.description}</Text> : null}
              </div>
              <div className="items-end gap-2">
                {!hasSubscriptionAccess ? (
                  <div className={`rounded-full px-2 py-1 ${unlockedItem ? "bg-green-100" : "bg-[#f8e8d8]"}`}>
                    <Text className="text-[10px] font-black" style={{ color: unlockedItem ? palette.green : palette.primary }}>
                      {unlockedItem ? "FREE" : "LOCK"}
                    </Text>
                  </div>
                ) : null}
              </div>
              <ArrowRightOutlined className="text-[#9a2119] opacity-30 transition-opacity group-hover:opacity-100" />
            </button>
          );
        })}
      </div>
    );
  }

  function renderStepList(items, type) {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const unlockedItem = isItemFree(item);

          return (
            <button
              key={`${type}-${item?.id ?? index}`}
              type="button"
              onClick={() => handleLockedCareerClick(item, type)}
              className="flex w-full items-center rounded-[14px] border border-[#f0e4e2] bg-white p-3 text-left transition-all duration-200 hover:border-[#9a2119] hover:shadow-md hover:shadow-[#9a2119]/10"
            >
              <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#fff0e8] text-[#9a2119]">
                <ReadOutlined />
              </span>
              <div className="min-w-0 flex-1">
                <Text className="block text-[15px] font-bold text-ink">{getItemTitle(item)}</Text>
                {item?.description ? <Text className="mt-1 block text-xs leading-5 text-muted">{item.description}</Text> : null}
              </div>
              {!hasSubscriptionAccess ? (
                <div className={`mr-2 rounded-full px-2 py-1 ${unlockedItem ? "bg-green-100" : "bg-[#f8e8d8]"}`}>
                  <Text className="text-[10px] font-black" style={{ color: unlockedItem ? palette.green : palette.primary }}>
                    {unlockedItem ? "FREE" : "LOCK"}
                  </Text>
                </div>
              ) : null}
              <ArrowRightOutlined className="text-[#9a2119] opacity-30 transition-opacity" />
            </button>
          );
        })}
      </div>
    );
  }

  function renderDetailItem(detail, index) {
    const title = detail?.title || getItemTitle(detail);
    const isSaved = savedCareers.includes(title);

    return (
      <div key={`detail-${detail?.id ?? index}`} className="mb-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] bg-[#ffecef] text-[#9a2119]">
            <RocketOutlined />
          </div>
          <div className="flex-1">
            <Text className="block text-[20px] font-black text-ink">{title}</Text>
            {getDetailDescription(detail) ? <Text className="mt-1 block text-xs leading-5 text-muted">{getDetailDescription(detail)}</Text> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => toggleSavedCareer(title)}
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-[14px] border px-4 py-3 transition-colors ${
            isSaved ? "border-brand bg-brand text-white" : "border-[#eedad4] bg-white text-brand"
          }`}
        >
          {isSaved ? <HeartFilled /> : <HeartOutlined />}
          <Text className={`text-[13px] font-extrabold ${isSaved ? "text-white" : "text-brand"}`}>{isSaved ? "Saved to Wishlist" : "Save to Wishlist"}</Text>
        </button>

        {detailUnlocked ? (
          <div className="mb-3 rounded-[12px] px-3 py-3" style={{ backgroundColor: `${palette.green}14` }}>
            <Text className="text-[12px] font-semibold" style={{ color: palette.green }}>
              <UnlockOutlined className="mr-1" /> You have access to view this career detail for free.
            </Text>
          </div>
        ) : null}

        <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <BankOutlined style={{ color: palette.primary }} />
            <Text className="text-[14px] font-bold text-ink">Job Scope</Text>
          </div>
          {toList(detail?.jobs || detail?.jobScope).length > 0 ? (
            toList(detail?.jobs || detail?.jobScope).map((scope) => (
              <div key={scope} className="mb-2 flex items-start">
                <span className="mr-2 mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cb9c48]" />
                <Text className="flex-1 text-[13px] leading-5 text-muted">{scope}</Text>
              </div>
            ))
          ) : (
            <Text className="text-[13px] text-muted">Job scope not available.</Text>
          )}
        </div>

        <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <DollarOutlined style={{ color: palette.primary }} />
            <Text className="text-[14px] font-bold text-ink">Salary Range</Text>
          </div>
          {detail?.salaryRanges?.length > 0 ? (
            detail.salaryRanges.map((salary, salaryIndex) => (
              <div key={salary?.id ?? salaryIndex} className="mb-2">
                <Text className="text-[15px] font-bold text-brand">
                  {salary?.minSalary && salary?.maxSalary
                    ? `${salary.minSalary} - ${salary.maxSalary}`
                    : salary?.label || salary?.value || "Salary not available"}
                </Text>
              </div>
            ))
          ) : detail?.salary ? (
            <Text className="text-[15px] font-bold text-brand">{detail.salary}</Text>
          ) : (
            <Text className="text-[13px] text-muted">Salary details not available.</Text>
          )}
        </div>

        <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOutlined style={{ color: palette.primary }} />
            <Text className="text-[14px] font-bold text-ink">Education</Text>
          </div>
          <Text className="text-[13px] leading-6 text-muted">{detail?.education || "Education details not available."}</Text>
        </div>

        <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
          <SectionHeader icon={<SolutionOutlined />} title="Entrance Exams" />
          <div className="px-1 py-2">
            {toList(detail?.exams).length > 0 ? (
              toList(detail?.exams).map((exam, examIndex) => (
                <div key={`${exam}-${examIndex}`} className={`flex items-center gap-2.5 py-2.5 ${examIndex < toList(detail?.exams).length - 1 ? "border-b border-[#fdf0ee]" : ""}`}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" />
                  <Text className="text-sm text-muted">{exam}</Text>
                </div>
              ))
            ) : (
              <Text className="text-[13px] text-muted">Entrance exam details not available.</Text>
            )}
          </div>
        </div>

        <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
          <SectionHeader icon={<TrophyOutlined />} title="Top Institutes" />
          <div className="flex flex-wrap gap-2 p-1 pt-3">
            {toList(detail?.institutes).length > 0 ? (
              toList(detail?.institutes).map((inst, instIndex) => (
                <span key={`${inst}-${instIndex}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0e4e2] bg-[#fdf9f9] px-3 py-1.5 text-xs font-semibold text-[#1a0a09]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" />
                  {inst}
                </span>
              ))
            ) : (
              <Text className="text-[13px] text-muted">Top institutes not available.</Text>
            )}
          </div>
        </div>

        {detail?.path?.length > 0 ? (
          <div className="mb-4 rounded-[20px] border border-[#f0e4e2] bg-white p-4">
            <SectionHeader icon={<TeamOutlined />} title="Career Path" />
            <div className="p-1 pt-3">
              {detail.path.map((step, stepIndex) => (
                <div key={`${step}-${stepIndex}`} className="flex items-start gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#f0e4e2] bg-[#fdf0ee] text-[10px] font-bold text-[#9a2119]">{stepIndex + 1}</span>
                    {stepIndex < detail.path.length - 1 ? <span className="h-6 w-px bg-[#f0e4e2]" /> : null}
                  </div>
                  <Text className={`m-0 pb-3 text-sm ${stepIndex === detail.path.length - 1 ? "font-bold text-[#9a2119]" : "text-muted"}`}>{step}</Text>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <ModuleScreen className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <LibraryBreadcrumb
            stream={selectedStream?.name}
            category={selectedCategory?.name}
            secondCategory={selectedSecondCategory?.name}
            subCategory={selectedSubCategory?.name}
            detail={getDetailItemsLabel()}
            level={currentLevel}
          />
          <div className="mb-2 flex items-center gap-3">
            {currentLevel !== "streams" ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eedad4] bg-white text-[#1a0a09] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowRightOutlined className="rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={goToDashboard}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eedad4] bg-white text-[#1a0a09] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <ArrowRightOutlined className="rotate-180" />
              </button>
            )}
            <div className="min-w-0">
              <h1 className="m-0 text-2xl font-black leading-snug text-[#1a0a09]">{pageTitle}</h1>
              <p className="mt-1 mb-0 text-xs text-[#b8837e]">
                {currentLevel === "streams"
                  ? "Choose a stream to begin exploring career paths."
                  : currentLevel === "categories"
                    ? "Select a category within this stream."
                    : currentLevel === "secondcategory"
                      ? "Choose the next step in this career path."
                      : currentLevel === "subcategory"
                        ? "Open a specialization to view full details."
                        : "Career detail view."}
              </p>
            </div>
          </div>
          <div className="mt-2 h-[3px] w-8 rounded-full bg-[#9a2119]" />
        </div>
      </div>

      {loading ? <p className="m-0 text-sm text-muted">{currentLevel === "details" ? "Loading details..." : currentLevel === "categories" ? "Loading categories..." : "Loading streams..."}</p> : null}
      {error ? <p className="m-0 text-sm font-semibold text-red-500">{error}</p> : null}

      {currentLevel === "streams" ? (
        <div className="space-y-3">
          {streamItems.length > 0 ? renderStreamGrid(streamItems) : !loading ? <Empty description="No streams available right now." /> : null}
        </div>
      ) : currentLevel === "categories" ? (
        <div className="space-y-3">
          {categories.length > 0 ? renderCategoryGrid(categories) : !loading ? <Empty description="No categories available for this stream." /> : null}
        </div>
      ) : currentLevel === "secondcategory" ? (
        <div className="space-y-3">
          {renderStepList(secondCategories, "second")}
          {!loading && secondCategories.length === 0 ? <Empty description="No next steps available." /> : null}
        </div>
      ) : currentLevel === "subcategory" ? (
        <div className="space-y-3">
          {renderStepList(subCategories, "sub")}
          {!loading && subCategories.length === 0 ? <Empty description="No specializations available." /> : null}
        </div>
      ) : (
        <div className="space-y-3">
          {!detailUnlocked ? (
            <PremiumGate
              title="Unlock Career Library"
              description="Subscribe to more careers, salary insights, education paths, and institute details."
              returnTo={buildReturnTo()}
            />
          ) : null}

          {details.length > 0 ? details.map((detail, index) => renderDetailItem(detail, index)) : !loading ? <Empty description="No details available for this selection." /> : null}
        </div>
      )}

      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Career Library"
        itemLabel={unlockModalItem ? getItemTitle(unlockModalItem.item) : ""}
        description="Your free Career Library access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={handleGoToPlans}
      />
    </ModuleScreen>
  );
}
