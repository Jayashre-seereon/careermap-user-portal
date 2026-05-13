import { useEffect, useState } from "react";
import { LockOutlined, PlayCircleOutlined, ControlOutlined } from "@ant-design/icons";
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
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <PageHero backOnly onBack={() => navigate(-1)} />

      {/* COMPACT TOP FILTER TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border border-[#eedad4] shadow-sm">
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} lg={16}>
            <Space wrap size="middle">
              <div className="flex items-center gap-2 mr-2">
                <ControlOutlined className="text-brand" />
                <span className="font-bold text-ink uppercase text-[10px] tracking-widest">Filter By</span>
              </div>
              <Select 
                value={videoType} 
                onChange={setVideoType} 
                size="small"
                style={{ width: 140 }} 
                options={["All", "Expert Videos", "Career Videos"].map((item) => ({ label: item, value: item }))} 
              />
              <Select 
                value={career} 
                onChange={setCareer} 
                size="small"
                style={{ width: 160 }} 
                options={["All", ...Array.from(new Set(masterClasses.map((item) => item.career)))].map((item) => ({ label: item, value: item }))} 
              />
            </Space>
          </Col>
          
          <Col xs={24} lg={8} className="flex lg:justify-end items-center gap-3">
             <span className="text-[10px] text-muted uppercase font-bold tracking-widest">Sort:</span>
             <Select 
                value={sortBy} 
                onChange={setSortBy} 
                size="small"
                style={{ width: 130 }} 
                options={[
                    { label: "Most Popular", value: "popular" }, 
                    { label: "A-Z", value: "az" }, 
                    { label: "Z-A", value: "za" }
                ]} 
              />
          </Col>
        </Row>
      </div>

      {/* CARDS GRID */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, lg: 2, xl: 2 }}
        dataSource={filtered}
        renderItem={(item) => {
          const detailUnlocked = unlocked || canAccessFreeDetail("master-class", item.title);
          return (
            <List.Item className="h-full">
              <Card className="!relative !h-full !border-[#eedad4] !rounded-xl shadow-sm hover:shadow-md transition-shadow">
                {!unlocked ? (
                  <div className="absolute right-4 top-4 z-10">
                    <SoftTag color={detailUnlocked ? "green" : "default"}>
                        {detailUnlocked ? "FREE" : "LOCK"}
                    </SoftTag>
                  </div>
                ) : null}
                
                <Space direction="vertical" size="middle" className="!w-full !pr-16">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-ink leading-tight">{item.title}</div>
                      <div className="mt-1 text-sm text-muted font-medium">{item.mentor}</div>
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

                  <Button
                    type="primary"
                    block
                    ghost={!unlocked && !detailUnlocked}
                    className="!rounded-lg font-bold mt-2"
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

    
    </div>
  );
}