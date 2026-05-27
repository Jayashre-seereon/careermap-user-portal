import { Alert, Avatar } from "antd";
import { BankOutlined, BellOutlined, RightOutlined, TeamOutlined, TrophyOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../../../api/dashboardApi";
import { personalityQuestions, personalityTypes, palette } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import {
  buildDashboardInstitutes,
  buildDashboardMentors,
  buildDashboardScholarships,
} from "../../../utils/dashboard";
import { usePortalNavigation } from "../../portal/components/portalPageShared";
import { DashboardHeroSection } from "../../portal/components/DashboardHeroSection";
import { ExploreModulesSection } from "../../portal/components/ExploreModulesSection";
import { PersonalityQuizQuestion, PersonalityQuizResults } from "../../portal/components/PersonalityQuizSections";

export default function DashboardPage() {
  const { isUnlocked, onboarding, unreadNotificationsCount, userProfile } = useAppState();
  const { navigate } = usePortalNavigation();
  const [showPersonality, setShowPersonality] = useState(false);
  const [personalityStep, setPersonalityStep] = useState(0);
  const [answers, setAnswers] = useState(Array(personalityQuestions.length).fill(null));
  const [complete, setComplete] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  const personalityResult = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    answers.forEach((answer) => {
      if (answer !== null) counts[answer] += 1;
    });
    return personalityTypes[counts.indexOf(Math.max(...counts))];
  }, [answers]);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError("");
        const response = await getDashboard();
        if (active && response?.success) {
          setDashboardData(response.data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load dashboard.");
        }
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const dashboardUserName = useMemo(() => {
    const firstName = dashboardData?.user?.firstName?.trim();
    const lastName = dashboardData?.user?.lastName?.trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    return fullName || userProfile.name || onboarding.name || "Student";
  }, [dashboardData?.user?.firstName, dashboardData?.user?.lastName, onboarding.name, userProfile.name]);

  const dashboardMentors = useMemo(() => buildDashboardMentors(dashboardData?.mentors || []), [dashboardData?.mentors]);
  const dashboardScholarships = useMemo(() => buildDashboardScholarships(dashboardData?.scholarships || []), [dashboardData?.scholarships]);
  const dashboardInstitutes = useMemo(() => buildDashboardInstitutes(dashboardData?.institutions || []), [dashboardData?.institutions]);

  if (showPersonality && !complete) {
    return (
      <PersonalityQuizQuestion
        personalityStep={personalityStep}
        answers={answers}
        setAnswers={setAnswers}
        setShowPersonality={setShowPersonality}
        setPersonalityStep={setPersonalityStep}
        setComplete={setComplete}
      />
    );
  }

  if (showPersonality && complete) {
    return (
      <PersonalityQuizResults
        personalityResult={personalityResult}
        setShowPersonality={setShowPersonality}
        navigate={navigate}
      />
    );
  }

  function handleTestClick() {
    if (isUnlocked("psychometric-test")) {
      navigate("/app/psychometric-test");
      return;
    }

    setShowPersonality(true);
  }

  return (
    <div className="motion-stack space-y-6">
      {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="flex items-center justify-between rounded-[24px] border border-[#eaded9] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar size={44} style={{ backgroundColor: "#f6e7e2", color: palette.primary, fontWeight: 800 }}>
            {dashboardUserName.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div className="text-[18px] font-black text-ink">{dashboardUserName}</div>
          </div>
        </div>
        <button
          type="button"
          className="flex h-[42px] w-[42px] items-center justify-center rounded-[16px] border border-[#eaded9] bg-[#fffaf8] text-[#321a15]"
          onClick={() => navigate("/app/notifications")}
        >
          <div className="relative">
            <BellOutlined />
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -right-3 -top-3 min-w-[18px] rounded-full bg-[#9a2119] px-1 py-[1px] text-center text-[10px] font-extrabold text-white">
                {unreadNotificationsCount}
              </span>
            ) : null}
          </div>
        </button>
      </div>

      <DashboardHeroSection onTestClick={handleTestClick} userName={dashboardUserName} />
      <ExploreModulesSection modules={dashboardData?.modules || []} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-ink">Explore Your Mentors</div>
          <button type="button" className="text-sm font-bold text-brand" onClick={() => navigate("/app/book-mentor")}>
            See all
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardMentors.map((mentor) => (
            <button
              key={mentor.id || mentor.name}
              type="button"
              className="rounded-[22px] border border-[#eaded9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate("/app/book-mentor")}
            >
              <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[18px]" style={{ backgroundColor: `${mentor.accent}15` }}>
                <TeamOutlined style={{ color: mentor.accent, fontSize: 22 }} />
              </div>
              <div className="text-[15px] font-black text-ink">{mentor.name}</div>
              <div className="mt-1 text-[12px] font-bold text-brand">{mentor.specialty}</div>
              <div className="mt-2 text-[12px] text-muted">{mentor.rating} rank | {mentor.experience}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-ink">Explore Scholarships</div>
          <button type="button" className="text-sm font-bold text-brand" onClick={() => navigate("/app/scholarships")}>
            See all
          </button>
        </div>
        <div className="space-y-3">
          {dashboardScholarships.map((item) => (
            <button
              key={item.id || item.name}
              type="button"
              className="flex w-full items-center gap-4 rounded-[22px] border border-[#eaded9] bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              onClick={() => navigate("/app/scholarships")}
            >
              <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#edf9f1]">
                <TrophyOutlined style={{ color: palette.green, fontSize: 20 }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-extrabold text-ink">{item.name}</div>
                <div className="text-[12px] font-bold text-[#2f9367]">{item.amount}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-wide text-brand">{item.tag}</div>
                <div className="text-[11px] text-muted">{item.deadline}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-ink">Explore Institutes</div>
          <button type="button" className="text-sm font-bold text-brand" onClick={() => navigate("/app/institutes")}>
            See all
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardInstitutes.map((item) => (
            <button
              key={item.id || item.name}
              type="button"
              className="rounded-[22px] border border-[#eaded9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate("/app/institutes")}
            >
              <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-[18px] bg-[#edf3ff]">
                <BankOutlined style={{ color: palette.blue, fontSize: 22 }} />
              </div>
              <div className="min-h-[52px] text-[15px] font-black text-ink">{item.name}</div>
              <div className="mt-1 text-[12px] font-bold text-brand">{item.location}</div>
              <div className="mt-2 text-[12px] text-muted">{item.type}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#eaded9] bg-white p-5 shadow-sm">
        <div className="mb-3 text-[14px] font-black uppercase tracking-[0.5px] text-ink">Quick Actions</div>
        <div className="space-y-2">
          {[
            { label: "View Subscription Plans", path: "/app/subscription" },
            { label: "Your Test History", path: "/app/profile" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center justify-between rounded-[16px] px-1 py-2 text-left"
              onClick={() => navigate(item.path)}
            >
              <div className="text-[14px] font-bold text-ink">{item.label}</div>
              <RightOutlined style={{ color: palette.muted }} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
