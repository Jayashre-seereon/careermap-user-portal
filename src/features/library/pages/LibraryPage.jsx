import {
  ArrowRightOutlined,
  BankOutlined,
  BookOutlined,
  BranchesOutlined,
  BranchesOutlined as BranchesOutlinedAlias,
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

import { useEffect, useMemo, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Empty } from "antd";
import {
  getCareerLibraryCategoriesByStream,
  getCareerLibraryDetails,
  getCareerLibraryNext,
  getCareerLibraryStreams,
} from "../../../api/careerLibraryApi";
import { careerLibrary, palette } from "../../../data/careermapData";
import { ModuleScreen, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import {
  PremiumGate,
  UnlockRedirectModal,
  usePortalNavigation,
} from "../../portal/components/portalPageShared";
import { checkModuleAccess } from "../../../api/moduleAccessApi";

const streamIcons = {
  Science: <ExperimentOutlined />,
  Commerce: <CreditCardOutlined />,
  "Arts & Humanities": <BookOutlined />,
  Vocational: <BranchesOutlined />,
  Neutral: <BranchesOutlined />,
};

function stripHtml(value) {
  if (!value) return "";
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
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
  return (
    detail?.subcategory?.title ||
    detail?.secondcategory?.name ||
    detail?.category?.title ||
    `Career Detail ${detail?.id ?? ""}`.trim()
  );
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
  if (normalized.includes("science")) return "flask-outline";
  if (normalized.includes("commerce")) return "calculator-outline";
  if (normalized.includes("arts")) return "color-palette-outline";
  if (normalized.includes("vocational")) return "hammer-outline";
  return "layers-outline";
}

function getStreamTone(streamName) {
  const normalized = String(streamName || "").toLowerCase();
  if (normalized.includes("science")) return palette.blue;
  if (normalized.includes("commerce")) return palette.green;
  if (normalized.includes("arts")) return palette.orange;
  if (normalized.includes("vocational")) return palette.pink;
  return palette.purple;
}

function getStepIcon(type, item) {
  const title = getItemTitle(item).toLowerCase();
  if (type === "category") {
    return title.includes("medical") || title.includes("science")
      ? "medical-outline"
      : "folder-open-outline";
  }
  if (type === "second") {
    return title.includes("education") || title.includes("study")
      ? "school-outline"
      : "albums-outline";
  }
  if (type === "sub") {
    return title.includes("detail") || title.includes("career")
      ? "sparkles-outline"
      : "document-text-outline";
  }
  return "chevron-forward";
}

function normalizeStreamItem(item, index = 0) {
  const fallback =
    careerLibrary.streams[index % careerLibrary.streams.length] ||
    careerLibrary.streams[0];
  const title =
    item?.name ||
    item?.title ||
    item?.streamName ||
    item?.label ||
    fallback?.name ||
    `Stream ${index + 1}`;
  return {
    id: item?.id ?? item?.streamId ?? index + 1,
    name: title,
    desc: stripHtml(
      item?.description || item?.desc || item?.about || fallback?.desc || ""
    ),
    icon: getStreamIcon(title),
    tone: getStreamTone(title),
    image: item?.image || null,
    raw: item,
  };
}

function normalizeStepItem(item, index = 0, type = "category") {
  const title = getItemTitle(item) || `Item ${index + 1}`;
  return {
    id:
      item?.id ??
      item?.categoryId ??
      item?.secondCategoryId ??
      item?.subCategoryId ??
      `${type}-${index}`,
    name: title,
    description: stripHtml(
      item?.description ||
        item?.desc ||
        item?.about ||
        item?.specialization ||
        item?.path ||
        ""
    ),
    coverImage: item?.coverImage || null,
    icon: getStepIcon(type, item),
    tone: palette.primary,
    raw: item,
  };
}

function normalizeSalaryRanges(value) {
  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map((salary) =>
        typeof salary === "string" ? { label: salary } : salary
      );
  }
  if (!value) return [];
  if (typeof value === "string") return [{ label: value }];
  return [{ label: String(value) }];
}

function normalizeTextItems(value) {
  return toList(value)
    .flatMap((item) => {
      if (!item) return [];
      if (typeof item === "string") return [stripHtml(item)];
      return [
        stripHtml(
          item?.name ||
            item?.title ||
            item?.examname ||
            item?.label ||
            item?.value ||
            ""
        ),
      ];
    })
    .filter(Boolean);
}

function normalizeInstituteItems(value) {
  return toList(value).map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `institution-${index}`,
        name: item,
        state: "",
        city: "",
        logo: null,
        location: item,
        isTop: false,
        raw: item,
      };
    }
    const city = item?.city || "";
    const state = item?.state || "";
    const country = item?.countruy || item?.country || "";
    const location =
      [city, state, country].filter(Boolean).join(", ") ||
      item?.location ||
      "Location not available";
    return {
      id: item?.id ?? `institution-${index}`,
      name: item?.name || "Unnamed Institute",
      state,
      city,
      location,
      logo: item?.logo || null, 
      isTop: Boolean(item?.is_top ?? item?.isTop),
      raw: item,
    };
  });
}

