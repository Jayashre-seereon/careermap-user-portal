import { useEffect, useMemo, useState } from "react";
import { Alert } from "antd";
import {
  CalendarOutlined,
  ArrowRightOutlined,
   LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { UnlockRedirectModal } from "../../portal/components/portalPageShared";
import { getEntranceExams } from "../../../api/entranceExamApi";
import { entranceExams as fallbackEntranceExams } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";
import { checkModuleAccess } from "../../../api/moduleAccessApi";

export default function EntranceExamPage() {
  const { goToDashboard } = usePortalNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  const accessStatus = location.state?.accessStatus || "preview";
  const isSubscribed = accessStatus === "unlocked";

  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [items, setItems] = useState(fallbackEntranceExams);
  const [error, setError] = useState("");
  const [moduleMode, setModuleMode] = useState(accessStatus);

  const [category, setCategory] = useState("");
  const [secondCategory, setSecondCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        setError("");
        const response = await getEntranceExams();
        if (active && response.length) {
          setItems(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load entrance exams.");
        }
      }
    }

    loadExams();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccessMode() {
      const moduleId = location.state?.moduleId;
      if (!moduleId) return;

      try {
        const response = await checkModuleAccess(moduleId);
        if (active && response?.mode) {
          setModuleMode(response.mode);
        }
      } catch {
        if (active) {
          setModuleMode(accessStatus);
        }
      }
    }

    loadAccessMode();
    return () => {
      active = false;
    };
  }, [accessStatus, location.state?.moduleId]);

  const categoryOptions = useMemo(
    () => [...new Map(items.filter((i) => i.categoryObj).map((i) => [i.categoryObj.id, i.categoryObj])).values()],
    [items]
  );

  const secondCategoryOptions = useMemo(() => {
    const source = category
      ? items.filter((i) => String(i.categoryObj?.id) === String(category))
      : items;
    return [...new Map(source.filter((i) => i.secondcategoryObj).map((i) => [i.secondcategoryObj.id, i.secondcategoryObj])).values()];
  }, [items, category]);

  const subCategoryOptions = useMemo(() => {
    let source = items;
    if (category) {
      source = source.filter((i) => String(i.categoryObj?.id) === String(category));
    }
    if (secondCategory) {
      source = source.filter((i) => String(i.secondcategoryObj?.id) === String(secondCategory));
    }
    return [...new Map(source.filter((i) => i.subcategoryObj).map((i) => [i.subcategoryObj.id, i.subcategoryObj])).values()];
  }, [items, category, secondCategory]);

  function handleCategoryChange(value) {
    setCategory(value);
    setSecondCategory("");
    setSubCategory("");
  }

  function handleSecondCategoryChange(value) {
    setSecondCategory(value);
    setSubCategory("");
  }

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory = !category || String(item.categoryObj?.id) === String(category);
        const matchesSecondCategory = !secondCategory || String(item.secondcategoryObj?.id) === String(secondCategory);
        const matchesSubCategory = !subCategory || String(item.subcategoryObj?.id) === String(subCategory);

        return matchesCategory && matchesSecondCategory && matchesSubCategory;
      }),
    [items, category, secondCategory, subCategory]
  );

  return (
    <>
      <ModuleScreen className="space-y-4">
        {error ? (
          <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} />
        ) : null}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black text-[#1a0a09]">Entrance Exams</h1>
            <p className="mt-1 text-xs text-[#b8837e]">
              {filtered.length} exams available across streams and authorities.
            </p>
          </div>

          <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none rounded-full border border-[#f0e4e2] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#e0c5c1] focus:border-[#9a2119]"
            >
              <option value="">All Categories</option>
              {categoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#b8837e]" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={secondCategory}
              onChange={(e) => handleSecondCategoryChange(e.target.value)}
              className="appearance-none rounded-full border border-[#f0e4e2] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#e0c5c1] focus:border-[#9a2119]"
            >
              <option value="">All Second Categories</option>
              {secondCategoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#b8837e]" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative">
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="appearance-none rounded-full border border-[#f0e4e2] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#e0c5c1] focus:border-[#9a2119]"
            >
              <option value="">All Sub Categories</option>
              {subCategoryOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#b8837e]" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {(category || secondCategory || subCategory) ? (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setSecondCategory("");
                setSubCategory("");
              }}
              className="rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[#9a2119] underline-offset-2 hover:underline"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="content-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item, index) => {
            const isPreviewMode = moduleMode === "preview";
            const isFree = !isPreviewMode || index < 4;

            return (
            <div
              key={item.id || item.name}
              className="group flex flex-col gap-2.5 rounded-2xl border border-[#f0e4e2] border-t-[3px] border-t-[#9a2119] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10"
              onClick={() => {
                if (!isFree) {
                  setUnlockModalItem({ title: item.name });
                }
              }}
            >
               <div className={`absolute  right-3 flex h-8 w-8 items-center justify-center rounded-full ${isFree ? "bg-green-50" : "bg-red-50"}`}>
                {isFree ? <UnlockOutlined className="text-green-600" /> : <LockOutlined className="text-red-500" />}
              </div>
              <p className="m-0 line-clamp-2 flex-1 text-[25px] font-bold leading-snug text-[#1a0a09]">
                {item.name}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  <CalendarOutlined className="text-[10px]" />
                  Issue: {item.issueDate}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0ee] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9a2119]">
                  <CalendarOutlined className="text-[10px]" />
                  Last: {item.lastDate}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-[#f0e4e2] pt-3">
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#aa8a83]">

                  </span>

                {item.website && item.website !== "#" ? (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (isSubscribed) {
                        return;
                      }

                      if (isFree) {
                        return;
                      }

                      e.preventDefault();
                      setUnlockModalItem({ title: item.name });
                    }}
                    className="flex items-center gap-1 text-sm font-bold text-[#9a2119]"
                  >
                    Explore <ArrowRightOutlined />
                  </a>
                ) : (
                  <span className="text-sm font-bold text-gray-400">No Website</span>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No results found</div>
        ) : null}
      </ModuleScreen>

      <UnlockRedirectModal
        open={!!unlockModalItem}
        title="Unlock Entrance Exam"
        itemLabel={unlockModalItem?.title}
        description="Free preview already used. Please purchase a subscription to continue."
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          navigate(`/app/subscription?returnTo=${encodeURIComponent(location.pathname)}`);
          setUnlockModalItem(null);
        }}
      />
    </>
  );
}
