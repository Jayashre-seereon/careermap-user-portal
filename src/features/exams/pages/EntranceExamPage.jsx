import { useState } from "react";
import { Button, Select } from "antd";
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
import { entranceExams } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function EntranceExamPage() {
  const { navigate, goToDashboard } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = entranceExams.filter(
    (item) =>
      (typeFilter === "All" || item.type === typeFilter) &&
      (catFilter === "All" || item.category === catFilter)
  );

  /* ── DETAIL VIEW ── */
  if (selected) {
    return (
      <ModuleScreen className="space-y-4">
        <PageHero backOnly onBack={() => setSelected(null)} />

        {/* Profile header */}
        <div className="motion-item bg-white rounded-r-2xl border border-[#f0e4e2] border-l-4 border-l-[#9a2119] p-5">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#1a0a09] leading-snug m-0">
                {selected.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <CalendarOutlined className="text-[#9a2119] text-xs" />
                  {selected.date}
                </span>
                <span className="w-px h-3 bg-[#f0e4e2]" />
                <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-[#fdf0ee] text-[#9a2119]">
                  {selected.type}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-amber-50 text-amber-800">
                  {selected.category}
                </span>
              </div>
            </div>
            <Button
              type="primary"
              icon={<GlobalOutlined />}
              href={selected.website}
              target="_blank"
              className="!rounded-full !bg-[#9a2119] !border-[#9a2119] !font-semibold !text-sm hover:!bg-[#7a1a13]"
            >
              Apply Now
            </Button>
          </div>
        </div>

        {/* Snapshot */}
        <div className="motion-item bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0e4e2]">
            <TrophyOutlined className="text-[#9a2119] text-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">
              Exam Snapshot
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Authority",   value: selected.authority,   icon: <BankOutlined />        },
              { label: "Eligibility", value: selected.eligibility, icon: <UserOutlined />        },
              { label: "Mode",        value: selected.mode,        icon: <FileTextOutlined />    },
              { label: "Duration",    value: selected.duration,    icon: <ClockCircleOutlined /> },
              { label: "Subjects",    value: selected.subjects,    icon: <BookOutlined />        },
              { label: "Total Marks", value: selected.totalMarks,  icon: <CheckCircleOutlined /> },
            ].map((stat, i) => (
              <div key={i} className="p-4 border-r border-b border-[#f9f0ef]">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e] mb-1">
                  <span className="text-[#9a2119]">{stat.icon}</span>
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-[#1a0a09] leading-snug m-0">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Pattern + Top Colleges — equal height */}
        <div className="content-stagger grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">

          {/* Exam Pattern */}
          <div className="motion-item bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0e4e2]">
              <FileTextOutlined className="text-[#9a2119] text-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">
                Exam Pattern
              </span>
            </div>
            <div className="px-5 py-2 flex-1">
              {selected.examPattern.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 py-2.5 ${
                    i < selected.examPattern.length - 1 ? "border-b border-[#fdf0ee]" : ""
                  }`}
                >
                  <ArrowRightOutlined className="text-[#9a2119] text-[10px] mt-1 shrink-0" />
                  <span className="text-sm text-gray-600 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Colleges */}
          <div className="motion-item bg-white rounded-2xl border border-[#f0e4e2] overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f0e4e2]">
              <BankOutlined className="text-[#9a2119] text-sm" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1a0a09]">
                Top Participating Colleges
              </span>
            </div>
            <div className="p-5 flex flex-wrap gap-2 flex-1">
              {selected.topColleges.map((college, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a0a09] bg-[#fdf9f9] border border-[#f0e4e2] rounded-lg px-3 py-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9a2119] shrink-0" />
                  {college}
                </span>
              ))}
            </div>
          </div>

        </div>
      </ModuleScreen>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <ModuleScreen className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1a0a09] m-0">Entrance Exams</h1>
          <p className="text-xs text-[#b8837e] mt-1">
            {filtered.length} exams available across streams and authorities.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="inline-flex items-center bg-white border border-[#f0e4e2] rounded-full px-3 py-1 gap-0">
            <Select
              variant="borderless"
              value={typeFilter}
              onChange={setTypeFilter}
              className="w-28 text-xs font-semibold"
              options={["All", "Central", "State", "Private"].map((v) => ({ label: v, value: v }))}
            />
            <span className="w-px h-4 bg-[#f0e4e2] shrink-0" />
            <Select
              variant="borderless"
              value={catFilter}
              onChange={setCatFilter}
              className="w-36 text-xs font-semibold"
              options={["All", "Engineering", "Medical", "Business", "Law", "Design"].map((v) => ({ label: v, value: v }))}
            />
          </div>
          <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
        </div>
      </div>

      {/* Equal-size card grid */}
      <div className="content-stagger grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => (
          <div
            key={item.name}
            onClick={() => setSelected(item)}
            className="group bg-white rounded-2xl border border-[#f0e4e2] border-t-[3px] border-t-[#9a2119] p-4 cursor-pointer flex flex-col gap-2.5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#9a2119]/10"
          >
            {/* authority row */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">
                {item.authority}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#9a2119] opacity-20 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* name */}
            <p className="text-[15px] font-bold text-[#1a0a09] leading-snug flex-1 m-0 group-hover:text-[#9a2119] transition-colors line-clamp-2">
              {item.name}
            </p>

            {/* date */}
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <CalendarOutlined className="text-[#9a2119] text-[11px]" />
              {item.date}
            </div>

            <div className="flex gap-1.5 pt-1">
              <span className="text-[10px] font-bold rounded-md px-2 py-0.5 bg-gray-100 text-gray-500">
                {item.type}
              </span>
              <span className="text-[10px] font-bold rounded-md px-2 py-0.5 bg-[#fdf0ee] text-[#9a2119]">
                {item.category}
              </span>
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
