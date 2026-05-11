import { Typography } from "antd";
import { PageHero, SectionCard } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

export default function AboutPage() {
  const { navigate } = usePortalNavigation();

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <SectionCard title="What's included">
        <Paragraph>
          This portal now reflects the mobile app's information architecture: dashboard-first navigation, career discovery, student profile details, notifications, subscriptions, settings, psychometric flows, mentor booking, scholarships, institutes, entrance exams, study abroad, and quizzes.
        </Paragraph>
        <Paragraph>
          The experience is adapted as a professional responsive website for desktop and tablet while keeping the same client-side flows, sample data, and premium gating logic from the mobile app.
        </Paragraph>
      </SectionCard>
    </div>
  );
}
