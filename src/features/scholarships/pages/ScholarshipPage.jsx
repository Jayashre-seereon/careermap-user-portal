import { useEffect, useState } from "react";
import { Button, Tabs } from "antd";
import {
  ClockCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  ArrowRightOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { scholarships } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import {
  PremiumGate,
  UnlockRedirectModal,
  usePortalNavigation,
} from "../../portal/components/portalPageShared";

export default function ScholarshipPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const unlocked = isUnlocked("scholarship");
  const filtered = scholarships.filter(
    (item) => activeStatus === "All" || item.status === activeStatus
  );

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
      const matched = scholarships.find((item) => item.name === itemName);
      if (matched) setSelectedItem(matched);
    }
  }, [params]);

  /* ── DETAIL VIEW ── */
  if (selectedItem) {
    const detailUnlocked = unlocked || canAccessFreeDetail("scholarship", selectedItem.name);
    const isActive = selectedItem.status === "Active";

    return (
      <ModuleScreen className="space-y-4">
        <PageHero backOnly onBack={() => setSelectedItem(null)} />
        <div className="content-stagger space-y-4">
          {!unlocked && !detailUnlocked ? (
            <PremiumGate
              title="Unlock Scholarships"
              description="Subscribe to more scholarship details, requirements, and application links."
              returnTo={buildScholarshipReturnTo()}
            />
          ) : null}

          {/* Overview card */}
          <div className="bg-white rounded-[26px] border border-[#f0e4e2] overflow-hidden shadow-sm">
            <div className={`h-1 ${isActive ? "bg-[#9a2119]" : "bg-gray-200"}`} />
            <div className="p-6 space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-black text-[#1a0a09] leading-snug m-0">
                    {selectedItem.name}
                  </h2>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#b8837e] mt-1 mb-0">
                    {selectedItem.provider}
                  </p>
                </div>
                <span
                  className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-full px-3 py-1 ${
                    isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isActive ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
                  {selectedItem.status}
                </span>
              </div>

              <div className="h-px bg-[#f0e4e2]" />

              <p className="text-sm text-gray-500 leading-7 m-0">
                {selectedItem.description}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#f5e4df] bg-[#fff8f6] px-4 py-4">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">
                    <DollarOutlined className="text-[#9a2119]" /> Amount
                  </p>
                  <p className="text-2xl font-black text-[#9a2119] m-0">{selectedItem.amount}</p>
                </div>
                <div className="rounded-2xl border border-[#f5e4df] bg-[#fff8f6] px-4 py-4">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">
                    <CalendarOutlined className="text-[#9a2119]" /> Deadline
                  </p>
                  <p className="text-sm font-semibold text-[#1a0a09] m-0">{selectedItem.deadline}</p>
                </div>
                <div className="rounded-2xl border border-[#f5e4df] bg-[#fff8f6] px-4 py-4 sm:col-span-2">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">
                    <TeamOutlined className="text-[#9a2119]" /> Eligibility
                  </p>
                  <p className="text-sm font-medium leading-7 text-[#1a0a09] m-0">{selectedItem.eligibility}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[26px] border border-[#f0e4e2] overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0e4e2]">
              <FileTextOutlined className="text-[#9a2119] text-sm" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09] m-0">
                Requirements
              </h3>
            </div>
            <div className="px-5 py-3">
              {selectedItem.requirements.map((req, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-3 ${
                    i < selectedItem.requirements.length - 1 ? "border-b border-[#fdf0ee]" : ""
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9a2119] mt-2 shrink-0" />
                  <p className="text-sm text-gray-600 leading-7 m-0">{req}</p>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="primary"
            href={selectedItem.link}
            target="_blank"
            block
            icon={<ArrowRightOutlined />}
            className="!mt-1 !h-12 !rounded-xl !bg-[#9a2119] !border-[#9a2119] !font-semibold !text-sm hover:!bg-[#7a1a13]"
          >
            Apply Now
          </Button>
        </div>
      </ModuleScreen>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <ModuleScreen className="space-y-4">
      <PageHero backOnly onBack={goToDashboard} />

      <div>
        <h1 className="text-2xl font-black text-[#1a0a09] m-0">Scholarships</h1>
        <p className="text-xs text-[#b8837e] mt-1">{filtered.length} opportunities found</p>
      </div>

      <Tabs
        activeKey={activeStatus}
        onChange={setActiveStatus}
        items={["All", "Active", "Expired"].map((key) => ({ key, label: key }))}
        className="[&_.ant-tabs-tab]:font-semibold [&_.ant-tabs-tab]:text-xs [&_.ant-tabs-tab]:uppercase [&_.ant-tabs-tab]:tracking-widest [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-[#9a2119] [&_.ant-tabs-ink-bar]:!bg-[#9a2119] [&_.ant-tabs-nav::before]:!border-[#f0e4e2]"
      />

      {/* Equal-size card grid */}
      <div className="content-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const itemFree = unlocked || canAccessFreeDetail("scholarship", item.name);
          const isActive = item.status === "Active";

          return (
            <div
              key={item.name}
              onClick={() => {
                if (!unlocked && !itemFree) { setUnlockModalItem(item.name); return; }
                openScholarship(item);
              }}
              className={`group overflow-hidden rounded-[24px] border bg-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10 ${
                isActive ? "border-[#f0e4e2] hover:border-[#9a2119]" : "border-gray-100 hover:border-[#9a2119]"
              }`}
            >
              <div className={`h-[3px] w-full ${isActive ? "bg-[#9a2119]" : "bg-gray-200 group-hover:bg-[#9a2119]"} transition-colors`} />

              <div className="flex h-full flex-col gap-4 px-5 pb-5 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fdf0ee] text-lg text-[#9a2119] transition-colors group-hover:bg-[#9a2119] group-hover:text-white">
                      <DollarOutlined />
                    </div>
                    <p className="m-0 text-[16px] font-black leading-snug text-[#1a0a09] transition-colors group-hover:text-[#9a2119] line-clamp-2">
                      {item.name}
                    </p>
                    <p className="mt-2 mb-0 text-[11px] font-semibold uppercase tracking-widest text-[#b8837e]">
                      {item.provider}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isActive ? <CheckCircleOutlined /> : <MinusCircleOutlined />}
                      {item.status}
                    </span>
                    {!unlocked && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          itemFree ? "bg-green-100 text-green-700" : "bg-[#fdf0ee] text-[#9a2119]"
                        }`}
                      >
                        {itemFree ? <UnlockOutlined /> : <LockOutlined />}
                        {itemFree ? "Free" : "Locked"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto space-y-3 border-t border-[#f0e4e2] pt-3">
                  <div className="flex items-center gap-2 text-sm font-black text-[#9a2119]">
                    <DollarOutlined />
                    <span>{item.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6c67]">
                    <CalendarOutlined className="text-[#9a2119]" />
                    <span>{item.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-[#8c6c67]">
                      Tap to view details
                    </span>
                    <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
                      Explore <ArrowRightOutlined />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
