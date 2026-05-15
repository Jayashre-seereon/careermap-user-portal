import { Card, List, Space } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { notifications } from "../../../data/careermapData";
import { ModuleScreen, PageHero, Text } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function NotificationsPage() {
  const { navigate } = usePortalNavigation();

  return (
    <ModuleScreen className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <div>
        <h1>Notifications</h1>
        <p className="mt-1">Stay updated with alerts, reminders, and activity from your portal.</p>
      </div>
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <Card className={`!h-full !border-[#eedad4] ${item.unread ? "!bg-[#fff8f4]" : ""}`}>
              <Space direction="vertical" size="small">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-black text-ink">{item.title}</div>
                  {item.unread ? <BellOutlined className="text-brand" /> : null}
                </div>
                <Text>{item.message}</Text>
                <Text className="!text-brand">{item.time}</Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </ModuleScreen>
  );
}
