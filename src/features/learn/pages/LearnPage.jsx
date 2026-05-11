import { useEffect, useState } from "react";
import { LockOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { Button, Card, Col, List, Row, Select, Space } from "antd";
import { useSearchParams } from "react-router-dom";
import { masterClasses } from "../../../data/careermapData";
import { PageHero, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function LearnPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location } = usePortalNavigation();
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
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Select value={videoType} onChange={setVideoType} style={{ width: "100%" }} options={["All", "Expert Videos", "Career Videos"].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={8}><Select value={career} onChange={setCareer} style={{ width: "100%" }} options={["All", ...Array.from(new Set(masterClasses.map((item) => item.career)))].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={8}><Select value={sortBy} onChange={setSortBy} style={{ width: "100%" }} options={[{ label: "Most Popular", value: "popular" }, { label: "A-Z", value: "az" }, { label: "Z-A", value: "za" }]} /></Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, lg: 2 }}
        dataSource={filtered}
        renderItem={(item) => {
          const detailUnlocked = unlocked || canAccessFreeDetail("master-class", item.title);
          return (
            <List.Item>
              <Card className="!relative !h-full !border-[#eedad4]">
                {!unlocked ? (
                  <div className="absolute right-4 top-4 z-10">
                    <SoftTag color={detailUnlocked ? "green" : "default"}>{detailUnlocked ? "FREE" : "LOCK"}</SoftTag>
                  </div>
                ) : null}
                <Space direction="vertical" size="middle" className="!w-full !pr-24">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-ink">{item.title}</div>
                      <div className="mt-1 text-sm text-muted">{item.mentor}</div>
                    </div>
                    {!unlocked && !detailUnlocked ? <LockOutlined className="text-brand" /> : <PlayCircleOutlined className="text-brand" />}
                  </div>
                  <Space wrap>
                    <SoftTag color="red">{item.career}</SoftTag>
                    <SoftTag color="blue">{item.duration}</SoftTag>
                    <SoftTag color="gold">{(item.views / 1000).toFixed(1)}k views</SoftTag>
                  </Space>
                  {!unlocked && !detailUnlocked ? <Text>Your free master class preview has already been used.</Text> : null}
                  <Button
                    type="primary"
                    ghost={!unlocked && !detailUnlocked}
                    onClick={() => {
                      if (!unlocked && !detailUnlocked) {
                        setUnlockModalItem(item.title);
                        return;
                      }
                      registerFreeDetailAccess("master-class", item.title);
                      window.open(item.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {!unlocked ? (detailUnlocked ? "Watch 1 Free Class" : "Unlock More Classes") : "Watch Video"}
                  </Button>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
      {!unlocked ? <PremiumGate title="Unlock Master Class" description="Subscribe to more classes and keep learning without limits." returnTo={buildLearnReturnTo()} /> : null}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Master Class"
        itemLabel={unlockModalItem}
        description="Your free master class access has been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildLearnReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />
    </div>
  );
}
