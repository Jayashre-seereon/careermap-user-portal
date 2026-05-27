import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Space } from "antd";
import { LockOutlined, PlayCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { getMasterClasses } from "../../../api/masterclassApi";
import { masterClasses } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function LearnPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("master-class");
  const [items, setItems] = useState(masterClasses);
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
        }
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, []);

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

  function buildLearnReturnTo(itemTitle = "") {
    const nextParams = new URLSearchParams();
    if (videoType !== "All") nextParams.set("videoType", videoType);
    if (sortBy !== "popular") nextParams.set("sortBy", sortBy);
    if (itemTitle) nextParams.set("video", itemTitle);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    const nextVideoType = params.get("videoType");
    const nextSortBy = params.get("sortBy");
    if (nextVideoType) setVideoType(nextVideoType);
    if (nextSortBy) setSortBy(nextSortBy);
  }, [params]);

  const videoTypeOptions = useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.videoType)))],
    [items]
  );

  return (
    <ModuleScreen className="space-y-5">
      {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-black text-[#1a0a09]">Master Classes</h1>
          <p className="mt-1 mb-0 text-xs text-[#b8837e]">Explore expert sessions, career videos, and guided learning content.</p>
        </div>
        <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
      </div>

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

      <div className="content-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const detailUnlocked = unlocked || canAccessFreeDetail("master-class", item.title);
          return (
            <div
              key={item.id || item.title}
              className="group relative overflow-hidden rounded-[24px] border border-[#f0e4e2] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
            >
              <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#f0e4e2] transition-colors group-hover:bg-[#9a2119]" />

              {!unlocked ? (
                <div className="absolute right-4 top-4 z-10">
                  <SoftTag color={detailUnlocked ? "green" : "default"}>{detailUnlocked ? "FREE" : "LOCK"}</SoftTag>
                </div>
              ) : null}

              <div className="flex h-full flex-col gap-4 pt-2">
                <div className="flex items-start justify-between gap-3 pr-14">
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-black leading-tight text-ink">{item.title}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#b8837e]">{item.mentor}</div>
                  </div>
                  {!unlocked && !detailUnlocked ? <LockOutlined className="text-brand text-lg" /> : <PlayCircleOutlined className="text-brand text-lg" />}
                </div>

                <Space wrap>
                  <SoftTag color="red">{item.career}</SoftTag>
                  <SoftTag color="gold">{(item.views / 1000).toFixed(1)}k views</SoftTag>
                </Space>

                <div className="mt-auto flex items-center justify-between border-t border-[#f0e4e2] pt-3">
                  <span className="text-xs font-semibold text-[#8c6c67]">Tap to watch details</span>
                  <Button
                    type="link"
                    className="!h-auto !p-0 !text-sm !font-bold !text-[#9a2119]"
                    onClick={() => {
                      if (!unlocked && !detailUnlocked) {
                        setUnlockModalItem(item.title);
                        return;
                      }
                      registerFreeDetailAccess("master-class", item.title);
                      window.open(item.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    Explore <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </div>
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
