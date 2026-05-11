import {
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  CreditCardOutlined,
  DownOutlined,
  AppstoreOutlined,
  FundProjectionScreenOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Divider, Drawer, Dropdown, Menu, Popover, Space, Typography } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { notifications } from "../../data/careermapData";
import { useAppState } from "../../state/AppStateContext";
import BrandMark from "../branding/BrandMark";

const previewNotifications = notifications.slice(0, 3);

const moduleItems = [
  { key: "/app/library", icon: <BookOutlined />, label: "Career Library" },
  { key: "/app/assessment", icon: <FundProjectionScreenOutlined />, label: "Career Assessment" },
  { key: "/app/learn", icon: <ReadOutlined />, label: "Master Class" },
  { key: "/app/entrance-exam", icon: <BulbOutlined />, label: "Entrance Exam" },
  { key: "/app/book-mentor", icon: <TeamOutlined />, label: "Book Mentor" },
  { key: "/app/scholarships", icon: <TrophyOutlined />, label: "Scholarships" },
  { key: "/app/institutes", icon: <AppstoreOutlined />, label: "Institutes" },
  { key: "/app/abroad", icon: <GlobalOutlined />, label: "Study Abroad" },
  { key: "/app/subscription", icon: <CreditCardOutlined />, label: "Plans" },
  { key: "/app/quiz", icon: <QuestionCircleOutlined />, label: "Quiz" },
];

export default function WebsiteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadNotificationsCount, userProfile, logout } = useAppState();

  const mobileMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={[
        { key: "/app/dashboard", icon: <HomeOutlined />, label: "Home" },
        ...moduleItems,
      ]}
      onClick={({ key }) => {
        setMobileOpen(false);
        navigate(key);
      }}
      className="!border-none !bg-transparent"
    />
  );

  const moduleMenu = {
    items: moduleItems.map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.label,
    })),
    selectedKeys: [location.pathname],
    onClick: ({ key }) => navigate(key),
  };

  const profileMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  const notificationOverlay = (
    <div className="w-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <Typography.Text className="!text-[15px] !font-semibold !text-ink">Notifications</Typography.Text>
        <Badge count={unreadNotificationsCount} size="small" />
      </div>

      <Space direction="vertical" size={10} className="!w-full">
        {previewNotifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border px-3 py-2 ${item.unread ? "border-[#f2d1c7] bg-[#fff7f4]" : "border-[#efe3de] bg-white"}`}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <Typography.Text className="!text-[13px] !font-semibold !text-ink">{item.title}</Typography.Text>
              {item.unread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#9a2119]" /> : null}
            </div>
            <Typography.Paragraph className="!mb-1 !text-[12px] !leading-5 !text-[#6f6570]">
              {item.message}
            </Typography.Paragraph>
            <Typography.Text className="!text-[11px] !text-[#9b8f97]">{item.time}</Typography.Text>
          </div>
        ))}
      </Space>

      <Divider className="!my-3" />

      <Button
        type="link"
        className="!h-auto !p-0 !font-semibold !text-brand"
        onClick={() => {
          setNotificationsOpen(false);
          navigate("/app/notifications");
        }}
      >
        View all
      </Button>
    </div>
  );

  return (
    <>
      <Drawer open={mobileOpen} width={320} onClose={() => setMobileOpen(false)} placement="left">
        <div className="space-y-5">
          <BrandMark />
          {mobileMenu}
          <div className="rounded-[18px] bg-[#f8f1ee] p-4">
            <Button type="primary" block onClick={() => navigate("/app/assessment")}>
              Start Test
            </Button>
          </div>
        </div>
      </Drawer>
      <header className="sticky top-0 z-30 border-b border-[#eaded9] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1160px] px-4 py-3 md:px-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 lg:gap-8">
              <Button
                className="!flex !h-10 !w-10 !items-center !justify-center !rounded-full !border-[#e7d8d2] !text-brand lg:!hidden"
                icon={<MenuOutlined />}
                onClick={() => setMobileOpen(true)}
              />
              <Link to="/app/dashboard" className="shrink-0">
                <BrandMark />
              </Link>
              <div className="hidden min-w-0 items-center gap-6 lg:flex">
                <Link
                  to="/app/dashboard"
                  className={`text-[15px] font-semibold transition-colors ${location.pathname === "/app/dashboard" ? "text-brand" : "text-ink hover:text-brand"}`}
                >
                  Home
                </Link>
                <Dropdown menu={moduleMenu} trigger={["click", "hover"]}>
                  <button
                    type="button"
                    className={`flex items-center gap-2 text-[15px] font-semibold transition-colors ${moduleItems.some((item) => item.key === location.pathname) ? "text-brand" : "text-ink hover:text-brand"}`}
                  >
                    Modules
                    <DownOutlined className="text-[12px]" />
                  </button>
                </Dropdown>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Popover
                trigger="click"
                placement="bottomRight"
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
                content={notificationOverlay}
              >
                <Badge count={unreadNotificationsCount} size="small">
                  <Button
                    className="!flex !h-10 !w-10 !items-center !justify-center !rounded-full !border-[#e7d8d2] !bg-[#fbf4f1] !text-brand hover:!border-[#d8b4ad] hover:!text-[#7f1913]"
                    icon={<BellOutlined />}
                  />
                </Badge>
              </Popover>
              <Dropdown
                menu={{
                  items: profileMenuItems,
                  onClick: ({ key }) => {
                    if (key === "profile") navigate("/app/profile");
                    if (key === "settings") navigate("/app/settings");
                    if (key === "logout") {
                      logout();
                      navigate("/auth-entry");
                    }
                  },
                }}
                trigger={["click"]}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-[#e7d8d2] bg-[#fbf4f1] px-2.5 py-1.5 text-left transition-colors hover:border-[#d8b4ad]"
                >
                  <Avatar size={34} icon={<UserOutlined />} style={{ backgroundColor: "#9a2119" }} />
                  <span className="hidden text-[15px] font-semibold text-ink md:inline">
                    {userProfile.name || "demo2026"}
                  </span>
                  <DownOutlined className="text-[12px] text-brand" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
