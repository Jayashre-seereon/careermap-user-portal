import { useState } from "react";
import { Button, Card, List, Space } from "antd";
import { institutes } from "../../../data/careermapData";
import { PageHero, SoftTag, Text, SectionCard } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function InstitutePage() {
  const { navigate } = usePortalNavigation();
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelected(null)} />
        <SectionCard title="About"><Text>{selected.about}</Text></SectionCard>
        <SectionCard title="Courses Offered"><Space wrap>{selected.courses.map((course) => <SoftTag key={course} color="blue">{course}</SoftTag>)}</Space></SectionCard>
        <Button type="primary" href={selected.website} target="_blank">Visit Official Website</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={institutes}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable className="!h-full !border-[#eedad4]" onClick={() => setSelected(item)}>
              <div className="space-y-3">
                <div className="text-lg font-black text-ink">{item.name}</div>
                <Text>{item.location}</Text>
                <Space wrap>
                  <SoftTag color="blue">{item.type}</SoftTag>
                  <SoftTag color="red">{item.rank}</SoftTag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
