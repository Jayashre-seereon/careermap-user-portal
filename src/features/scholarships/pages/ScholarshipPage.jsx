import { useEffect, useState } from "react";
import { Button, Card, List, Space, Tabs, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { scholarships } from "../../../data/careermapData";
import { PageHero, SectionCard, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

export default function ScholarshipPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const [params] = useSearchParams();
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const unlocked = isUnlocked("scholarship");
  const filtered = scholarships.filter((item) => activeStatus === "All" || item.status === activeStatus);

  function buildScholarshipReturnTo(itemName = selectedItem?.name) {
    const nextParams = new URLSearchParams();
    if (activeStatus !== "All") nextParams.set("status", activeStatus);
    if (itemName) nextParams.set("item", itemName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  function openScholarship(item) {
    registerFreeDetailAccess("scholarship", item.name);
    setSelectedItem(item);
  }

  useEffect(() => {
    const status = params.get("status");
    const itemName = params.get("item");
    if (status) setActiveStatus(status);
    if (itemName) {
      const matched = scholarships.find((item) => item.name === itemName);
      if (matched) setSelectedItem(matched);
    }
  }, [params]);

  if (selectedItem) {
    const detailUnlocked = unlocked || canAccessFreeDetail("scholarship", selectedItem.name);
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelectedItem(null)} />
        {!unlocked && !detailUnlocked ? <PremiumGate title="Unlock Scholarships" description="Subscribe to more scholarship details, requirements, and application links." returnTo={buildScholarshipReturnTo()} /> : null}
        <SectionCard title="Overview">
          <Space direction="vertical">
            <SoftTag color={selectedItem.status === "Active" ? "green" : "default"}>{selectedItem.status}</SoftTag>
            <Text>{selectedItem.description}</Text>
            <Text>Amount: {selectedItem.amount}</Text>
            <Text>Deadline: {selectedItem.deadline}</Text>
            <Text>Eligibility: {selectedItem.eligibility}</Text>
          </Space>
        </SectionCard>
        <SectionCard title="Requirements">
          <List dataSource={selectedItem.requirements} renderItem={(item) => <List.Item>{item}</List.Item>} />
        </SectionCard>
        <Button type="primary" href={selectedItem.link} target="_blank">Apply Now</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Tabs activeKey={activeStatus} onChange={setActiveStatus} items={["All", "Active", "Expired"].map((key) => ({ key, label: key }))} />
      <List
        grid={{ gutter: 16, xs: 1, lg: 2 }}
        dataSource={filtered}
        renderItem={(item) => {
          const itemFree = unlocked || canAccessFreeDetail("scholarship", item.name);
          return (
            <List.Item>
              <Card
                hoverable
                className="!relative !h-full !border-[#eedad4]"
                onClick={() => {
                  if (!unlocked && !itemFree) {
                    setUnlockModalItem(item.name);
                    return;
                  }
                  openScholarship(item);
                }}
              >
                {!unlocked ? (
                  <div className="absolute right-4 top-4 z-10">
                    <SoftTag color={itemFree ? "green" : "default"}>{itemFree ? "FREE" : "LOCK"}</SoftTag>
                  </div>
                ) : null}
                <div className="space-y-3 pr-24">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-ink">{item.name}</div>
                      <div className="text-sm text-muted">{item.provider}</div>
                    </div>
                    <SoftTag color={item.status === "Active" ? "green" : "default"}>{item.status}</SoftTag>
                  </div>
                  <Text>{item.eligibility}</Text>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-success">{item.amount}</span>
                    <span className="text-sm text-muted">{item.deadline}</span>
                  </div>
                </div>
              </Card>
            </List.Item>
          );
        }}
      />
      {!unlocked ? <PremiumGate title="Unlock Scholarships" description="Subscribe to more scholarship details, requirements, and application links." returnTo={buildScholarshipReturnTo()} /> : null}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Scholarships"
        itemLabel={unlockModalItem}
        description="Your free scholarship access has been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildScholarshipReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />
    </div>
  );
}
