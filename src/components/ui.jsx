import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  BookOutlined,
  BulbOutlined,
  CreditCardOutlined,
  FundProjectionScreenOutlined,
  GlobalOutlined,
  HomeOutlined,
  NotificationOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Drawer,
  Grid,
  Layout,
  Menu,
  Row,
  Space,
  Tag,
  Typography,
  theme,
} from "antd";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { palette } from "../data/careermapData";
import { useAppState } from "../state/AppStateContext";

const { Header, Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

export function AppProviders({ children }) {
  const { preferences } = useAppState();

  return (
    <ConfigProvider
      theme={{
        algorithm: preferences.darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: palette.primary,
          colorLink: palette.primary,
          borderRadius: 18,
          colorBgLayout: preferences.darkMode ? "#080808" : "#fcf7f4",
          colorBgContainer: preferences.darkMode ? "#101010" : "#ffffff",
          colorText: preferences.darkMode ? "#f6f1ef" : palette.text,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export function BrandMark({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-gradient flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white shadow-soft">
        CM
      </div>
      {!compact ? (
        <div>
          <div className="text-base font-black text-ink">Career Map</div>
          <div className="text-xs text-muted">Discover Your Future</div>
        </div>
      ) : null}
    </div>
  );
}

export function AuthFrame({ title, subtitle, children, backTo }) {
  return (
    <div className="app-shell min-h-screen px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-[24px] border border-[#eedad4] bg-white/80 px-5 py-4 shadow-soft backdrop-blur">
          <BrandMark />
          {backTo ? (
            <Link to={backTo} className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
              <ArrowLeftOutlined />
              Back
            </Link>
          ) : null}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="brand-gradient rounded-[30px] px-7 py-8 text-white shadow-soft">
            <div className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em]">
              Career Website
            </div>
            <h1 className="display-font max-w-xl text-4xl font-bold leading-tight md:text-5xl">
              Clean website flow for students and parents.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/80">
              Login, onboarding, profile setup, tests, mentors, scholarships, institutes, study abroad, and subscriptions all stay connected in one simple website experience.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Start Test", "Explore Modules", "Continue Journey"].map((item) => (
                <div key={item} className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-4 text-sm font-semibold text-white/90">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[30px] border border-[#eedad4] bg-white px-5 py-6 shadow-soft md:px-8">
            <div className="mb-8">
              <Title level={2} className="display-font !mb-2 !text-4xl">
                {title}
              </Title>
              <Paragraph className="!mb-0 !text-base !text-muted">{subtitle}</Paragraph>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, description, action }) {
  return (
    <div className="brand-gradient relative overflow-hidden rounded-[28px] p-8 text-white shadow-soft md:p-10">
        <div className="hero-orb left-[-2rem] top-[-2rem] h-28 w-28 bg-white/20" />
        <div className="hero-orb bottom-[-2rem] right-[-2rem] h-36 w-36 bg-white/15" />
        <div className="website-grid absolute inset-0 opacity-20" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? <div className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-[#ffd8c7]">{eyebrow}</div> : null}
            <Title level={2} className="display-font !mb-3 !text-white">
              {title}
            </Title>
            <Paragraph className="!mb-0 !max-w-2xl !text-base !leading-7 !text-white/80">{description}</Paragraph>
          </div>
          {action ? <div>{action}</div> : null}
        </div>
    </div>
  );
}

export function SectionCard({ title, extra, children }) {
  return (
    <Card
      title={<span className="text-lg font-black text-ink">{title}</span>}
      extra={extra}
      className="!border-[#eedad4] !shadow-soft"
    >
      {children}
    </Card>
  );
}

export function StatTile({ label, value, tone }) {
  return (
    <Card className="!border-[#eedad4] !shadow-none">
      <div className="space-y-3">
        <div className="h-3 w-14 rounded-full" style={{ backgroundColor: tone }} />
        <div className="text-3xl font-black text-ink">{value}</div>
        <div className="text-sm font-semibold text-muted">{label}</div>
      </div>
    </Card>
  );
}

export function SoftTag({ children, color = "default" }) {
  return (
    <Tag color={color} className="!rounded-full !px-3 !py-1 !text-xs !font-bold">
      {children}
    </Tag>
  );
}

export function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, unreadNotificationsCount, userProfile } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const screens = useBreakpoint();

  const items = [
    { key: "/app/dashboard", icon: <HomeOutlined />, label: "Home" },
    { key: "/app/assessment", icon: <FundProjectionScreenOutlined />, label: "Start Test" },
    { key: "/app/library", icon: <BookOutlined />, label: "Library" },
    { key: "/app/learn", icon: <ReadOutlined />, label: "Master Class" },
    { key: "/app/book-mentor", icon: <TeamOutlined />, label: "Mentor" },
    { key: "/app/scholarships", icon: <TrophyOutlined />, label: "Scholarships" },
    { key: "/app/institutes", icon: <AppstoreOutlined />, label: "Institutes" },
    { key: "/app/entrance-exam", icon: <BulbOutlined />, label: "Exams" },
    { key: "/app/abroad", icon: <GlobalOutlined />, label: "Abroad" },
    { key: "/app/subscription", icon: <CreditCardOutlined />, label: "Plans" },
    { key: "/app/quiz", icon: <QuestionCircleOutlined />, label: "Quiz" },
    { key: "/app/profile", icon: <UserOutlined />, label: "Profile" },
    { key: "/app/settings", icon: <SettingOutlined />, label: "Settings" },
    { key: "/app/about", icon: <BellOutlined />, label: "About" },
  ];

  const menu = (
    <div className="px-2 py-4">
      <div className="mb-4">
        <BrandMark />
      </div>
      <Menu
        mode={screens.lg ? "horizontal" : "inline"}
        selectedKeys={[location.pathname]}
        items={items}
        onClick={({ key }) => {
          setMobileOpen(false);
          navigate(key);
        }}
        overflowedIndicator={<span className="text-sm font-semibold">More</span>}
        className="!border-none !bg-transparent"
      />
    </div>
  );

  return (
    <Layout className="app-shell min-h-screen">
      <Drawer open={mobileOpen} width={320} onClose={() => setMobileOpen(false)} placement="left">
        {menu}
      </Drawer>
      <Layout className="!bg-transparent">
        <Header className="!sticky !top-0 !z-20 !mx-3 !mt-3 !h-auto !rounded-[24px] !border !border-[#eedad4] !bg-white/85 !px-4 !py-3 shadow-soft backdrop-blur md:!mx-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Space size="middle" align="center">
              <Button className="lg:!hidden" onClick={() => setMobileOpen(true)}>
                Menu
              </Button>
              <BrandMark compact />
              <div className="hidden lg:block">{menu}</div>
            </Space>
            <Space size="middle">
              <Badge count={unreadNotificationsCount}>
                <Button icon={<BellOutlined />} onClick={() => navigate("/app/notifications")} />
              </Badge>
              <Button type="primary" onClick={() => navigate("/app/assessment")}>Start Test</Button>
              <Avatar size={44} style={{ backgroundColor: palette.primary }}>
                {(userProfile.name || "U").charAt(0).toUpperCase()}
              </Avatar>
            </Space>
          </div>
        </Header>
        <Content className="px-3 py-4 md:px-6 md:py-6">
          <div className="mx-auto max-w-[1280px]">
            <Outlet />
          </div>
        </Content>
        <div className="mx-3 mb-3 rounded-[24px] border border-[#eedad4] bg-white/85 px-5 py-5 shadow-soft md:mx-6">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="display-font text-lg font-bold text-ink">Career Map</div>
              <div className="text-sm text-muted">Career guidance website for students and parents.</div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted">
              <Link to="/app/dashboard">Home</Link>
              <Link to="/app/library">Library</Link>
              <Link to="/app/assessment">Start Test</Link>
              <Link to="/app/subscription">Plans</Link>
              <Link to="/app/about">About</Link>
            </div>
          </div>
        </div>
      </Layout>
    </Layout>
  );
}

export { Col, Link, Paragraph, Row, Space, Text, Title };
