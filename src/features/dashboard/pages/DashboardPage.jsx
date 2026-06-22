import { Avatar } from "antd";
import { BankOutlined, BellOutlined, RightOutlined, TrophyFilled,CreditCardOutlined,HistoryOutlined,TrophyOutlined } from "@ant-design/icons";
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
  const dashboardPlans = useMemo(
  () => dashboardData?.plans || [],
  [dashboardData?.plans]
);
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
    

      <DashboardHeroSection onTestClick={handleTestClick} userName={dashboardUserName} />
      <ExploreModulesSection modules={dashboardData?.modules || []} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-ink">Explore Your Mentors</div>
          <button type="button" className="text-sm font-bold text-brand" onClick={() => navigate("/app/book-mentor")}>
            See all
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardMentors.map((mentor) => (
            <button
              key={mentor.id || mentor.name}
              type="button"
              className="rounded-[22px] border border-[#eaded9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate("/app/book-mentor")}
            >
              <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[18px]" style={{ backgroundColor: `${mentor.accent}15` }}>
                {mentor.image ? (
                  <Avatar
                    src={mentor.image}
                    size={52}
                    shape="square"
                    className="!flex !items-center !justify-center !bg-transparent"
                    style={{ borderRadius: 18 }}
                  />
                ) : (
                  <span className="text-[18px] font-black" style={{ color: mentor.accent }}>
                    {mentor.avatar}
                  </span>
                )}
              </div>
              <div className="text-[15px] font-black text-ink">{mentor.name}</div>
              <div className="mt-1 text-[12px] font-bold text-brand">{mentor.specialty}</div>
              <div className="mt-2 text-[12px] text-muted"> <TrophyFilled style={{ color: "#d4a017" }} /> {mentor.rating} Air/State rank </div>
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboardInstitutes.map((item) => (
            <button
              key={item.id || item.name}
              type="button"
              className="rounded-[22px] border border-[#eaded9] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate("/app/institutes")}
            >
              <div className="mb-4 flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-[18px] bg-[#edf3ff]">
                {item.logo ? (
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <BankOutlined style={{ color: palette.blue, fontSize: 22 }} />
                )}
              </div>
              <div className="min-h-[52px] text-[15px] font-black text-ink">{item.name}</div>
              <div className="mt-1 text-[12px] font-bold text-brand">{item.location}</div>
              <div className="mt-2 text-[12px] text-muted">{item.type}</div>
             
            </button>
          ))}
        </div>
      </section>

  <section>
  {/* Header */}
  <div className="mb-6 flex items-center justify-between">
    <h2 className="display-font text-2xl font-extrabold tracking-tight text-ink">
      Explore Plans
    </h2>

    <button
      type="button"
      className="text-sm font-semibold text-brand hover:underline"
      onClick={() => navigate("/app/subscription")}
    >
      See all →
    </button>
  </div>

  {/* Cards */}
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
    {dashboardPlans.map((plan) => {
      // Determine ribbon color based on type
      const isBestSeller = plan.plan_type?.toUpperCase() === "BEST SELLER";
      const isRecommended = plan.plan_type?.toUpperCase() === "RECOMMENDED";
      
      const ribbonBgColor = isBestSeller 
        ? "bg-[#d4af37] text-white"   // Golden ribbon
        : isRecommended 
          ? "bg-[#991b1b] text-white " // Crimson/Red ribbon
          : "bg-brand text-white";

      return (
        <button
          key={plan.id}
          type="button"
          onClick={() => navigate("/app/subscription")}
          className="group relative rounded-2xl border border-[#eee] bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
        >
          {/* Top Glow Effect */}
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-brand opacity-80"></div>

          {/* Corner Ribbon Tag */}
          {plan.plan_type && (
            <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden pointer-events-none">
              <div className={`absolute transform rotate-45 text-center font-bold text-[6px] tracking-wider py-1 uppercase left-[-18px] top-[18px] w-[110px] shadow-sm ${ribbonBgColor}`}>
                {plan.plan_type}
              </div>
            </div>
          )}

          {/* Name */}
          <h3 className="text-[17px] font-bold text-ink leading-snug">
            {plan.name}
          </h3>

          {/* Price */}
          <div className="mt-3 flex items-end gap-1">
            <span className="text-2xl font-extrabold text-brand">
              ₹{plan.price}
            </span>
            <span className="text-xs text-muted mb-1">/plan</span>
          </div>

          {/* Divider */}
          <div className="my-3 h-[1px] w-full bg-gray-100"></div>

          {/* Validity */}
          <p className="text-[12px] text-muted">
            Valid for{" "}
            <span className="font-semibold text-ink">
              {plan.validity} days
            </span>
          </p>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-brand">
            <span className="group-hover:underline">View Details</span>
            <RightOutlined className="transition-transform group-hover:translate-x-1" />
          </div>
        </button>
      );
    })}
  </div>
</section>
    </div>
  );
}
