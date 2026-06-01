import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Space } from "antd";
import { ArrowRightOutlined, LockOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { getMasterClasses } from "../../../api/masterclassApi";
import { masterClasses as fallbackMasterClasses } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

function formatViews(views) {
  if (!views) {
    return "New class";
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
          <div
            className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px]"
            style={{ backgroundColor: heroTone }}
          >
            <TextBadge locked={locked} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-extrabold leading-[21px] text-ink">{item.title}</div>
                <div className="mt-1 truncate text-[12px] text-muted">{item.mentor}</div>
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff6f2] text-brand">
                {locked ? <LockOutlined /> : <PlayCircleOutlined />}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SoftTag color="red">{item.career}</SoftTag>
              <SoftTag color="gold">{formatViews(item.views)}</SoftTag>
              <SoftTag color="default">{item.videoType}</SoftTag>
            </div>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[18px] border border-[#f4e3df] bg-[#fff9f7] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8837e]">
              Duration
            </div>
            <div className="mt-2 text-[13px] font-semibold text-ink">{item.duration}</div>
          </div>
          <div className="rounded-[18px] border border-[#f4e3df] bg-[#fff9f7] p-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8837e]">
              Access
            </div>
            <div className="mt-2 text-[13px] font-semibold text-ink">
              {locked ? (detailUnlocked ? "One free preview" : "Locked for now") : "Open access"}
            </div>
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
          <span className="text-xs font-semibold text-[#8c6c67]">Tap to watch details</span>
          <Button
            type="link"
            className="!h-auto !p-0 !text-sm !font-bold !text-[#9a2119]"
            onClick={onWatch}
          >
            {locked && !detailUnlocked ? "Unlock More Classes" : "Watch Video"} <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
}

function TextBadge({ locked }) {
  return (
    <span className="text-[11px] font-extrabold tracking-[0.18em] text-brand-deep">
      {locked ? "LOCK" : "PLAY"}
    </span>
  );
}

export default function LearnPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("master-class");
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
        const response = await getMasterClasses();
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

      <div className="motion-item overflow-hidden rounded-[28px] border border-[#f0e4e2] bg-white shadow-sm">
        <div className="brand-gradient relative p-6 text-white md:p-8">
          <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold tracking-[0.28em] text-white/85">
            MASTER CLASS
          </div>
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/90">
              <PlayCircleOutlined />
              Learning Library
            </div>
            <h1 className="m-0 text-3xl font-extrabold text-white">Master Classes</h1>
            <p className="m-0 max-w-2xl text-sm leading-7 text-white/80">
              Explore expert sessions, career videos, and guided learning content.
            </p>
          </div>
        </div>
        <div className="grid gap-3 border-t border-[#f0e4e2] bg-[#fffaf8] px-6 py-4 md:grid-cols-3">
          <Metric label="Classes" value={String(filtered.length)} />
          <Metric label="Mode" value={videoType} />
          <Metric label="Sort" value={sortBy === "popular" ? "Most Popular" : sortBy.toUpperCase()} />
        </div>
      </div>

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

      <Space className="!flex !w-full !flex-col" size="middle">
        {filtered.length === 0 ? (
          <div className="rounded-[24px] border border-[#f0e4e2] bg-white p-5 text-sm text-muted">
            No master classes available right now.
          </div>
        ) : null}

        {filtered.map((item) => {
          const detailUnlocked = unlocked || canAccessFreeDetail("master-class", item.title);

          return (
            <MasterClassCard
              key={item.id || item.title}
              item={item}
              unlocked={unlocked}
              detailUnlocked={detailUnlocked}
              onWatch={() => {
                if (!unlocked && !detailUnlocked) {
                  setUnlockModalItem(item.title);
                  return;
                }

                if (item.locked) {
                  registerFreeDetailAccess("master-class", item.title);
                }

                if (item.url !== "#") {
                  window.open(item.url, "_blank", "noopener,noreferrer");
                }
              }}
            />
          );
        })}
      </Space>

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

function Metric({ label, value }) {
  return (
    <div className="rounded-[20px] border border-[#f4e3df] bg-white px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#b8837e]">{label}</div>
      <div className="mt-1 text-[14px] font-extrabold text-ink">{value}</div>
    </div>
  );
}
