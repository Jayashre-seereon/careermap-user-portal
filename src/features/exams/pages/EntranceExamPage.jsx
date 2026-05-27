import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Select } from "antd";
import {
  GlobalOutlined,
  CalendarOutlined,
  BankOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { getEntranceExams } from "../../../api/entranceExamApi";
import { entranceExams as fallbackEntranceExams } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function EntranceExamPage() {
  const { goToDashboard } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [items, setItems] = useState(fallbackEntranceExams);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadExams() {
      try {
        setError("");
        const response = await getEntranceExams();
        if (active && response.length) {
          setItems(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load entrance exams.");
        }
      }
    }

    loadExams();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) => typeFilter === "All" || item.type === typeFilter
      ),
    [items, typeFilter]
  );

  const typeOptions = useMemo(() => ["All", ...Array.from(new Set(items.map((item) => item.type).filter(Boolean)))], [items]);

  if (selected) {
    return (
      <ModuleScreen className="space-y-4">
        {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}
        <PageHero backOnly onBack={() => setSelected(null)} />

        <div className="motion-item rounded-r-2xl border border-[#f0e4e2] border-l-4 border-l-[#9a2119] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-2xl font-black leading-snug text-[#1a0a09]">{selected.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarOutlined className="text-xs text-[#9a2119]" />
                  {selected.date}
                </span>
                {selected.issueDate ? (
                  <span className="rounded-full bg-[#fdf0ee] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#9a2119]">
                    Issue Date: {selected.issueDate}
                  </span>
                ) : null}
                {selected.lastDate ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    Last Date: {selected.lastDate}
                  </span>
                ) : null}
              </div>
            </div>
            <Button type="primary" icon={<GlobalOutlined />} href={selected.website} target="_blank" className="!rounded-full !border-[#9a2119] !bg-[#9a2119] !text-sm !font-semibold hover:!bg-[#7a1a13]">
              Apply Now
            </Button>
          </div>
        </div>

        <div className="motion-item overflow-hidden rounded-2xl border border-[#f0e4e2] bg-white">
          <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
            <TrophyOutlined className="text-sm text-[#9a2119]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">Exam Snapshot</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Authority", value: selected.authority, icon: <BankOutlined /> },
              { label: "Eligibility", value: selected.eligibility, icon: <UserOutlined /> },
              { label: "Mode", value: selected.mode, icon: <FileTextOutlined /> },
              { label: "Duration", value: selected.duration, icon: <ClockCircleOutlined /> },
              { label: "Subjects", value: selected.subjects, icon: <BookOutlined /> },
              { label: "Total Marks", value: selected.totalMarks, icon: <CheckCircleOutlined /> },
            ].map((stat, index) => (
              <div key={index} className="border-r border-b border-[#f9f0ef] p-4">
                <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">
                  <span className="text-[#9a2119]">{stat.icon}</span>
                  {stat.label}
                </p>
                <p className="m-0 text-sm font-bold leading-snug text-[#1a0a09]">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="content-stagger grid grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
          <div className="motion-item flex flex-col overflow-hidden rounded-2xl border border-[#f0e4e2] bg-white">
            <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
              <FileTextOutlined className="text-sm text-[#9a2119]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">Exam Pattern</span>
            </div>
            <div className="flex-1 px-5 py-2">
              {selected.examPattern.map((item, index) => (
                <div key={index} className={`flex items-start gap-2.5 py-2.5 ${index < selected.examPattern.length - 1 ? "border-b border-[#fdf0ee]" : ""}`}>
                  <ArrowRightOutlined className="mt-1 shrink-0 text-[10px] text-[#9a2119]" />
                  <span className="text-sm leading-relaxed text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="motion-item flex flex-col overflow-hidden rounded-2xl border border-[#f0e4e2] bg-white">
            <div className="flex items-center gap-2 border-b border-[#f0e4e2] px-5 py-3">
              <BankOutlined className="text-sm text-[#9a2119]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">Top Participating Colleges</span>
            </div>
            <div className="flex flex-1 flex-wrap gap-2 p-5">
              {selected.topColleges.map((college, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 rounded-lg border border-[#f0e4e2] bg-[#fdf9f9] px-3 py-1.5 text-xs font-semibold text-[#1a0a09]">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" />
                  {college}
                </span>
              ))}
            </div>
          </div>
        </div>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-4">
      {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-black text-[#1a0a09]">Entrance Exams</h1>
          <p className="mt-1 text-xs text-[#b8837e]">{filtered.length} exams available across streams and authorities.</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="inline-flex items-center gap-0 rounded-full border border-[#f0e4e2] bg-white px-3 py-1">
            <Select variant="borderless" value={typeFilter} onChange={setTypeFilter} className="w-28 text-xs font-semibold" options={typeOptions.map((value) => ({ label: value, value }))} />
          </div>
          <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
        </div>
      </div>

      <div className="content-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <div
            key={item.id || item.name}
            onClick={() => setSelected(item)}
            className="group flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-[#f0e4e2] border-t-[3px] border-t-[#9a2119] bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10"
          >
            <p className="m-0 line-clamp-2 flex-1 text-[15px] font-bold leading-snug text-[#1a0a09] transition-colors group-hover:text-[#9a2119]">{item.name}</p>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <CalendarOutlined className="text-[11px] text-[#9a2119]" />
              Exam Date {item.date}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[#f0e4e2] pt-3">
              <span className="text-xs font-semibold text-[#8c6c67]">Tap to explore details</span>
              <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
                Explore <ArrowRightOutlined />
              </span>
            </div>
          </div>
        ))}
      </div>
    </ModuleScreen>
  );
}
