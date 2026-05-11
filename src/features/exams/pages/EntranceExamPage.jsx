import { useState } from "react";
import { Button, Card, Col, List, Row, Select, Space } from "antd";
import { entranceExams } from "../../../data/careermapData";
import { PageHero, SectionCard, SoftTag, Text } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function EntranceExamPage() {
  const { navigate } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const filtered = entranceExams.filter((item) => (typeFilter === "All" || item.type === typeFilter) && (catFilter === "All" || item.category === catFilter));

  if (selected) {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelected(null)} />
        <SectionCard title="Exam Snapshot">
          <List
            dataSource={[
              ["Authority", selected.authority],
              ["Date", selected.date],
              ["Eligibility", selected.eligibility],
              ["Mode", selected.mode],
              ["Duration", selected.duration],
              ["Subjects", selected.subjects],
              ["Total Marks", selected.totalMarks],
            ]}
            renderItem={([label, value]) => (
              <List.Item>
                <span className="text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </List.Item>
            )}
          />
        </SectionCard>
        <SectionCard title="Exam Pattern"><List dataSource={selected.examPattern} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        <SectionCard title="Top Colleges"><List dataSource={selected.topColleges} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        <Button type="primary" href={selected.website} target="_blank">Official Website</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}><Select value={typeFilter} onChange={setTypeFilter} style={{ width: "100%" }} options={["All", "Central", "State", "Private"].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={12}><Select value={catFilter} onChange={setCatFilter} style={{ width: "100%" }} options={["All", "Engineering", "Medical", "Business", "Law", "Design", "General"].map((item) => ({ label: item, value: item }))} /></Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable className="!h-full !border-[#eedad4]" onClick={() => setSelected(item)}>
              <Space direction="vertical">
                <div className="text-lg font-black text-ink">{item.name}</div>
                <Text>{item.authority}</Text>
                <Text>{item.date}</Text>
                <Space wrap>
                  <SoftTag color="blue">{item.type}</SoftTag>
                  <SoftTag color="green">{item.category}</SoftTag>
                </Space>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