function groupInstitutesByTopStatus(value) {
  const institutes = normalizeInstituteItems(value);
  const topInstitutes = institutes.filter((item) => item.isTop);
  const outsideInstitutes = institutes.filter((item) => !item.isTop);
  const referenceState =
    topInstitutes.find((item) => item.state)?.state ||
    outsideInstitutes.find((item) => item.state)?.state ||
    "";
  return { institutes, topInstitutes, outsideInstitutes, referenceState };
}

function formatSalaryAmount(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value ?? "");
  return new Intl.NumberFormat("en-IN").format(numericValue);
}

function formatSalaryRange(salary) {
  if (!salary) return "Salary not available";
  const currency = salary?.currency ? `${salary.currency} ` : "";
  if (salary?.minSalary != null && salary?.maxSalary != null) {
    return `${currency}${formatSalaryAmount(salary.minSalary)} - ${formatSalaryAmount(salary.maxSalary)}`;
  }
  if (salary?.label || salary?.value) return salary.label || salary.value;
  return "Salary not available";
}

function formatDetailEducation(item) {
  const parts = [
    item?.subcategory?.description,
    item?.subcategory?.specialization,
    item?.subcategory?.importandt_facts,
    item?.secondcategory?.description,
    item?.secondcategory?.specialization,
    item?.secondcategory?.importandt_facts,
    item?.category?.description,
    item?.category?.specialization,
    item?.category?.importandt_facts,
    item?.education,
    item?.qualification,
    item?.studyPath,
    item?.about,
    item?.overview,
    item?.description,
    item?.detail,
  ];
  return parts.map(stripHtml).filter(Boolean).join("\n");
}

function normalizeDetailItem(item, index = 0, sourceItem = null) {
  const title =
    getDetailTitle(item) ||
    getItemTitle(sourceItem) ||
    `Career Detail ${index + 1}`;
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
    path: normalizeTextItems(
      item?.path ||
        item?.careerPath ||
        item?.careerpaths ||
        item?.careerPaths ||
        item?.steps ||
        sourceItem?.path ||
        sourceItem?.steps
    ),
    education: formatDetailEducation(item || sourceItem),
    exams: normalizeTextItems(
      item?.entranceexams ||
        item?.entranceExams ||
        item?.exams ||
        item?.exam ||
        sourceItem?.entranceexams ||
        sourceItem?.entranceExams ||
        sourceItem?.exams ||
        []
    ),
    jobs: toList(
      item?.jobs ||
        item?.jobScope ||
        item?.job_scope ||
        sourceItem?.jobs ||
        sourceItem?.jobScope ||
        []
    ),
    salary: stripHtml(item?.salary || item?.salaryRange || sourceItem?.salary || ""),
    salaryRanges: normalizeSalaryRanges(
      item?.salaryRanges ||
        item?.salary_ranges ||
        sourceItem?.salaryRanges ||
        []
    ),
    institutes: normalizeInstituteItems(
      item?.institutions ||
        item?.institutes ||
        item?.topInstitutes ||
        item?.colleges ||
        sourceItem?.institutions ||
        sourceItem?.institutes ||
        []
    ),
    raw: item,
  };
}

