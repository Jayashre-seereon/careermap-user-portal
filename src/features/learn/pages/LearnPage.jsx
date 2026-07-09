import { useEffect, useMemo, useState } from "react";
import { Alert, Button } from "antd";
import { ArrowRightOutlined, LockOutlined,UnlockOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useSearchParams,useLocation } from "react-router-dom";
import { getMasterClasses,
 } from "../../../api/masterclassApi";
 import {startPreview,} from "../../../api/moduleAccessApi";
import { masterClasses as fallbackMasterClasses } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";
// import { useLocation } from "react-router-dom";
function formatViews(views) {
  if (!views) {
    return "New";
  }

  if (views < 1000) {
    return `${views} views`;
  }

  return `${(views / 1000).toFixed(1)}k views`;
}

function MasterClassCard({ item, unlocked, detailUnlocked, onWatch }) {
   
  const locked = item.locked && !unlocked;
  const heroTone = locked ? "#f8e8d8" : "#fdf0ee";


  return (
    <div
      className="group relative overflow-hidden rounded-[24px] border border-[#f0e4e2] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
      style={{ opacity: locked && !detailUnlocked ? 0.96 : 1 }}
    >
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#f0e4e2] transition-colors group-hover:bg-[#9a2119]" />

      <div className="flex h-full flex-col gap-4 pt-2">
        <div className="flex items-start gap-3">
          

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-extrabold leading-[21px] text-ink">{item.title}</div>
                <div className="mt-1 truncate text-[12px] text-muted">{item.mentor}</div>
              </div>

             <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${locked ? "bg-[#fff6f2] text-brand" : "bg-green-50 text-green-600"}`}>
                {locked ? <LockOutlined /> : <UnlockOutlined />}
              </div>
            </div>

            <div className="mt-3 flex flex-nowrap items-center gap-2 overflow-hidden">
              <SoftTag color="red" className="shrink-0 whitespace-nowrap">
                {item.career}
              </SoftTag>
              <SoftTag color="gold" className="shrink-0 whitespace-nowrap">
                {formatViews(item.views)}
              </SoftTag>
            
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="w-full rounded-[18px] border border-[#f4e3df] bg-[#fff9f7] px-5 py-3 sm:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8837e]">
              Date
            </div>
            <div className="mt-1 text-[13px] font-semibold text-ink">{item.duration}</div>
          </div>
        </div>

        {!unlocked && item.locked ? (
          <div className="rounded-[18px] border border-[#f4e3df] bg-[#fff9f7] px-4 py-3 text-[12px] leading-5 text-muted">
            {detailUnlocked
              ? "Your first locked class is available for free."
              : "You have already used the free master class preview."}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-[#f0e4e2] pt-3">
            <Button
            type="link"
            className="!h-auto !p-0 !text-sm !font-bold !text-[#9a2119]"
            onClick={onWatch}
            icon={<PlayCircleOutlined className="!text-base" />}
          >
            {locked && !detailUnlocked ? "Unlock More Classes" : "Watch Video"} <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
}



export default function LearnPage() {
  const { canAccessFreeDetail, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();
const pageLocation = useLocation();

const MASTERCLASS_MODULE_ID =
  pageLocation.state?.moduleId;

const accessStatus =
  pageLocation.state?.accessStatus ||
  "preview";


const unlocked =
  accessStatus === "unlocked";
  const [items, setItems] = useState(fallbackMasterClasses);
  const [error, setError] = useState("");
  const [videoType, setVideoType] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [unlockModalItem, setUnlockModalItem] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      try {
        setError("");
        const response = await getMasterClasses(
  MASTERCLASS_MODULE_ID
);
        if (active && response.length) {
          setItems(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load master classes.");
          setItems(fallbackMasterClasses);
        }
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const nextVideoType = params.get("videoType");
    const nextSortBy = params.get("sortBy");

    if (nextVideoType) setVideoType(nextVideoType);
    if (nextSortBy) setSortBy(nextSortBy);
  }, [params]);

  const filtered = useMemo(
    () =>
      [...items]
        .filter((item) => videoType === "All" || item.videoType === videoType)
        .sort((a, b) => {
          if (sortBy === "az") return a.title.localeCompare(b.title);
          if (sortBy === "za") return b.title.localeCompare(a.title);
          return b.views - a.views;
        }),
    [items, sortBy, videoType]
  );

  const videoTypeOptions = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.videoType)))],
    [items]
  );

  function buildLearnReturnTo(itemTitle = "") {
    const nextParams = new URLSearchParams();
    if (videoType !== "All") nextParams.set("videoType", videoType);
    if (sortBy !== "popular") nextParams.set("sortBy", sortBy);
    if (itemTitle) nextParams.set("video", itemTitle);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  return (
    <ModuleScreen className="space-y-5 pb-8">
      {error ? <Alert type="warning" message={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#1a0a09]">Filter By</p>
          <div className="flex flex-wrap gap-2">
            {videoTypeOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setVideoType(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  videoType === item ? "bg-[#9a2119] text-white" : "bg-[#faf4f2] text-[#7b605c]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <p className="m-0 shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#1a0a09]">Sort</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Most Popular", value: "popular" },
              { label: "A-Z", value: "az" },
              { label: "Z-A", value: "za" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setSortBy(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  sortBy === item.value ? "bg-[#9a2119] text-white" : "bg-[#faf4f2] text-[#7b605c]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-[#f0e4e2] bg-white p-5 text-sm text-muted">
            No master classes available right now.
          </div>
        ) : null}

        {filtered.map((item) => {
  const detailUnlocked =
  unlocked ||
  item.isFree;

          return (
            <MasterClassCard
              key={item.id || item.title}
              item={item}
              unlocked={unlocked}
              detailUnlocked={detailUnlocked}
onWatch={() => {

  if (item.locked) {
    setUnlockModalItem(item.title);
    return;
  }

  if (item.url !== "#") {
    window.open(
      item.url,
      "_blank",
      "noopener,noreferrer"
    );
  }
}}
            />
          );
        })}
      </div>

      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Master Classes"
        itemLabel={unlockModalItem}
        description="Your free master class access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildLearnReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />
    </ModuleScreen>
  );
}
