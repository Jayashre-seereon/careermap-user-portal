import {
  CheckCircleOutlined,
  FileProtectOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, usePortalNavigation } from "../../portal/components/portalPageShared";
import { PageHero } from "../../../components/ui";
import { assessmentFeatures, assessmentPolicies } from "../../../data/careermapData";

const css = `
.assess-wrap { --brand:#9a2119; --brand-bg:rgba(154,33,25,0.06); --brand-border:rgba(154,33,25,0.14); font-family:var(--font-sans,sans-serif); }
.assess-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
@media(max-width:600px){ .assess-grid{ grid-template-columns:1fr; } }
.feat-card { background:var(--color-background-secondary,#f9f9f9); border:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.1)); border-radius:12px; padding:14px 16px; }
.feat-head { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.feat-ico { width:30px; height:30px; border-radius:8px; background:var(--brand-bg); display:flex; align-items:center; justify-content:center; color:var(--brand); font-size:16px; flex-shrink:0; }
.feat-title { font-size:14px; font-weight:500; color:var(--color-text-primary,#111); }
.feat-item { display:flex; align-items:flex-start; gap:8px; font-size:13px; color:var(--color-text-secondary,#555); line-height:1.5; padding:5px 0; border-bottom:0.5px solid var(--color-border-tertiary,rgba(0,0,0,.06)); }
.feat-item:last-child { border-bottom:none; padding-bottom:0; }
.feat-dot { width:5px; height:5px; min-width:5px; border-radius:50%; background:var(--brand); opacity:.55; margin-top:7px; }
.status-strip { display:flex; align-items:flex-start; gap:12px; padding:14px 16px; background:var(--brand-bg); border:0.5px solid var(--brand-border); border-radius:12px; }
.status-ico { width:34px; height:34px; min-width:34px; border-radius:8px; background:rgba(154,33,25,0.12); display:flex; align-items:center; justify-content:center; color:var(--brand); font-size:17px; }
.status-lbl { font-size:12px; font-weight:500; color:var(--brand); margin-bottom:3px; }
.status-desc { font-size:13px; color:var(--color-text-secondary,#555); line-height:1.55; margin:0; }
`;

function FeatCard({ title, icon, items }) {
  return (
    <div className="feat-card">
      <div className="feat-head">
        <div className="feat-ico">{icon}</div>
        <span className="feat-title">{title}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} className="feat-item">
          <span className="feat-dot" />
          {item}
        </div>
      ))}
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

      <div className="assess-grid">
        <FeatCard title="Test features" icon={<CheckCircleOutlined />} items={assessmentFeatures} />
        <FeatCard title="Test policy" icon={<FileProtectOutlined />} items={assessmentPolicies} />
      </div>

      {!testUnlocked && (
        <PremiumGate
          title="Unlock test"
          description="Subscribe to the Psychometric Test plan to take the full assessment and unlock the report flow."
          returnTo={location.pathname}
        />
      )}

      <div className="status-strip">
        <div className="status-ico">
          {activePlanId ? <UnlockOutlined /> : <LockOutlined />}
        </div>
        <div>
          <div className="status-lbl">Plan status</div>
          <p className="status-desc">
            {activePlanId
              ? "Your subscription is active. You can proceed with the psychometric flow and view updated results in your profile history."
              : "No active test plan yet. Choose a plan to unlock one full psychometric attempt and the related career report."}
          </p>
        </div>
      </div>
    </div>
  );
}
