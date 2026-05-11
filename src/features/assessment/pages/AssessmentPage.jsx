import { Col, List, Row, Typography } from "antd";
import { assessmentFeatures, assessmentPolicies } from "../../../data/careermapData";
import { PageHero, SectionCard } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

const { Paragraph } = Typography;

export default function AssessmentPage() {
  const { activePlanId, isUnlocked } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const testUnlocked = isUnlocked("psychometric-test");

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SectionCard title="Test Features">
            <List dataSource={assessmentFeatures} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </SectionCard>
        </Col>
        <Col xs={24} lg={12}>
          <SectionCard title="Test Policy">
            <List dataSource={assessmentPolicies} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </SectionCard>
        </Col>
      </Row>
      {!testUnlocked ? (
        <PremiumGate
          title="Unlock Test"
          description="Subscribe to the Psychometric Test plan to take the full assessment and unlock the report flow."
          returnTo={location.pathname}
        />
      ) : null}
      <SectionCard title="Status">
        <Paragraph>
          {activePlanId
            ? "Your subscription is active. You can proceed with the psychometric flow and view updated results in your profile history."
            : "No active test plan yet. Choose a plan to unlock one full psychometric attempt and the related career report."}
        </Paragraph>
      </SectionCard>
    </div>
  );
}
