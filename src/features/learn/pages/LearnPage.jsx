import { useEffect, useState } from "react";
import { LockOutlined, PlayCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Button, Select, Space } from "antd";
import { useSearchParams } from "react-router-dom";
import { masterClasses } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function LearnPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("master-class");
  
  const [videoType, setVideoType] = useState("All");
  const [career, setCareer] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [unlockModalItem, setUnlockModalItem] = useState(null);

  const filtered = [...masterClasses]
    .filter((item) => videoType === "All" || item.videoType === videoType)
    .filter((item) => career === "All" || item.career === career)
    .sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return b.views - a.views;
    });

  function buildLearnReturnTo(itemTitle = "") {
    const nextParams = new URLSearchParams();
    if (videoType !== "All") nextParams.set("videoType", videoType);
    if (career !== "All") nextParams.set("career", career);
    if (sortBy !== "popular") nextParams.set("sortBy", sortBy);
    if (itemTitle) nextParams.set("video", itemTitle);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    const nextVideoType = params.get("videoType");
    const nextCareer = params.get("career");
    const nextSortBy = params.get("sortBy");
    if (nextVideoType) setVideoType(nextVideoType);
    if (nextCareer) setCareer(nextCareer);
    if (nextSortBy) setSortBy(nextSortBy);
  }, [params]);

  return (
    <ModuleScreen className="space-y-5">
      <PageHero backOnly onBack={goToDashboard} />

      <div>
        <h1 className="m-0 text-2xl font-black text-[#1a0a09]">Master Classes</h1>
        <p className="mt-1 mb-0 text-xs text-[#b8837e]">Explore expert sessions, career videos, and guided learning content.</p>
      </div>

      <div className="rounded-2xl border border-[#eedad4] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_minmax(160px,180px)] md:items-center">
          <p className="m-0 text-[10px] font-bold uppercase tracking-widest text-[#1a0a09]">
            Filter By
          </p>
          <Select
            value={videoType}
            onChange={setVideoType}
            className="w-full"
            options={["All", "Expert Videos", "Career Videos"].map((item) => ({ label: item, value: item }))}
          />
          <Select
            value={career}
            onChange={setCareer}
            className="w-full"
            options={["All", ...Array.from(new Set(masterClasses.map((item) => item.career)))].map((item) => ({ label: item, value: item }))}
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            className="w-full"
            options={[
              { label: "Most Popular", value: "popular" },
              { label: "A-Z", value: "az" },
              { label: "Z-A", value: "za" }
            ]}
          />
        </div>
      </div>

      <div className="content-stagger grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((item) => {
          const detailUnlocked = unlocked || canAccessFreeDetail("master-class", item.title);
          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[24px] border border-[#f0e4e2] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
            >
              <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#f0e4e2] transition-colors group-hover:bg-[#9a2119]" />

              {!unlocked ? (
                <div className="absolute right-4 top-4 z-10">
                  <SoftTag color={detailUnlocked ? "green" : "default"}>
                    {detailUnlocked ? "FREE" : "LOCK"}
                  </SoftTag>
                </div>
              ) : null}

              <div className="flex h-full flex-col gap-4 pt-2">
                <div className="flex items-start justify-between gap-3 pr-14">
                  <div className="min-w-0 flex-1">
                    <div className="text-lg font-black leading-tight text-ink">{item.title}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#b8837e]">{item.mentor}</div>
                  </div>
                  {!unlocked && !detailUnlocked ? (
                    <LockOutlined className="text-brand text-lg" />
                  ) : (
                    <PlayCircleOutlined className="text-brand text-lg" />
                  )}
                </div>

                <Space wrap>
                  <SoftTag color="red">{item.career}</SoftTag>
                  <SoftTag color="blue">{item.duration}</SoftTag>
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
