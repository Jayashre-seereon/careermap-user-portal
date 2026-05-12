import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
  FileProtectOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";
import { PageHero } from "../../../components/ui";
import { assessmentFeatures, assessmentPolicies } from "../../../data/careermapData";

const css = `
.assess-wrap {
  --brand:#b12d1f;
  --brand-dark:#922316;
  --brand-soft:#fdf3f0;
  --brand-border:rgba(177,45,31,0.18);
  --card-border:rgba(120,74,62,0.16);
  --text:#231815;
  --muted:#65544f;
  font-family:var(--font-sans,sans-serif);
}
.assess-summary,
.assess-panel,
.assess-status {
  background:#fff;
  border:1px solid var(--card-border);
  border-radius:24px;
  box-shadow:0 8px 24px rgba(53,26,20,0.05);
}
.assess-summary {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  padding:24px 26px;
  margin-bottom:18px;
}
.assess-summary-main {
  display:flex;
  align-items:center;
  gap:18px;
  min-width:0;
}
.assess-summary-icon {
  width:58px;
  height:58px;
  border-radius:18px;
  background:var(--brand-soft);
  border:1px solid rgba(177,45,31,0.12);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--brand);
  font-size:26px;
  flex-shrink:0;
}
.assess-summary-title {
  font-size:20px;
  font-weight:700;
  color:var(--text);
  line-height:1.2;
  margin:0 0 6px;
}
.assess-summary-desc {
  font-size:13px;
  color:var(--muted);
  line-height:1.65;
  margin:0;
}
.assess-summary-badge {
  display:inline-flex;
  align-items:center;
  gap:8px;
  padding:9px 14px;
  border-radius:999px;
  background:var(--brand-soft);
  border:1px solid rgba(177,45,31,0.14);
  color:var(--brand);
  font-size:13px;
  font-weight:600;
  white-space:nowrap;
}
.assess-summary-side {
  display:flex;
  align-items:flex-end;
  flex-direction:column;
  gap:10px;
}
.assess-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
  margin-bottom:18px;
}
@media(max-width:720px){
  .assess-grid { grid-template-columns:1fr; }
  .assess-summary {
    flex-direction:column;
    align-items:flex-start;
  }
  .assess-summary-side {
    width:100%;
    align-items:flex-start;
  }
}
.assess-panel {
  overflow:hidden;
}
.assess-panel-head {
  display:flex;
  align-items:center;
  gap:14px;
  padding:18px 20px 14px;
}
.assess-panel-icon {
  width:40px;
  height:40px;
  border-radius:14px;
  background:var(--brand-soft);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--brand);
  font-size:18px;
  flex-shrink:0;
}
.assess-panel-title {
  font-size:16px;
  font-weight:700;
  color:var(--text);
}
.assess-panel-divider {
  height:1px;
  background:rgba(120,74,62,0.14);
}
.assess-panel-body {
  padding:14px 20px 16px;
}
.assess-item {
  display:flex;
  align-items:flex-start;
  gap:12px;
  font-size:14px;
  color:#4e433f;
  line-height:1.55;
  padding:10px 0;
}
.assess-item-icon {
  color:var(--brand);
  font-size:15px;
  line-height:1.2;
  margin-top:2px;
  flex-shrink:0;
}
.assess-status {
  padding:16px 20px 18px;
}
.assess-status-row {
  display:flex;
  align-items:flex-start;
  gap:14px;
}
.assess-status-icon {
  width:44px;
  height:44px;
  border-radius:14px;
  background:var(--brand-soft);
  border:1px solid rgba(177,45,31,0.12);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--brand);
  font-size:18px;
  flex-shrink:0;
}
.assess-status-label {
  font-size:14px;
  font-weight:700;
  color:var(--brand);
  margin-bottom:4px;
}
.assess-status-desc {
  font-size:13px;
  color:#4e433f;
  line-height:1.65;
  margin:0;
}
.assess-status-btn {
  box-shadow:none !important;
}
`;

const featureIcons = [
  <SolutionOutlined key="domains" />,
  <FileProtectOutlined key="report" />,
  <ClockCircleOutlined key="time" />,
  <CheckCircleOutlined key="history" />,
];

const policyIcons = [
  <SolutionOutlined key="attempt" />,
  <SafetyCertificateOutlined key="private" />,
  <ClockCircleOutlined key="retake" />,
  <LockOutlined key="encrypted" />,
];

function InfoPanel({ title, icon, items, itemIcons }) {
  return (
    <div className="assess-panel">
      <div className="assess-panel-head">
        <div className="assess-panel-icon">{icon}</div>
        <div className="assess-panel-title">{title}</div>
      </div>
      <div className="assess-panel-divider" />
      <div className="assess-panel-body">
        {items.map((item, index) => (
          <div key={item} className="assess-item">
            <span className="assess-item-icon">{itemIcons[index] || <CheckCircleOutlined />}</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const { activePlanId, isUnlocked } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const testUnlocked = isUnlocked("psychometric-test");

  return (
    <div className="assess-wrap space-y-3">
      <style>{css}</style>
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div className="assess-summary">
        <div className="assess-summary-main">
          <div className="assess-summary-icon">
            <SolutionOutlined />
          </div>
          <div>
            <p className="assess-summary-title">Psychometric assessment</p>
            <p className="assess-summary-desc">
              Discover your strengths across 5 career domains in under 5 minutes.
            </p>
          </div>
        </div>
        <div className="assess-summary-side">
          <div className="assess-summary-badge">
            {testUnlocked ? <UnlockOutlined /> : <LockOutlined />}
            {testUnlocked ? "Unlocked" : "Locked"}
          </div>
          {testUnlocked && (
            <Button
              type="primary"
              size="large"
              icon={<ExperimentOutlined />}
              className="assess-status-btn !h-11 !rounded-[12px] !border-0 !bg-[#b12d1f] !px-5 !font-semibold hover:!bg-[#922316]"
              onClick={() => navigate("/app/psychometric-test")}
            >
              Continue to full test <ArrowRightOutlined />
            </Button>
          )}
        </div>
      </div>

      <div className="assess-grid">
        <InfoPanel
          title="Test features"
          icon={<CheckCircleOutlined />}
          items={assessmentFeatures}
          itemIcons={featureIcons}
        />
        <InfoPanel
          title="Test policy"
          icon={<FileProtectOutlined />}
          items={assessmentPolicies}
          itemIcons={policyIcons}
        />
      </div>

      {!testUnlocked && (
        <PremiumGate
          title="Unlock test"
          description="Subscribe to the Psychometric Test plan to take the full assessment and unlock the report flow."
          returnTo={location.pathname}
        />
      )}

      <div className="assess-status">
        <div className="assess-status-row">
          <div className="assess-status-icon">
            {activePlanId ? <CheckCircleOutlined /> : <LockOutlined />}
          </div>
          <div>
            <div className="assess-status-label">Plan status</div>
            <p className="assess-status-desc">
              {activePlanId
                ? "Your subscription is active. You can proceed with the psychometric flow and view updated results in your profile history."
              : "No active test plan yet. Choose a plan to unlock one full psychometric attempt and the related career report."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
