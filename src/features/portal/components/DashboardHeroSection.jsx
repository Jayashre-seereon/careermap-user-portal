import { Button } from "antd";
import { EllipsisOutlined, ExperimentOutlined } from "@ant-design/icons";
import { useAppState } from "../../../state/AppStateContext";

export function DashboardHeroSection({ onTestClick }) {
    const { userProfile, onboarding, isUnlocked } = useAppState();

    return (
        <section className="dashboard-hero-panel group relative overflow-hidden rounded-[24px] px-7 py-8 md:px-8 md:py-10">
            <div className="dashboard-hero-orb dashboard-hero-orb-top" />
            <div className="dashboard-hero-orb dashboard-hero-orb-bottom" />
            <div className="dashboard-hero-noise" />

           

            <div className="relative max-w-2xl">
                <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.32em] text-[#ff9d6c]">
                    Home
                </div>
                <h1 className="display-font text-[2.15rem] font-bold leading-tight text-white md:text-[2.65rem]">
                    {`Welcome, ${userProfile.name || onboarding.name || "Student"}`}
                </h1>
                <p className="mt-4 max-w-[34rem] text-sm font-medium leading-7 text-[#dcc5bc] md:text-base">
                    {isUnlocked("psychometric-test")
                        ? "Take the comprehensive psychometric test to unlock detailed personality, aptitude, and career recommendations tailored for you."
                        : "Answer quick questions to discover your personality type and ideal career direction."}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                    <Button
                        type="default"
                        size="large"
                        icon={<ExperimentOutlined />}
                        className="dashboard-hero-button !h-12 !rounded-[10px] !border-0 !bg-white !px-5 !font-semibold !text-[#321a15]"
                        onClick={onTestClick}
                    >
                        {isUnlocked("psychometric-test") ? "Take Full Psychometric Test" : "Take the Test"}
                    </Button>
                </div>
            </div>
        </section>
    );
}
