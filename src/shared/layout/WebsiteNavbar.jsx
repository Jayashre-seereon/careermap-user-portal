import {
  AppstoreOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  CreditCardOutlined,
  DownOutlined,
  FundProjectionScreenOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SearchOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Divider, Dropdown, Empty, Input, Popover, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/authApi";
import { useAppState } from "../../state/AppStateContext";
import { buildDashboardModules } from "../../utils/dashboard";
import BrandMark from "../branding/BrandMark";

const moduleItems = [
  { key: "/app/library", icon: <BookOutlined />, label: "Career Library" },
  { key: "/app/assessment", icon: <FundProjectionScreenOutlined />, label: "Career Assessment" },
  { key: "/app/learn", icon: <ReadOutlined />, label: "Master Class" },
  { key: "/app/entrance-exam", icon: <BulbOutlined />, label: "Entrance Exam" },
  { key: "/app/book-mentor", icon: <TeamOutlined />, label: "Book Mentor" },
  { key: "/app/scholarships", icon: <TrophyOutlined />, label: "Scholarships" },
  { key: "/app/institutes", icon: <AppstoreOutlined />, label: "Institutes" },
  { key: "/app/abroad", icon: <GlobalOutlined />, label: "Study Abroad" },
  { key: "/app/subscription", icon: <CreditCardOutlined />, label: "Subscriptions" },
  { key: "/app/quiz", icon: <QuestionCircleOutlined />, label: "Quiz" },
];

function normalizeSearchValue(value = "") {
  return String(value).toLowerCase().trim();
}

function buildSearchEntries(dashboardData) {
  const modules = buildDashboardModules(dashboardData?.modules || []).map((item) => ({
    type: "Module",
    title: item.title,
    subtitle: item.subtitle,
    keywords: [item.title, item.subtitle],
    route: item.route,
  }));

  const mentors = (dashboardData?.mentors || []).map((item) => ({
    type: "Mentor",
    title: item.name || "Mentor",
    subtitle: item.designation || item.specialty || "Open mentor profile",
    keywords: [item.name, item.designation, item.specialty, item.rank, item.experience],
    route: item.id
      ? `/app/book-mentor?mentorId=${encodeURIComponent(item.id)}`
      : `/app/book-mentor?mentor=${encodeURIComponent(item.name || "")}`,
  }));

  const scholarships = (dashboardData?.scholarships || []).map((item) => ({
    type: "Scholarship",
    title: item.name || "Scholarship",
    subtitle: [item.provider, item.deadline].filter(Boolean).join(" • "),
    keywords: [item.name, item.provider, item.type, item.deadline],
    route: item.name ? `/app/scholarships?item=${encodeURIComponent(item.name)}` : "/app/scholarships",
  }));

  const institutes = (dashboardData?.institutions || []).map((item) => ({
    type: "Institute",
    title: item.name || "Institute",
    subtitle: [item.address || item.location, item.institute_type || item.type].filter(Boolean).join(" • "),
    keywords: [item.name, item.address, item.location, item.institute_type, item.type],
    route: item.name ? `/app/institutes?search=${encodeURIComponent(item.name)}` : "/app/institutes",
  }));

  const plans = (dashboardData?.plans || []).map((item) => ({
    type: "Plan",
    title: item.name || "Plan",
    subtitle: [item.price ? `Rs ${item.price}` : "", item.validity ? `${item.validity} days` : ""]
      .filter(Boolean)
      .join(" • "),
    keywords: [item.name, item.plan_type, item.price, item.validity],
    route: "/app/subscription",
  }));

  return [...modules, ...mentors, ...scholarships, ...institutes, ...plans];
}

export default function WebsiteNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { unreadNotificationsCount, userProfile, logout, notifications, dashboardData } = useAppState();
  const previewNotifications = (notifications || []).slice(0, 3);

  const moduleMenu = {
    items: moduleItems.map((item) => ({ key: item.key, icon: item.icon, label: item.label })),
    selectedKeys: [location.pathname],
    onClick: ({ key }) => navigate(key),
    className: "!grid !grid-cols-2 !gap-0 !min-w-[320px] !rounded-2xl !p-1.5 !shadow-lg md:!min-w-[360px]",
  };

  const profileMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "logout", icon: <LogoutOutlined />, label: "Logout", danger: true },
  ];

  const searchEntries = useMemo(() => buildSearchEntries(dashboardData), [dashboardData]);

  const searchResults = useMemo(() => {
    const query = normalizeSearchValue(searchQuery);
    const source = searchEntries;

    if (!source.length) {
      return [];
    }

    if (!query) {
      return source.slice(0, 8);
    }

    return source
      .filter((item) => {
        const haystack = [item.type, item.title, item.subtitle, ...(item.keywords || [])]
          .filter(Boolean)
          .map(normalizeSearchValue)
          .join(" ");
        return haystack.includes(query);
      })
      .sort((a, b) => {
        const aStarts = normalizeSearchValue(a.title).startsWith(query) ? 0 : 1;
        const bStarts = normalizeSearchValue(b.title).startsWith(query) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.title.localeCompare(b.title);
      })
      .slice(0, 8);
  }, [searchEntries, searchQuery]);

  const searchGroups = useMemo(() => {
    return searchResults.reduce((acc, item) => {
      const bucket = acc[item.type] || [];
      bucket.push(item);
      acc[item.type] = bucket;
      return acc;
    }, {});
  }, [searchResults]);

  function handleSearchSelect(item) {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(item.route);
  }

  function handleSearchSubmit() {
    if (searchResults[0]) {
      handleSearchSelect(searchResults[0]);
    }
  }

  const notificationOverlay = (
    <div className="w-[300px]">
      <div className="mb-3 flex items-center justify-between">
        <Typography.Text className="!text-[14px] !font-semibold !text-ink">
          Notifications
        </Typography.Text>
        <div className="flex items-center gap-2">
          <Badge count={unreadNotificationsCount} size="small" />
          <button
            type="button"
            className="text-[11px] text-[#9b8f97] transition-colors hover:text-brand"
            onClick={() => {}}
          >
            Mark all read
          </button>
        </div>
      </div>

      <Space direction="vertical" size={8} className="!w-full">
        {previewNotifications.map((item) => (
          <div
            key={item.id}
            className={`cursor-pointer rounded-xl border px-3 py-2.5 transition-colors ${item.unread
              ? "border-[#f2d1c7] bg-[#fff7f4] hover:bg-[#fef0eb]"
              : "border-[#efe3de] bg-white hover:bg-[#faf5f3]"
            }`}
          >
            <div className="mb-1 flex items-start justify-between gap-3">
              <Typography.Text className="!text-[13px] !font-semibold !text-ink">
                {item.title}
              </Typography.Text>
              {item.unread ? <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9a2119]" /> : null}
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

      <Divider className="!my-3" />
      <div className="flex items-center justify-between">
        <Button
          type="link"
          className="!h-auto !p-0 !text-[13px] !font-semibold !text-brand"
          onClick={() => {
            setNotificationsOpen(false);
            navigate("/app/notifications");
          }}
        >
          View all {"->"}
        </Button>
      </div>
    </div>
  );

  const searchOverlay = (
    <div className="w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#eaded9] bg-white p-2 shadow-xl">
      <div className="px-2 pb-2 pt-1 text-[11px] font-medium text-[#8c6c67]">
        Search only live dashboard items.
      </div>

      {!dashboardData ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Loading dashboard data..." className="!my-0 !py-2" />
      ) : searchResults.length ? (
        <div className="space-y-3">
          {Object.entries(searchGroups).map(([groupName, items]) => (
            <div key={groupName}>
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#aa8a83]">
                {groupName}
              </div>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={`${item.type}-${item.title}-${item.route}`}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSearchSelect(item);
                    }}
                    className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-[#fdf7f5]"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-[#241d1e]">
                        {item.title}
                      </div>
                      <div className="truncate text-[11px] text-[#8c6c67]">
                        {item.subtitle}
                      </div>
                    </div>
                    <Tag className="!mr-0 !rounded-full !border-0 !bg-[#fdf0ee] !px-2 !py-0.5 !text-[10px] !font-bold !text-[#9a2119]">
                      {item.type}
                    </Tag>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches found" className="!my-0 !py-2" />
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-[#eaded9] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-[1280px] px-3 md:px-6">
        <div className="flex min-h-14 items-center justify-between gap-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-5">
            <Link to="/app/dashboard" className="shrink-0">
              <BrandMark />
            </Link>

            <nav className="min-w-0 flex-1 overflow-x-auto">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <Link
                  to="/app/dashboard"
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${location.pathname === "/app/dashboard"
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
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-medium transition-colors ${moduleItems.some((item) => item.key === location.pathname)
                      ? "bg-[#fdf0ed] text-brand"
                      : "text-[#4b3d47] hover:bg-[#faf4f2] hover:text-brand"
                    }`}
                  >
                    Modules
                    <DownOutlined className="text-[11px] opacity-60" />
                  </button>
                </Dropdown>
              </div>
            </nav>

            <div className="relative hidden min-w-[250px] max-w-[420px] flex-1 lg:block">
              <Popover
                open={searchOpen}
                placement="bottomLeft"
                trigger="click"
                content={searchOverlay}
              >
                <Input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setSearchOpen(false), 120);
                  }}
                  onPressEnter={handleSearchSubmit}
                  allowClear
                  prefix={<SearchOutlined className="text-[#9b8f97]" />}
                  placeholder="Search dashboard items..."
                  className="!h-10 !rounded-full !border-[#eaded9] !bg-[#faf7f5] !px-4 !text-[13px] !shadow-sm"
                />
              </Popover>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
                  className="!flex !h-8 !w-8 !items-center !justify-center !rounded-lg !border-[#9a2119] !bg-[#faf4f2] !text-[#9a2119] hover:!border-[#d8b4ad] hover:!text-brand"
                  icon={<BellOutlined />}
                />
              </Badge>
            </Popover>

            <div className="mx-1 hidden h-5 w-px bg-[#eaded9] md:block" />

            <Dropdown
              menu={{
                items: profileMenuItems,
                onClick: async ({ key }) => {
                  if (key === "profile") navigate("/app/profile");
                  if (key === "settings") navigate("/app/settings");
                  if (key === "logout") {
                    try {
                      await logoutUser();
                    } catch {
                      // Fall back to local logout even if the backend logout fails.
                    } finally {
                      logout();
                      navigate("/auth-entry");
                    }
                  }
                },
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button type="button" className="flex items-center gap-2 px-1 py-1">
                <Avatar
                  size={28}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#9a2119", borderRadius: 6 }}
                />
                <span className="hidden text-[13px] font-medium text-[#2e1f28] md:inline">
                  {userProfile?.name || "demo2026"}
                </span>
                <DownOutlined className="text-[11px] text-[#9b8f97]" />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}
