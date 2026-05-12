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
  { key: "/app/library",       icon: <BookOutlined />,                    label: "Career Library"   },
  { key: "/app/assessment",    icon: <FundProjectionScreenOutlined />,    label: "Career Assessment"},
  { key: "/app/learn",         icon: <ReadOutlined />,                    label: "Master Class"     },
  { key: "/app/entrance-exam", icon: <BulbOutlined />,                    label: "Entrance Exam"    },
  { key: "/app/book-mentor",   icon: <TeamOutlined />,                    label: "Book Mentor"      },
  { key: "/app/scholarships",  icon: <TrophyOutlined />,                  label: "Scholarships"     },
  { key: "/app/institutes",    icon: <AppstoreOutlined />,                label: "Institutes"       },
  { key: "/app/abroad",        icon: <GlobalOutlined />,                  label: "Study Abroad"     },
  { key: "/app/subscription",  icon: <CreditCardOutlined />,              label: "Subscriptions"    },
  { key: "/app/quiz",          icon: <QuestionCircleOutlined />,          label: "Quiz"             },
];

export default function WebsiteNavbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen]           = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { unreadNotificationsCount, userProfile, logout } = useAppState();

  /* ── mobile drawer menu ─────────────────────────────────────── */
  const mobileMenu = (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      items={[
        { key: "/app/dashboard", icon: <HomeOutlined />, label: "Home" },
        ...moduleItems,
      ]}
      onClick={({ key }) => { setMobileOpen(false); navigate(key); }}
      className="!border-none !bg-transparent"
    />
  );

  /* ── modules dropdown (2-column grid) ───────────────────────── */
  const moduleMenu = {
    items: moduleItems.map((item) => ({ key: item.key, icon: item.icon, label: item.label })),
    selectedKeys: [location.pathname],
    onClick: ({ key }) => navigate(key),
    className: "!grid !grid-cols-2 !gap-0 !p-1.5 !rounded-2xl !min-w-[360px] !shadow-lg",
  };

  /* ── profile dropdown ───────────────────────────────────────── */
  const profileMenuItems = [
    { key: "profile",  icon: <UserOutlined />,   label: "Profile"  },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "logout",   icon: <LogoutOutlined />,  label: "Logout", danger: true },
  ];

  /* ── notification popover content ───────────────────────────── */
  const notificationOverlay = (
    <div className="w-[300px]">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <Typography.Text className="!text-[14px] !font-semibold !text-ink">
          Notifications
        </Typography.Text>
        <div className="flex items-center gap-2">
          <Badge count={unreadNotificationsCount} size="small" />
          <button
            type="button"
            className="text-[11px] text-[#9b8f97] hover:text-brand transition-colors"
            onClick={() => {/* markAllRead() */}}
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* list */}
      <Space direction="vertical" size={8} className="!w-full">
        {previewNotifications.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${
              item.unread
                ? "border-[#f2d1c7] bg-[#fff7f4] hover:bg-[#fef0eb]"
                : "border-[#efe3de] bg-white hover:bg-[#faf5f3]"
            }`}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <Typography.Text className="!text-[13px] !font-semibold !text-ink">
                {item.title}
              </Typography.Text>
              {item.unread && (
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" />
              )}
            </div>
            <Typography.Paragraph className="!mb-1 !text-[12px] !leading-5 !text-[#6f6570]">
              {item.message}
            </Typography.Paragraph>
            <Typography.Text className="!text-[11px] !text-[#9b8f97]">
              {item.time}
            </Typography.Text>
          </div>
        ))}
      </Space>

      {/* footer */}
      <Divider className="!my-3" />
      <div className="flex items-center justify-between">
        <Button
          type="link"
          className="!h-auto !p-0 !text-[13px] !font-semibold !text-brand"
          onClick={() => { setNotificationsOpen(false); navigate("/app/notifications"); }}
        >
          View all →
        </Button>
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── mobile drawer ───────────────────────────────────── */}
      <Drawer open={mobileOpen} width={300} onClose={() => setMobileOpen(false)} placement="left">
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

      {/* ── sticky header ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[#eaded9] bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1160px] px-4 md:px-5">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* LEFT — hamburger + brand + nav links */}
            <div className="flex min-w-0 items-center gap-3 lg:gap-8">

              {/* hamburger (mobile only) */}
              <Button
                className="!flex !h-9 !w-9 !items-center !justify-center !rounded-lg !border-[#e7d8d2] !text-brand lg:!hidden"
                icon={<MenuOutlined />}
                onClick={() => setMobileOpen(true)}
              />

              {/* brand */}
              <Link to="/app/dashboard" className="shrink-0">
                <BrandMark />
              </Link>

              {/* desktop nav links */}
              <nav className="hidden items-center gap-1 lg:flex">
                <Link
                  to="/app/dashboard"
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
                    location.pathname === "/app/dashboard"
                      ? "bg-[#fdf0ed] text-brand"
                      : "text-[#4b3d47] hover:bg-[#faf4f2] hover:text-brand"
                  }`}
                >
                  <HomeOutlined className="text-[13px]" />
                  Home
                </Link>

                <Dropdown menu={moduleMenu} trigger={["click", "hover"]}>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${
                      moduleItems.some((item) => item.key === location.pathname)
                        ? "bg-[#fdf0ed] text-brand"
                        : "text-[#4b3d47] hover:bg-[#faf4f2] hover:text-brand"
                    }`}
                  >
                    Modules
                    <DownOutlined className="text-[11px] opacity-60" />
                  </button>
                </Dropdown>
              </nav>
            </div>

            {/* RIGHT — notifications + divider + profile */}
            <div className="flex items-center gap-2">

              {/* notification bell */}
              <Popover
                trigger="click"
                placement="bottomRight"
                open={notificationsOpen}
                onOpenChange={setNotificationsOpen}
                content={notificationOverlay}
                overlayInnerStyle={{ borderRadius: 16, padding: 16 }}
              >
                <Badge count={unreadNotificationsCount} size="small" offset={[-2, 2]}>
                  <Button
                    className="!flex !h-7 !w-4!items-center !justify-center !rounded-lg !border-[#9a2119] !bg-[#faf4f2] !text-[#9a2119] hover:!border-[#d8b4ad] hover:!text-brand"
                    icon={<BellOutlined />}
                  />
                </Badge>
              </Popover>

              {/* vertical divider */}
              <div className="mx-1 hidden h-5 w-px bg-[#eaded9] md:block" />

              {/* profile dropdown */}
              <Dropdown
                menu={{
                  items: profileMenuItems,
                  onClick: ({ key }) => {
                    if (key === "profile")  navigate("/app/profile");
                    if (key === "settings") navigate("/app/settings");
                    if (key === "logout")   { logout(); navigate("/auth-entry"); }
                  },
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="flex items-center gap-2  px-1 py-1  "
                >
                  <Avatar
                    size={28}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: "#9a2119", borderRadius: 6 }}
                  />
                  <span className="hidden text-[13px] font-medium text-[#2e1f28] md:inline">
                    {userProfile.name || "demo2026"}
                  </span>
                  <DownOutlined className="text-[11px] text-[#9b8f97]" />
                </button>
              </Dropdown>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}