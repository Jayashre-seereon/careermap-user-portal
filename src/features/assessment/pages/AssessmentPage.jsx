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
import { ModuleScreen, PageHero } from "../../../components/ui";
import { assessmentFeatures, assessmentPolicies } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";

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
    <div className="overflow-hidden rounded-3xl border border-[rgba(120,74,62,0.16)] bg-white shadow-[0_8px_24px_rgba(53,26,20,0.05)]">
      <div className="flex items-center gap-3.5 px-5 pb-3.5 pt-4.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#fdf3f0] text-lg text-[#b12d1f]">
          {icon}
        </div>
        <div className="text-base font-bold text-[#231815]">{title}</div>
      </div>
      <div className="h-px bg-[rgba(120,74,62,0.14)]" />
      <div className="px-5 pb-4 pt-3.5">
        {items.map((item, index) => (
          <div key={item} className="flex items-start gap-3 py-2.5 text-sm leading-6 text-[#4e433f]">
            <span className="mt-0.5 shrink-0 text-[15px] text-[#b12d1f]">
              {itemIcons[index] || <CheckCircleOutlined />}
            </span>
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
    <ModuleScreen className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div>
        <h1>Assessment</h1>
        <p className="mt-1">Take your psychometric assessment and review your test access details.</p>
      </div>

      <div className="mb-[18px] flex flex-col gap-[18px] rounded-3xl border border-[rgba(120,74,62,0.16)] bg-white px-[26px] py-6 shadow-[0_8px_24px_rgba(53,26,20,0.05)] md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-[18px]">
          <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] border border-[rgba(177,45,31,0.12)] bg-[#fdf3f0] text-[26px] text-[#b12d1f]">
            <SolutionOutlined />
          </div>
          <div>
            <p className="mb-1.5 text-xl font-bold leading-tight text-[#231815]">Psychometric Assessment</p>
            <p className="text-[13px] leading-[1.65] text-[#65544f]">
              Discover your strengths across 5 career domains in under 5 minutes.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 md:items-end">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(177,45,31,0.14)] bg-[#fdf3f0] px-3.5 py-[9px] text-[13px] font-semibold text-[#b12d1f]">
            {testUnlocked ? <UnlockOutlined /> : <LockOutlined />}
            {testUnlocked ? "Unlocked" : "Locked"}
          </div>
          {testUnlocked && (
            <Button
              type="primary"
              size="large"
              icon={<ExperimentOutlined />}
              className="!h-11 !rounded-xl !border-0 !bg-[#b12d1f] !px-5 !font-semibold hover:!bg-[#922316]"
              onClick={() => navigate("/app/psychometric-test")}
            >
              Continue to full test <ArrowRightOutlined />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <InfoPanel
          title="Test Features"
          icon={<CheckCircleOutlined />}
          items={assessmentFeatures}
          itemIcons={featureIcons}
        />
        <InfoPanel
          title="Test Policy"
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

      <div className="rounded-3xl border border-[rgba(120,74,62,0.16)] bg-white px-5 pb-[18px] pt-4 shadow-[0_8px_24px_rgba(53,26,20,0.05)]">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgba(177,45,31,0.12)] bg-[#fdf3f0] text-lg text-[#b12d1f]">
            {activePlanId ? <CheckCircleOutlined /> : <LockOutlined />}
          </div>
          <div>
            <div className="mb-1 text-sm font-bold text-[#b12d1f]">Plan status</div>
            <p className="text-[13px] leading-[1.65] text-[#4e433f]">
              {activePlanId
                ? "Your subscription is active. You can proceed with the psychometric flow and view updated results in your profile history."
                : "No active test plan yet. Choose a plan to unlock one full psychometric attempt and the related career report."}
            </p>
          </div>
        </div>
      </div>
    </ModuleScreen>
  );
}