function getFallbackNextItems(type, item) {
  const title = getItemTitle(item);
  if (type === "stream") {
    return (careerLibrary.categories[title] || []).map((category, index) =>
      normalizeStepItem({ id: `${title}-${category}`, name: category }, index, "category")
    );
  }
  if (type === "category") {
    return (careerLibrary.programs[title] || []).map((program, index) =>
      normalizeStepItem({ id: `${title}-${program}`, name: program }, index, "second")
    );
  }
  if (type === "second") {
    return (careerLibrary.specializations[title] || []).map((subCategory, index) =>
      normalizeStepItem({ id: `${title}-${subCategory}`, name: subCategory }, index, "sub")
    );
  }
  if (type === "sub") {
    const detail = careerLibrary.details[title];
    return detail ? [normalizeDetailItem(detail, 0, item)] : [];
  }
  return [];
}

function normalizeStreamItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return careerLibrary.streams.map((item, index) =>
      normalizeStreamItem(item, index)
    );
  }
  return items.map((item, index) => normalizeStreamItem(item, index));
}

function normalizeStepItems(items, type) {
  if (!Array.isArray(items) || items.length === 0) return [];
  return items.map((item, index) => normalizeStepItem(item, index, type));
}

function normalizeDetailItems(items, sourceItem) {
  if (!Array.isArray(items) || items.length === 0) {
    return sourceItem ? [normalizeDetailItem(sourceItem, 0, sourceItem)] : [];
  }
  return items.map((item, index) => normalizeDetailItem(item, index, sourceItem));
}

function LibraryBreadcrumb({
  stream,
  category,
  secondCategory,
  subCategory,
  detail,
  level,
}) {
  const parts = [];
  if (stream) parts.push(stream);
  if (category) parts.push(category);
  if (secondCategory) parts.push(secondCategory);
  if (subCategory && level === "details") parts.push(subCategory);
  if (detail && level === "details") parts.push(detail);

  if (!parts.length) return null;

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
      <span>Career Library</span>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="flex items-center gap-1.5">
          <RightOutlined className="text-[10px] opacity-40" />
          <span
            className={
              index === parts.length - 1
                ? "font-semibold text-brand"
                : ""
            }
          >
            {part}
          </span>
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
      <span className="text-sm text-[#9a2119]">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">
        {title}
      </span>
    </div>
  );
}

