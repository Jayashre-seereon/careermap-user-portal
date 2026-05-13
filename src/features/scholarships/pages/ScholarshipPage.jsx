import { useEffect, useState } from "react";
import { Button, List, Tabs } from "antd";
import { useSearchParams } from "react-router-dom";
import { scholarships } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

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
      <ModuleScreen className="space-y-4">
        <PageHero backOnly onBack={() => setSelectedItem(null)} />

        {!unlocked && !detailUnlocked ? (
          <PremiumGate
            title="Unlock Scholarships"
            description="Subscribe to more scholarship details, requirements, and application links."
            returnTo={buildScholarshipReturnTo()}
          />
        ) : null}

        {/* Overview */}
        <div className="bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#9a2119] to-rose-400" />
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#1a0a09] leading-snug">{selectedItem.name}</h2>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#b8837e] mt-1">{selectedItem.provider}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1 ${selectedItem.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                {selectedItem.status}
              </span>
            </div>

            <div className="h-px bg-[#f0e4e2]" />
            <p className="text-sm text-gray-500 leading-relaxed">{selectedItem.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">Amount</p>
                <p className="text-2xl font-black text-[#9a2119]">{selectedItem.amount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">Deadline</p>
                <p className="text-sm font-semibold text-[#1a0a09]">{selectedItem.deadline}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">Eligibility</p>
                <p className="text-sm font-medium text-[#1a0a09]">{selectedItem.eligibility}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl border border-[#f0e4e2] p-5">
          <h3 className="text-base font-bold text-[#1a0a09] mb-3">Requirements</h3>
          <div className="divide-y divide-[#fdf0ee]">
            {selectedItem.requirements.map((req, i) => (
              <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-[#9a2119] mt-1.5 shrink-0" />
                <p className="text-sm text-gray-600 leading-relaxed">{req}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          href={selectedItem.link}
          target="_blank"
          block
          className="!h-12 !rounded-xl !bg-[#9a2119] !border-[#9a2119] !font-semibold !text-sm hover:!bg-[#7a1a13] hover:!border-[#7a1a13]"
        >
          Apply Now →
        </Button>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-4">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div>
        <h1 className="text-2xl font-black text-[#1a0a09]">Scholarships</h1>
        <p className="text-xs text-[#b8837e] mt-1">{filtered.length} opportunities found</p>
      </div>

      <Tabs
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={["All", "Active", "Expired"].map((key) => ({ key, label: key }))}
        className="[&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab]:text-xs [&_.ant-tabs-tab]:uppercase [&_.ant-tabs-tab]:tracking-widest [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#9a2119] [&_.ant-tabs-ink-bar]:!bg-[#9a2119] [&_.ant-tabs-nav::before]:!border-[#f0e4e2]"
      />

      <List
        grid={{ gutter: 16, xs: 1, lg: 2 }}
        dataSource={filtered}
        renderItem={(item) => {
          const itemFree = unlocked || canAccessFreeDetail("scholarship", item.name);
          return (
            <List.Item className="!h-full">
              <div
                className="group bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden cursor-pointer h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#9a2119]/10 hover:border-[#9a2119]"
                onClick={() => {
                  if (!unlocked && !itemFree) { setUnlockModalItem(item.name); return; }
                  openScholarship(item);
                }}
              >
                <div className={`h-1 transition-all ${item.status === "Active" ? "bg-gradient-to-r from-[#9a2119] to-rose-400" : "bg-gray-200 group-hover:bg-gradient-to-r group-hover:from-[#9a2119] group-hover:to-rose-400"}`} />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#1a0a09] leading-snug">{item.name}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#b8837e] mt-0.5">{item.provider}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {item.status}
                      </span>
                      {!unlocked && (
                        <span className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${itemFree ? "bg-green-100 text-green-700" : "bg-[#fdf0ee] text-[#9a2119]"}`}>
                          {itemFree ? "FREE" : "🔒 LOCK"}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.eligibility}</p>

                  <div className="h-px bg-[#f0e4e2]" />

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-[#9a2119]">{item.amount}</span>
                    <span className="text-xs text-[#b8837e] font-medium">⏰ {item.deadline}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />

    </ModuleScreen>
  );
}
