import { useState } from "react";
import { Button, Card, Col, List, Row, Select, Space, Tag, Divider } from "antd";
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
  ArrowRightOutlined
} from "@ant-design/icons";
import { entranceExams } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SectionCard, SoftTag, Text } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const PRIMARY_COLOR = "#9a2119";

export default function EntranceExamPage() {
  const { navigate } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = entranceExams.filter(
    (item) =>
      (typeFilter === "All" || item.type === typeFilter) &&
      (catFilter === "All" || item.category === catFilter)
  );

  if (selected) {
    return (
      <ModuleScreen className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <PageHero backOnly onBack={() => setSelected(null)} />
        
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-[6px]" style={{ borderColor: PRIMARY_COLOR }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-ink mb-1">{selected.name}</h1>
              <Space split={<Divider type="vertical" />} wrap className="justify-center md:justify-start">
                <span className="text-muted font-bold flex items-center"><CalendarOutlined className="mr-2" style={{color: PRIMARY_COLOR}} />{selected.date}</span>
                <SoftTag color="red">{selected.type}</SoftTag>
                <SoftTag color="orange">{selected.category}</SoftTag>
              </Space>
            </div>
            <Button 
              type="primary" 
              size="large"
              icon={<GlobalOutlined />}
              className="rounded-full px-8 shadow-lg hover:scale-105 transition-transform"
              style={{ backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
              href={selected.website} 
              target="_blank"
            >
              Apply Now
            </Button>
          </div>
        </div>

        {/* ROW 1: COMPACT SNAPSHOT (One Row Layout) */}
        <Card className="!rounded-2xl !border-none shadow-sm overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center gap-2">
            <TrophyOutlined style={{ color: PRIMARY_COLOR }} />
            <span className="font-black text-xs uppercase tracking-widest text-ink">Exam Snapshot</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                { label: "Authority", value: selected.authority, icon: <BankOutlined /> },
                { label: "Eligibility", value: selected.eligibility, icon: <UserOutlined /> },
                { label: "Mode", value: selected.mode, icon: <FileTextOutlined /> },
                { label: "Duration", value: selected.duration, icon: <ClockCircleOutlined /> },
                { label: "Subjects", value: selected.subjects, icon: <BookOutlined /> },
                { label: "Total Marks", value: selected.totalMarks, icon: <CheckCircleOutlined /> },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase font-bold text-muted tracking-tighter flex items-center gap-1">
                    {stat.icon} {stat.label}
                  </span>
                  <span className="text-sm font-black text-ink break-words leading-tight">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* ROW 2: EQUAL HEIGHT CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Exam Pattern */}
          <Card 
            title={<span className="flex items-center gap-2"><FileTextOutlined style={{color: PRIMARY_COLOR}}/> Exam Pattern</span>}
            className="!rounded-2xl !border-none shadow-sm flex flex-col h-full"
            bodyStyle={{ flex: 1 }}
          >
            <List 
              dataSource={selected.examPattern} 
              renderItem={(item) => (
                <List.Item className="!px-0 !border-gray-50">
                  <div className="flex items-start gap-3">
                    <ArrowRightOutlined className="mt-1 text-xs" style={{ color: PRIMARY_COLOR }} />
                    <span className="text-ink font-medium">{item}</span>
                  </div>
                </List.Item>
              )} 
            />
          </Card>

          {/* Participating Colleges */}
          <Card 
             title={<span className="flex items-center gap-2"><BankOutlined style={{color: PRIMARY_COLOR}}/> Top Participating Colleges</span>}
             className="!rounded-2xl !border-none shadow-sm flex flex-col h-full"
             bodyStyle={{ flex: 1 }}
          >
            <div className="flex flex-wrap gap-2">
              {selected.topColleges.map((college, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-ink text-sm font-bold flex items-center gap-2 hover:border-[#9a211950] transition-colors">
                   <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIMARY_COLOR }} />
                   {college}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ModuleScreen>
    );
  }

  // --- Main List View Remains Clean ---
  return (
    <ModuleScreen className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <PageHero backOnly onBack={() => navigate(-1)} className="!p-0" />
        <Space className="bg-white p-1 rounded-full shadow-sm border border-gray-100 px-4">
          <Select 
            variant="borderless" 
            className="w-28 font-bold text-xs" 
            value={typeFilter} 
            onChange={setTypeFilter} 
            options={["All", "Central", "State", "Private"].map(v => ({label: v, value: v}))} 
          />
          <Divider type="vertical" />
          <Select 
            variant="borderless" 
            className="w-36 font-bold text-xs" 
            value={catFilter} 
            onChange={setCatFilter} 
            options={["All", "Engineering", "Medical", "Business", "Law", "Design"].map(v => ({label: v, value: v}))} 
          />
        </Space>
      </div>

      <div>
        <h1>Entrance Exams</h1>
        <p className="mt-1">{filtered.length} exams available across streams and authorities.</p>
      </div>

      <List
        grid={{ gutter: 20, xs: 1, sm: 2, lg: 3 }}
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item>
            <Card 
              hoverable 
              className="!rounded-2xl !border-none shadow-sm hover:shadow-md transition-all group"
              onClick={() => setSelected(item)}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{item.authority}</span>
                   <div className="w-8 h-1 rounded-full opacity-20 group-hover:opacity-100 transition-opacity" style={{backgroundColor: PRIMARY_COLOR}} />
                </div>
                <h3 className="text-xl font-black text-ink group-hover:text-[#9a2119] transition-colors line-clamp-1">{item.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-muted">
                  <CalendarOutlined style={{color: PRIMARY_COLOR}} /> {item.date}
                </div>
                <Space size={4}>
                  <Tag bordered={false} className="!bg-gray-100 !text-gray-500 font-bold !m-0 !text-[10px]">{item.type}</Tag>
                  <Tag bordered={false} style={{backgroundColor: `${PRIMARY_COLOR}10`, color: PRIMARY_COLOR}} className="font-bold !m-0 !text-[10px]">{item.category}</Tag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </ModuleScreen>
  );
}