// ─── InstituteCard ────────────────────────────────────────────────────────────
function InstituteCard({ inst, badge }) {
  const isTop = badge === "Top";
  const typeLabel = inst?.raw?.institute_type || (isTop ? "Government" : "Private");
  const isGovt = typeLabel?.toLowerCase().includes("gov");
  const logo = inst?.logo || null;
  const url = inst?.raw?.url || null;
  const admissionProcess = inst?.raw?.admission_process || null;
  const tentativeDate = inst?.raw?.tentative_date
    ? new Date(inst.raw.tentative_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="relative rounded-2xl border border-[#f0e4e2] bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Type badge top-left */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${isGovt ? "bg-green-500" : "bg-green-400"}`} />
        <span className="text-xs text-gray-500">{isGovt ? "Goverment" : "Private"}</span>
      </div>
      {/* External link top-right */}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#f0e4e2] text-gray-400 hover:text-[#9a2119] hover:border-[#9a2119] transition-colors text-xs font-bold"
        >
          ↗
        </a>
      ) : null}

      {/* Logo */}
      <div className="mt-10 mb-3 flex items-center justify-center h-16">
        {logo ? (
  <img
    src={logo}
    alt={inst.name}
    className="h-14 w-14 object-contain"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
) : (
  <div className="h-14 w-14 rounded-full bg-[#fdf0ee] flex items-center justify-center text-2xl text-[#9a2119]">
    🏛️
  </div>
)}
      </div>

      {/* Name */}
      <p className="text-center text-sm font-bold text-[#1a0a09] px-4 leading-snug mb-3">
        {inst.name}
      </p>

      {/* Admission + Tentative date */}
      {(admissionProcess || tentativeDate) ? (
        <div className="flex justify-between items-start border-t border-[#f7eeec] px-4 py-3 gap-2">
          {admissionProcess ? (
            <div>
              <p className="text-[10px] text-gray-400 mb-0.5">Admission via</p>
              <p className="text-xs font-semibold text-[#1a0a09]">{admissionProcess}</p>
            </div>
          ) : null}
          {tentativeDate ? (
            <div className="text-right">
              <p className="text-[10px] text-gray-400 mb-0.5">Tentative Date</p>
              <p className="text-xs font-semibold text-[#1a0a09]">{tentativeDate}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { isUnlocked, registerFreeDetailAccess, savedCareers, toggleSavedCareer } =
    useAppState();
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

  const pageLocation = useLocation();
  const accessStatus = pageLocation.state?.accessStatus || "preview";
  const [moduleStatus, setModuleStatus] = useState(accessStatus);
  const hasSubscriptionAccess = accessStatus === "unlocked";

  useEffect(() => {
    let active = true;

    async function loadStreams() {
      try {
        setLoading(true);
        setError("");
        const response = await getCareerLibraryStreams();
        const items = Array.isArray(response?.data) ? response.data : [];
        if (!active) return;
        setStreamItems(normalizeStreamItems(items));
      } catch (_fetchError) {
        if (active) {
          setError("Unable to load streams right now.");
          setStreamItems(normalizeStreamItems([]));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStreams();
    return () => { active = false; };
  }, []);

  const detailUnlocked = hasSubscriptionAccess || moduleStatus !== "locked";

  const pageTitle = useMemo(() => {
    if (currentLevel === "streams") return "Career Library";
    if (currentLevel === "categories") return selectedStream?.name || "Career Library";
    if (currentLevel === "secondcategory") return selectedCategory?.name || "Career Library";
    if (currentLevel === "subcategory") return selectedSecondCategory?.name || "Career Library";
    if (currentLevel === "details")
      return (
        getItemTitle(
          selectedDetailSource ||
            selectedSubCategory ||
            selectedSecondCategory ||
            selectedCategory
        ) || "Career Library"
      );
    return "Career Library";
  }, [
    currentLevel,
    selectedCategory,
    selectedDetailSource,
    selectedSecondCategory,
    selectedStream,
    selectedSubCategory,
  ]);

  function buildReturnTo() {
    return location.pathname;
  }

  function getDetailItemsLabel() {
    return getItemTitle(
      selectedDetailSource ||
        selectedSubCategory ||
        selectedSecondCategory ||
        selectedCategory
    );
  }

  async function handleClick(type, id, item) {
    setLoading(true);
    setError("");
    setUnlockModalItem(null);
    setSelectedDetailSource(null);

    try {
      // ── STREAM ──────────────────────────────────────────────────────────────
      if (type === "stream") {
        setSelectedStream(item);
        setSelectedCategory(null);
        setSelectedSecondCategory(null);
        setSelectedSubCategory(null);
        setSecondCategories([]);
        setSubCategories([]);
        setDetails([]);
        setDetailReturnLevel("streams");

        try {
          const response = await getCareerLibraryCategoriesByStream(id);
          const items =
            Array.isArray(response?.data) && response.data.length > 0
              ? response.data
              : [];
          setCategories(normalizeStepItems(items, "category"));
          setCurrentLevel("categories");
        } catch (_err) {
          setCategories([]);
          setCurrentLevel("categories");
        }
        return;
      }

      // ── CATEGORY ────────────────────────────────────────────────────────────
      if (type === "category") {
        setSelectedCategory(item);

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const nextType = data?.type;
        const items = Array.isArray(data?.data) ? data.data : [];

        if (nextType === "secondcategory") {
          setSecondCategories(normalizeStepItems(items, "second"));
          setCurrentLevel("secondcategory");
          setDetailReturnLevel("categories");
          return;
        }

        if (nextType === "details") {
          let detailItems = items;
          if (detailItems.length === 0) {
            try {
              const detailResponse = await getCareerLibraryDetails(id);
              const detailData = detailResponse ?? {};
              detailItems = Array.isArray(detailData?.data) ? detailData.data : [];
            } catch (_err) { detailItems = []; }
          }
          setSelectedDetailSource(item);
          setDetails(normalizeDetailItems(detailItems, item));
          setDetailReturnLevel("categories");
          setCurrentLevel("details");
          return;
        }

        setSecondCategories([]);
        setCurrentLevel("secondcategory");
        return;
      }

      // ── SECOND CATEGORY ─────────────────────────────────────────────────────
      if (type === "second") {
        setSelectedSecondCategory(item);

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const nextType = data?.type;
        const items = Array.isArray(data?.data) ? data.data : [];

        if (nextType === "subcategory") {
          setSubCategories(normalizeStepItems(items, "sub"));
          setCurrentLevel("subcategory");
          setDetailReturnLevel("secondcategory");
          return;
        }

        if (nextType === "details") {
          let detailItems = items;
          if (detailItems.length === 0) {
            try {
              const detailResponse = await getCareerLibraryDetails(id);
              const detailData = detailResponse ?? {};
              detailItems = Array.isArray(detailData?.data) ? detailData.data : [];
            } catch (_err) { detailItems = []; }
          }
          setSelectedDetailSource(item);
          setDetails(normalizeDetailItems(detailItems, item));
          setDetailReturnLevel("secondcategory");
          setCurrentLevel("details");
          return;
        }

        return;
      }

      // ── SUB CATEGORY ────────────────────────────────────────────────────────
      if (type === "sub") {
        setSelectedSubCategory(item);

        const response = await getCareerLibraryNext(type, id);
        const data = response ?? {};
        const nextType = data?.type;
        let items = Array.isArray(data?.data) ? data.data : [];

        if (nextType === "details" && items.length === 0) {
          try {
            const detailResponse = await getCareerLibraryDetails(id);
            const detailData = detailResponse ?? {};
            items = Array.isArray(detailData?.data) ? detailData.data : [];
          } catch (_err) {
            items = [];
          }
        }

        setSelectedDetailSource(item);
        setDetails(normalizeDetailItems(items, item));
        setDetailReturnLevel("subcategory");
        setCurrentLevel("details");

        if (item?.id != null) {
          registerFreeDetailAccess("career-library", String(item.id));
        }
        return;
      }
    } catch (_fetchError) {
      setError("Unable to load the next step. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    if (currentLevel === "details") {
      if (!hasSubscriptionAccess) {
        setModuleStatus("locked");
      }
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
    if (moduleStatus === "locked" && !hasSubscriptionAccess) {
      setUnlockModalItem({ item, type });
      return;
    }
    handleClick(type, item?.id, item);
  }

  function handleGoToPlans() {
    const returnTo = buildReturnTo();
    setUnlockModalItem(null);
    navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
  }

  // ── RENDER HELPERS ──────────────────────────────────────────────────────────

  function renderStreamGrid(items) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={`stream-${item?.id ?? index}`}
            type="button"
            onClick={() => handleClick("stream", item?.id, item)}
            className="group rounded-2xl overflow-hidden border border-gray-200 bg-white text-left transition hover:shadow-lg hover:-translate-y-1"
          >
            <div className="h-40 w-full overflow-hidden bg-gray-100">
              {item?.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-3xl text-[#9a2119]">
                  <BookOutlined />
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-[#9a2119] line-clamp-2">
                {item?.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2">
                {item?.desc || "Explore categories and discover more options."}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-semibold text-[#9a2119]">View</span>
                <ArrowRightOutlined className="text-xs opacity-60 group-hover:translate-x-1 transition" />
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  function renderCategoryGrid(items, type = "category") {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const unlockedItem = moduleStatus !== "locked";

          return (
            <button
              key={`${type}-${item?.id ?? index}`}
              type="button"
              onClick={() => handleLockedCareerClick(item, type)}
              className="group rounded-2xl overflow-hidden border border-gray-200 bg-white text-left transition hover:shadow-lg hover:-translate-y-1"
            >
              <div className="h-44 w-full overflow-hidden bg-gray-100">
                {item?.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-sm font-semibold !text-[#9a2119] line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {item.description || "Explore this category"}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-semibold text-[#9a2119]">View</span>
                  <ArrowRightOutlined className="text-xs opacity-60 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  function renderStepList(items, type) {
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const unlockedItem = moduleStatus !== "locked";

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
                <Text className="block text-[15px] font-bold text-ink">
                  {getItemTitle(item)}
                </Text>
                {item?.description ? (
                  <Text className="mt-1 block text-xs leading-5 text-muted">
                    {item.description}
                  </Text>
                ) : null}
              </div>
              {!hasSubscriptionAccess ? (
                <div
                  className={`mr-2 rounded-full px-2 py-1 ${
                    unlockedItem ? "bg-green-100" : "bg-[#f8e8d8]"
                  }`}
                >
                  <Text
                    className="text-[10px] font-black"
                    style={{ color: unlockedItem ? palette.green : palette.primary }}
                  >
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

  // ── REDESIGNED renderDetailItem ─────────────────────────────────────────────
  function renderDetailItem(detail, index) {
    const title = detail?.title || getItemTitle(detail);
    const instituteGroups = groupInstitutesByTopStatus(detail?.institutes);
    const careerpaths = detail?.raw?.careerpaths || [];
    const entranceexams = detail?.raw?.entranceexams || [];
    const jobs = toList(detail?.jobs || detail?.jobScope);
    const salaryRanges = detail?.salaryRanges || [];
    const description = getDetailDescription(detail);
    const stateLabel = instituteGroups.referenceState || "State";

    const sidebarSections = [
      { id: `desc-${index}`, label: "Description" },
      { id: `path-${index}`, label: "Path" },
      { id: `exams-${index}`, label: "Entrance Exams" },
      { id: `jobs-${index}`, label: "Job Scopes" },
      { id: `salary-${index}`, label: "Salary Range" },
      { id: `top-in-${index}`, label: `Top Institutes In ${stateLabel}` },
      { id: `top-out-${index}`, label: `Top Institutes Outside ${stateLabel}` },
    ];

    function scrollTo(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return (
      <div key={`detail-${detail?.id ?? index}`} className="flex gap-6 items-start">

        {/* ── Sticky Sidebar ── */}
        <div className="hidden lg:block sticky top-4 w-60 shrink-0">
          <div className="rounded-2xl border border-[#f0e4e2] bg-white overflow-hidden shadow-sm">
            {sidebarSections.map((sec, i) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className={`w-full text-left px-5 py-3.5 text-sm font-medium text-[#1a0a09] transition-colors hover:bg-[#fdf0ee] hover:text-[#9a2119]
                  ${i < sidebarSections.length - 1 ? "border-b border-[#f7eeec]" : ""}`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 min-w-0 space-y-10">

          {/* Description */}
          {description ? (
            <section id={`desc-${index}`} className="scroll-mt-4">
              <h2 className="text-xl font-bold text-[#9a2119] mb-3">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed text-justify">{description}</p>
            </section>
          ) : null}

          {/* Career Path Table */}
          <section id={`path-${index}`} className="scroll-mt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🗺️</span>
              <h2 className="text-xl font-bold text-[#1a0a09]">
                How to Build a Career in{" "}
                <span className="text-[#9a2119]">{title} ?</span>
              </h2>
            </div>
            {careerpaths.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#f0e4e2]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#fdf7f6]">
                      {["Path", "Stream", "Graduation", "After Graduation", "After Post Graduation", "Any Other"].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left font-bold text-[#1a0a09] border-b border-[#f0e4e2] whitespace-nowrap"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {careerpaths.map((cp, cpIdx) => (
                      <tr
                        key={cp?.id ?? cpIdx}
                        className={cpIdx % 2 === 0 ? "bg-white" : "bg-[#fdf9f9]"}
                      >
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600 whitespace-nowrap">
                          {cp?.path?.pathtype || cp?.pathName || `Path ${cpIdx + 1}`}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">
                          {detail?.raw?.stream?.name || "—"}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">
                          {cp?.graduation || "—"}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">
                          {cp?.aftergraduation || "—"}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">
                          {cp?.afterpostgraduation || "—"}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">
                          {cp?.anyother || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : detail?.path?.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-[#f0e4e2]">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#fdf7f6]">
                      {["Step", "Description"].map((col) => (
                        <th key={col} className="px-4 py-3 text-left font-bold text-[#1a0a09] border-b border-[#f0e4e2]">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detail.path.map((step, si) => (
                      <tr key={si} className={si % 2 === 0 ? "bg-white" : "bg-[#fdf9f9]"}>
                        <td className="px-4 py-3 border-b border-[#f7eeec] font-semibold text-[#9a2119] whitespace-nowrap">
                          Step {si + 1}
                        </td>
                        <td className="px-4 py-3 border-b border-[#f7eeec] text-gray-600">{step}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Career path details not available.</p>
            )}
          </section>

          {/* Entrance Exams */}
          <section id={`exams-${index}`} className="scroll-mt-4">
            <h2 className="text-xl font-bold text-[#1a0a09] mb-4">Entrance Exams</h2>
            {entranceexams.length > 0 ? (
              <div className="space-y-3">
                {entranceexams.map((exam, ei) => (
                  <div
                    key={exam?.id ?? ei}
                    className="flex items-stretch gap-4 rounded-xl border border-[#f0e4e2] bg-white p-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#9a2119] text-white text-base mt-0.5">
                      <SolutionOutlined />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">Exam Name:</p>
                      <p className="text-sm font-semibold text-[#1a0a09] leading-snug">
                        {exam?.examname || "—"}
                      </p>
                      {exam?.about && exam.about !== "Nothing" ? (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{exam.about}</p>
                      ) : null}
                    </div>
                    {/* Dates */}
                    <div className="shrink-0 text-right space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">Form Issue Date:</p>
                        <p className="text-xs font-semibold text-[#1a0a09]">
                          {exam?.issuedate
                            ? new Date(exam.issuedate)
                                .toLocaleDateString("en-IN", { day: "2-digit", month: "long" })
                                .toUpperCase()
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Last Date:</p>
                        <p className="text-xs font-semibold text-[#1a0a09]">
                          {exam?.lastdate
                            ? new Date(exam.lastdate)
                                .toLocaleDateString("en-IN", { day: "2-digit", month: "long" })
                                .toUpperCase()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="flex items-center shrink-0 pl-2">
                      {exam?.url ? (
                        <a
                          href={exam.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f0e4e2] text-[#9a2119] hover:bg-[#fdf0ee] transition-colors font-bold"
                        >
                          →
                        </a>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center text-gray-300 font-bold">→</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : toList(detail?.exams).length > 0 ? (
              <div className="space-y-3">
                {toList(detail.exams).map((exam, ei) => (
                  <div key={ei} className="flex items-center gap-3 rounded-xl border border-[#f0e4e2] bg-white p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9a2119] text-white text-sm">
                      <SolutionOutlined />
                    </div>
                    <p className="text-sm text-[#1a0a09] font-medium">{exam}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Entrance exam details not available.</p>
            )}
          </section>

          {/* Job Scopes */}
          <section id={`jobs-${index}`} className="scroll-mt-4">
            <h2 className="text-xl font-bold text-[#1a0a09] mb-4">Job Scopes</h2>
            {jobs.length > 0 ? (
              <ul className="space-y-2">
                {jobs.map((scope, ji) => (
                  <li key={ji} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#cb9c48]" />
                    {scope}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Job scope not available.</p>
            )}
          </section>

          {/* Salary Range */}
          <section id={`salary-${index}`} className="scroll-mt-4">
            <h2 className="text-xl font-bold text-[#1a0a09] mb-4">Salary Range</h2>
            {salaryRanges.length > 0 ? (
              <ul className="space-y-2">
                {salaryRanges.map((salary, si) => (
                  <li key={salary?.id ?? si} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#9a2119]" />
                    <span className="font-semibold">{formatSalaryRange(salary)}</span>
                  </li>
                ))}
              </ul>
            ) : detail?.salary ? (
              <p className="text-sm font-semibold text-[#9a2119]">{detail.salary}</p>
            ) : (
              <p className="text-sm text-gray-400">Salary details not available.</p>
            )}
          </section>

          {/* Top Institutes In State */}
          <section id={`top-in-${index}`} className="scroll-mt-4">
            <h2 className="text-xl font-bold text-[#1a0a09] mb-4">
              Top Institutes in {stateLabel}
            </h2>
            {instituteGroups.topInstitutes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {instituteGroups.topInstitutes.map((inst) => (
                  <InstituteCard key={inst.id} inst={inst} badge="Top" />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No top institutes found for this state.</p>
            )}
          </section>

          {/* Top Institutes Outside State */}
          <section id={`top-out-${index}`} className="scroll-mt-4">
            <h2 className="text-xl font-bold text-[#1a0a09] mb-4">
              Top Institutes outside {stateLabel}
            </h2>
            {instituteGroups.outsideInstitutes.length > 0 ? (
              <>
                {/* Filters */}
                <div className="mb-5 flex flex-wrap gap-4 items-end">
                  <span className="text-sm text-gray-500 font-medium self-end pb-1">Filters :</span>
                  {[
                    { label: "Country", placeholder: "Choose Country" },
                    { label: "State", placeholder: "Choose State" },
                    { label: "Institution Type", placeholder: "Choose Institution Type" },
                  ].map((f) => (
                    <div key={f.label} className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">{f.label} :</span>
                      <select className="rounded-xl border border-[#e5d5d3] bg-white px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-[#9a2119] min-w-[160px]">
                        <option value="">{f.placeholder}</option>
                      </select>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {instituteGroups.outsideInstitutes.map((inst) => (
                    <InstituteCard key={inst.id} inst={inst} badge="Outside" />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">No institutes found outside this state.</p>
            )}
          </section>

        </div>
      </div>
    );
  }

  // ── JSX ─────────────────────────────────────────────────────────────────────

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
              <h1 className="m-0 text-2xl font-black leading-snug text-[#1a0a09]">
                {pageTitle}
              </h1>
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

      {loading ? (
        <p className="m-0 text-sm text-muted">
          {currentLevel === "details"
            ? "Loading details..."
            : currentLevel === "categories"
            ? "Loading categories..."
            : "Loading streams..."}
        </p>
      ) : null}
      {error ? (
        <p className="m-0 text-sm font-semibold text-red-500">{error}</p>
      ) : null}

      {currentLevel === "streams" ? (
        <div className="space-y-3">
          {streamItems.length > 0 ? (
            renderStreamGrid(streamItems)
          ) : !loading ? (
            <Empty description="No streams available right now." />
          ) : null}
        </div>
      ) : currentLevel === "categories" ? (
        <div className="space-y-3">
          {categories.length > 0 ? (
            renderCategoryGrid(categories, "category")
          ) : !loading ? (
            <Empty description="No categories available for this stream." />
          ) : null}
        </div>
      ) : currentLevel === "secondcategory" ? (
        <div className="space-y-3">
          {renderCategoryGrid(secondCategories, "second")}
          {!loading && secondCategories.length === 0 ? (
            <Empty description="No next steps available." />
          ) : null}
        </div>
      ) : currentLevel === "subcategory" ? (
        <div className="space-y-3">
          {renderCategoryGrid(subCategories, "sub")}
          {!loading && subCategories.length === 0 ? (
            <Empty description="No specializations available." />
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {!detailUnlocked ? (
            <PremiumGate
              title="Unlock Career Library"
              description="Subscribe to more careers, salary insights, education paths, and institute details."
              returnTo={buildReturnTo()}
            />
          ) : null}
          {details.length > 0 ? (
            details.map((detail, index) => renderDetailItem(detail, index))
          ) : !loading ? (
            <Empty description="No details available for this selection." />
          ) : null}
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