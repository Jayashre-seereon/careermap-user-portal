import { Col, Row } from "antd";
import { LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { moduleCards } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import {
    ReadOutlined,
    TrophyOutlined,
    TeamOutlined,
    GiftOutlined,
    GlobalOutlined,
    BulbOutlined,
} from "@ant-design/icons";

const dashboardModuleVisuals = {
    "Career Library": {
        icon: <ReadOutlined style={{ color: "#2c70c9" }} />,
        background: "linear-gradient(180deg, #dcecff 0%, #eef5ff 100%)",
        actionBg: "#2c70c9",
    },
    "Master Class": {
        icon: <TrophyOutlined style={{ color: "#5d8f26" }} />,
        background: "linear-gradient(180deg, #e7f2d2 0%, #f3f9e9 100%)",
        actionBg: "#5d8f26",
    },
    "Book Mentor": {
        icon: <TeamOutlined style={{ color: "#b63728" }} />,
        background: "linear-gradient(180deg, #fdf0eb 0%, #fff8f4 100%)",
        actionBg: "#b63728",
    },
    Scholarships: {
        icon: <GiftOutlined style={{ color: "#b77718" }} />,
        background: "linear-gradient(180deg, #fff0d8 0%, #fff8ee 100%)",
        actionBg: "#b77718",
    },
    "Study Abroad": {
        icon: <GlobalOutlined style={{ color: "#4c45aa" }} />,
        background: "linear-gradient(180deg, #e6e4fb 0%, #f3f2ff 100%)",
        actionBg: "#4c45aa",
    },
    Assessment: {
        icon: <BulbOutlined style={{ color: "#157f69" }} />,
        background: "linear-gradient(180deg, #def2ee 0%, #f0fbf8 100%)",
        actionBg: "#157f69",
    },
};

export function ExploreModulesSection() {
    const navFunc = useNavigate();
    const { isUnlocked } = useAppState();
    const priorityOrder = [
        "Career Library",
        "Master Class",
        "Book Mentor",
        "Scholarships",
        "Study Abroad",
        "Assessment",
    ];
    const curatedCards = priorityOrder
        .map((title) => moduleCards.find((card) => card.title === title))
        .filter(Boolean);

    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="display-font text-2xl font-bold text-ink">Explore Modules</div>
                    <div className="mt-1 text-sm text-muted">Open any module and continue the exact flow from there.</div>
                </div>
            </div>
            <Row gutter={[18, 18]}>
                {curatedCards.map((card) => {
                    const showLock =
                        (card.title === "Career Library" && !isUnlocked("career-library")) ||
                        (card.title === "Master Class" && !isUnlocked("master-class")) ||
                        (card.title === "Book Mentor" && !isUnlocked("book-mentor")) ||
                        (card.title === "Scholarships" && !isUnlocked("scholarship")) ||
                        (card.title === "Study Abroad" && !isUnlocked("abroad-consultancy"));
                    const art = dashboardModuleVisuals[card.title] || dashboardModuleVisuals.Assessment;
                    const description =
                        card.title === "Assessment"
                            ? "Deep personality and aptitude analysis for smarter career decisions."
                            : card.subtitle;

                    return (
                        <Col xs={24} sm={12} lg={8} key={card.title}>
                            <button
                                type="button"
                                className="dashboard-module-card group h-full w-full overflow-hidden rounded-[24px] border border-[#e8dbd6] bg-white text-left"
                                onClick={() => navFunc(card.route)}
                            >
                                <div
                                    className="dashboard-module-media relative h-40 overflow-hidden"
                                    style={{ background: art.background }}
                                >
                                    <div className="flex h-full items-center justify-center">
                                        <div className="dashboard-module-icon text-[48px] transition duration-300 group-hover:scale-110">
                                            {art.icon}
                                        </div>
                                    </div>

                                    {showLock ? (
                                        <div className="absolute right-4 top-4 flex items-center justify-center text-[13px] text-brand">
                                            <LockOutlined />
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex min-h-[188px] flex-col px-5 pb-5 pt-4">
                                    <div className="pr-8">
                                        <div className="display-font text-[22px] font-bold leading-tight text-ink">{card.title}</div>
                                        <div className="mt-2 text-sm leading-6 text-muted">{description}</div>
                                    </div>
                                   <div
  className="mt-auto flex items-center justify-between gap-3 cursor-pointer group"
  style={{ color: art.actionBg }}
>
  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
    Explore now
  </span>

  <span
    className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all duration-200"
    style={{ backgroundColor: art.actionBg }}
  >
    <ArrowRightOutlined className="transition-transform duration-200 group-hover:translate-x-1" />
  </span>
</div>
                                </div>
                            </button>
                        </Col>
                    );
                })}
            </Row>
        </section>
    );
}
