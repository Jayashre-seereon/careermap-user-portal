import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";

export function DashboardHeroSection({ onTestClick }) {
    const { userProfile, onboarding, isUnlocked } = useAppState();

    return (
        <PageHero
            eyebrow="Home"
            title={`Welcome, ${userProfile.name || onboarding.name || "Student"}`}
            description={
                isUnlocked("psychometric-test")
                    ? "Take the comprehensive psychometric test to get detailed career insights and recommendations."
                    : "Answer quick questions to discover your personality type and ideal career direction."
            }
            action={
                <Button
                    type="default"
                    size="large"
                    className="!border-white !bg-white !text-brand hover:!bg-white/90"
                    onClick={onTestClick}
                >
                    {isUnlocked("psychometric-test") ? "Take Full Psychometric Test" : "Take the Test"}
                </Button>
            }
        />
    );
}
