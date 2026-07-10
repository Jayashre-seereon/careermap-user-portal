import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Tabs } from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useLocation, useSearchParams } from "react-router-dom";
import { getScholarships,  getScholarshipById, } from "../../../api/scholarshipApi";
import { scholarships as fallbackScholarships } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";
import { checkModuleAccess, startPreview } from "../../../api/moduleAccessApi";
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
export default function ScholarshipPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const pageLocation = useLocation();
  const [params] = useSearchParams();
  const [items, setItems] = useState(fallbackScholarships);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const accessStatus = pageLocation.state?.accessStatus || "preview";
  const unlocked = accessStatus === "full" || isUnlocked("scholarship");
  const SCHOLARSHIP_MODULE_ID =  pageLocation.state?.moduleId;// apna scholarship module id
  const [moduleMode, setModuleMode] = useState(accessStatus);

const [previewSessionId, setPreviewSessionId] = useState(null);
const [previewRemaining, setPreviewRemaining] = useState(0);
const [previewExpired, setPreviewExpired] = useState(false);
  const [category, setCategory] = useState("");
  const [secondCategory, setSecondCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    let active = true;

    async function loadScholarships() {
      try {
        setError("");
        const response = await getScholarships();
        if (active && response.length) {
          setItems(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load scholarships.");
        }
      }
    }

    loadScholarships();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccessMode() {
      if (!SCHOLARSHIP_MODULE_ID) return;

      try {
        const response = await checkModuleAccess(SCHOLARSHIP_MODULE_ID);
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
  }, [SCHOLARSHIP_MODULE_ID, accessStatus]);

  useEffect(() => {
  if (!previewSessionId || previewExpired) return;

  const timer = setInterval(() => {
    setPreviewRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        setPreviewExpired(true);
        return 0;
      }

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [previewSessionId, previewExpired]);

useEffect(() => {
  if (previewExpired && selectedItem) {
    setUnlockModalItem(selectedItem.name);
  }
}, [previewExpired, selectedItem]);

useEffect(() => {
  if (moduleMode === "preview" && selectedItem && previewRemaining === 0 && !previewExpired) {
    setPreviewRemaining(15);
  }
}, [moduleMode, selectedItem, previewRemaining, previewExpired]);

  function isScholarshipLocked(item) {
    if (moduleMode === "full") {
      return false;
    }

    return String(item?.accessTier || "locked").toLowerCase() === "locked";
  }

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
        const matchesStatus = activeStatus === "All" || item.status === activeStatus;
        const matchesCategory = !category || String(item.categoryObj?.id) === String(category);
        const matchesSecondCategory = !secondCategory || String(item.secondcategoryObj?.id) === String(secondCategory);
        const matchesSubCategory = !subCategory || String(item.subcategoryObj?.id) === String(subCategory);

        return matchesStatus && matchesCategory && matchesSecondCategory && matchesSubCategory;
      }),
    [activeStatus, items, category, secondCategory, subCategory]
  );

  function buildScholarshipReturnTo(itemName = selectedItem?.name) {
    const nextParams = new URLSearchParams();
    if (activeStatus !== "All") nextParams.set("status", activeStatus);
    if (itemName) nextParams.set("item", itemName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  async function openScholarship(item, index) {
    try {
      if (isScholarshipLocked(item)) {
        setUnlockModalItem(item.name);
        return;
      }

      if (moduleMode === "full") {
        const response = await getScholarshipById(item.id);
        setSelectedItem(response);
        return;
      }

      const preview = await startPreview({
        moduleId: SCHOLARSHIP_MODULE_ID,
        pageType: "scholarship",
        pageId: item.id,
      });

      setPreviewSessionId(preview.previewSessionId);
      setPreviewRemaining(preview.remainingSeconds ?? preview.previewDurationSeconds ?? 15);
      setPreviewExpired(false);

      const detail = await getScholarshipById(
        item.id,
        SCHOLARSHIP_MODULE_ID,
        preview.previewSessionId
      );

      setSelectedItem(detail);
      registerFreeDetailAccess("scholarship", item.name);
    } catch (err) {
      console.error("ERROR =>", err);
    }
}

  function handleGoToPlans(itemName = unlockModalItem) {
    const returnTo = buildScholarshipReturnTo(itemName);
    setUnlockModalItem(null);
    navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
  }

  useEffect(() => {
    const status = params.get("status");
    const itemName = params.get("item");
    if (status) setActiveStatus(status);
    if (itemName) {
      const matched = items.find((item) => item.name === itemName);
      if (matched) setSelectedItem(matched);
    }
  }, [items, params]);

  if (selectedItem) {
    const detailUnlocked = unlocked || canAccessFreeDetail("scholarship", selectedItem.name);
    const isActive = selectedItem.status === "Active";
    const showCountdown = isActive && typeof selectedItem.daysRemaining === "number" && selectedItem.daysRemaining >= 0;

    return (
      <ModuleScreen className="space-y-4">
       {moduleMode === "preview" && !previewExpired && previewRemaining > 0 ? (
          <div className="sticky top-0 z-10 mb-4 flex justify-end">
            <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 shadow-sm">
              <ClockCircleOutlined />
              Preview ends in {previewRemaining}s
            </div>
          </div>
        ) : null}

        <PageHero backOnly onBack={() => setSelectedItem(null)} />
        {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

        <div className="content-stagger grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
          {/* Left column: editorial content */}
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm">
              {selectedItem.image ? (
                <div
                  className="h-40 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedItem.image})` }}
                />
              ) : (
                <div className="h-2 bg-gradient-to-r from-[#9a2119] to-[#c84f15]" />
              )}
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8837e]">
                      {selectedItem.provider}
                    </p>
                    <h1 className="m-0 mt-1 text-2xl font-black leading-snug text-[#1a0a09]">
                      {selectedItem.name}
                    </h1>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {isActive ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
                    {selectedItem.status}
                  </span>
                </div>


              </div>
            </div>

            <div id="section-eligibility" className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm scroll-mt-24 overflow-hidden rounded-[26px]">
              <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
                <TeamOutlined className="text-sm text-[#9a2119]" />
                <h3 className="m-0 text-[10px] font-black uppercase tracking-widest text-[#9a2119]">Eligibility</h3>
              </div>
              <p className="m-0 px-5 py-4 text-sm font-medium leading-7 text-[#1a0a09]">{selectedItem.eligibility}</p>
            </div>

            <div id="section-requirements" className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm scroll-mt-24">
              <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
                <FileTextOutlined className="text-sm text-[#9a2119]" />
                <h3 className="m-0 text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">Requirements</h3>
              </div>
              <div className="px-5 py-3">
                {selectedItem.requirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 py-3 ${index < selectedItem.requirements.length - 1 ? "border-b border-[#fdf0ee]" : ""
                      }`}
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" />
                    <p className="m-0 text-sm leading-7 text-gray-600">{req}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedItem.sections?.length ? (
              <div className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
                  <FileTextOutlined className="text-sm text-[#9a2119]" />
                  <h3 className="m-0 text-[10px] font-black uppercase tracking-widest text-[#9a2119]">Description</h3>
                </div>
                <div className="divide-y divide-[#f0e4e2]">
                  {selectedItem.sections.map((section) => (
                    <div key={section.id} id={`section-${section.id}`} className="scroll-mt-24 px-5 py-4">
                      <div className="m-0 mb-2 text-[15px]" style={{ fontWeight: "bold", color: "#9a2119" }}>
                        {section.title}
                      </div>
                      <div
                        className="ckeditor-output text-sm leading-7 text-gray-600"
                        dangerouslySetInnerHTML={{ __html: section.description || "" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right column: persistent apply rail */}
          <div className="space-y-4 lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm">
              <div className="space-y-4 p-5">
                <p className="m-0 text-sm font-bold text-[#92702c]">
  <span className="text-[10px] uppercase tracking-widest text-[#b8837e] mr-2">
    Award Amount:
  </span>
  {selectedItem.amount}
</p>

                <div className="h-px bg-[#f0e4e2]" />

                <div className="flex items-center gap-2.5 ">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fdf0ee] text-[#9a2119]">
                    <CalendarOutlined />
                  </span>
                 <p className="m-0 text-sm font-bold text-[#1a0a09]">
  <span className="text-[10px] uppercase tracking-widest text-[#b8837e] mr-2">
    Deadline:
  </span>
  {selectedItem.deadline}
</p>
                </div>
                <div className="h-px bg-[#f0e4e2] " />
                <Button
                  type="primary"
                  href={selectedItem.link}
                  target="_blank"
                  block
                  icon={<ArrowRightOutlined />}
                  className="!mt-1 !h-9  !mt-4 !rounded-xl !border-[#9a2119] !bg-[#9a2119] !text-sm !font-semibold hover:!bg-[#7a1a13]"
                >
                  Apply Now
                </Button>
                {showCountdown ? (
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fdf0ee] text-[#9a2119]">
                      <ClockCircleOutlined />
                    </span>
                    <div>
                      <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">Time Left</p>
                      <p className="m-0 text-sm font-bold text-[#1a0a09]">
                        {selectedItem.daysRemaining === 0 ? "Closes today" : `${selectedItem.daysRemaining} days remaining`}
                      </p>
                    </div>
                  </div>
                ) : null}
                <div className="h-px bg-[#f0e4e2] mt-4" />

                <div>
                  <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">On This Page</p>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => scrollToSection("section-eligibility")}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#9a2119] transition hover:bg-[#fdf0ee]"
                    >
                      <TeamOutlined className="text-xs" />
                      Eligibility
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection("section-requirements")}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#9a2119] transition hover:bg-[#fdf0ee]"
                    >
                      <FileTextOutlined className="text-xs" />
                      Requirements
                    </button>
                    {selectedItem.sections?.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => scrollToSection(`section-${section.id}`)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-semibold text-[#9a2119] transition hover:bg-[#fdf0ee]"
                      >
                        <StarOutlined className="text-xs" />
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
                {!detailUnlocked ? (
                  <Button block onClick={() => handleGoToPlans(selectedItem.name)} className="!h-12 !rounded-xl">
                    Unlock to Continue
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <UnlockRedirectModal
  open={Boolean(unlockModalItem)}
  title="Unlock Scholarship"
  itemLabel={unlockModalItem}
  description="Your 15 second preview has ended. Please purchase this module to continue."
  onCancel={() => {
    setUnlockModalItem(null);
    setSelectedItem(null);
  }}
  onConfirm={() => {
    handleGoToPlans();
  }}
/>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-4">
      {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-black text-[#1a0a09]">Scholarships</h1>
          <p className="mt-1 text-xs text-[#b8837e]">{filtered.length} opportunities found</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Tabs
            activeKey={activeStatus}
            onChange={setActiveStatus}
            items={["All", "Active", "Expired"].map((key) => ({ key, label: key }))}
            className="mb-0 [&_.ant-tabs-nav]:!mb-0 [&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab]:text-xs [&_.ant-tabs-tab]:uppercase [&_.ant-tabs-tab]:tracking-widest [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#9a2119] [&_.ant-tabs-ink-bar]:!bg-[#9a2119] [&_.ant-tabs-nav::before]:!border-[#f0e4e2]"
          />
          <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
        </div>
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

      <div className="content-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const isActive = item.status === "Active";
          const isLocked = isScholarshipLocked(item);

          return (
            <div
              key={item.id || item.name}
             onClick={() => {
                const itemIndex = filtered.findIndex((current) => (current.id || current.name) === (item.id || item.name));

                if (isLocked) {
                  setUnlockModalItem(item.name);
                  return;
                }

                openScholarship(item, itemIndex);
              }}
              className="group flex cursor-pointer overflow-hidden rounded-[24px] border border-[#f0e4e2] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
            >
              {/* Amount rail: leads with the number, not an icon */}
              <div
                className={`flex w-[92px] shrink-0 flex-col items-center justify-center gap-1 px-2 py-4 text-center ${isActive ? "bg-[#fdf8f3]" : "bg-gray-50"
                  }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#b8837e]">Award</span>
                <span className={`text-[15px] font-black leading-tight ${isActive ? "text-[#92702c]" : "text-gray-400"}`}>
                  {item.rawPrice ? `Rs ${item.rawPrice}` : "N/A"}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 border-l border-[#f0e4e2] px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">{item.provider}</p>
                    <p className="m-0 mt-0.5 line-clamp-2 text-[15px] font-black leading-snug text-[#1a0a09] transition-colors group-hover:text-[#9a2119]">
                      {item.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-2 text-[15px] font-bold ${
                      isLocked ? "bg-[#fdf0ee] text-[#9a2119]" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isLocked ? <LockOutlined /> : <UnlockOutlined />}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0e4e2] pt-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold ${isActive ? "text-green-700" : "text-gray-400"
                      }`}
                  >
                    {isActive ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
                    {item.deadline}
                  </span>
                  <span className={`flex shrink-0 items-center gap-1 text-xs font-bold ${isLocked ? "text-[#9a2119]" : "text-green-700"}`}>
                    {isLocked ? "Unlock" : "Explore"} <ArrowRightOutlined />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No scholarships match these filters</div>
      ) : null}

      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Scholarships"
        itemLabel={unlockModalItem}
        description="Your free scholarship access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => handleGoToPlans()}
      />
    </ModuleScreen>
  );
}
