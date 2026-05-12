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
    CreditCardOutlined,
    BankOutlined,
    FileDoneOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons";

const dashboardModuleVisuals = {
    "Career Library": {
        icon: <ReadOutlined style={{ color: "#c64f7a" }} />,
         background: "linear-gradient(180deg, #fdebf2 0%, #fff6f9 100%)",
         actionBg: "#c64f7a",
    },
    "Master Class": {
        icon: <TrophyOutlined style={{ color: "#4c45aa" }} />,
        background: "linear-gradient(180deg, #e6e4fb 0%, #f3f2ff 100%)",
        actionBg: "#4c45aa",
    },
    "Book Mentor": {
        icon: <TeamOutlined style={{ color: "#157f69" }} />,
               background: "linear-gradient(180deg, #def2ee 0%, #f0fbf8 100%)",
        actionBg: "#157f69",
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
        icon: <BulbOutlined style={{ color: "#5d8f26" }} />,
        background: "linear-gradient(180deg, #e7f2d2 0%, #f3f9e9 100%)",
   actionBg: "#5d8f26",
    },
    "Entrance Exam": {
        icon: <FileDoneOutlined style={{ color: "#0f8a7c" }} />,
        background: "linear-gradient(180deg, #def6f2 0%, #f0fbf9 100%)",
        actionBg: "#0f8a7c",
    },
    Institutes: {
        icon: <BankOutlined style={{ color: "#c64f7a" }} />,
        background: "linear-gradient(180deg, #fdebf2 0%, #fff6f9 100%)",
        actionBg: "#c64f7a",
    },
    Quiz: {
        icon: <QuestionCircleOutlined style={{ color: "#2c70c9" }} />,
        background: "linear-gradient(180deg, #e4efff 0%, #f3f8ff 100%)",
        actionBg: "#2c70c9",
    },
    Subscriptions: {
        icon: <CreditCardOutlined style={{ color: "#8c5a18" }} />,
        background: "linear-gradient(180deg, #fff1dd 0%, #fff9f0 100%)",
        actionBg: "#8c5a18",
    },
};

export function ExploreModulesSection() {
    const navFunc = useNavigate();
    const { isUnlocked } = useAppState();
    const priorityOrder = [
        "Career Library",
         "Assessment",
        "Master Class",
        "Book Mentor",
         "Quiz",
        "Entrance Exam",
        "Institutes",
        "Scholarships",
        "Study Abroad",
        "Subscriptions",
    ];
    const subscriptionsCard = {
        title: "Subscriptions",
        subtitle: "View subscription options and unlock premium modules.",
        route: "/app/subscription",
    };
    const sourceCards = [...moduleCards, subscriptionsCard];
    const curatedCards = priorityOrder
        .map((title) => moduleCards.find((card) => card.title === title))
        .map((card, index) => card || sourceCards.find((item) => item.title === priorityOrder[index]))
        .filter(Boolean);

    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="display-font text-2xl font-bold text-ink">Explore Modules</div>
                    <div className="mt-1 text-sm text-muted">Open any module and continue the exact flow from there.</div>
                </div>
            </div>
            <Row gutter={[14, 14]}>
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
                        <Col xs={24} sm={12} lg={8} xl={6} key={card.title}>
                            <button
                                type="button"
                                className="dashboard-module-card group h-full w-full overflow-hidden rounded-[24px] border border-[#e8dbd6] bg-white text-left"
                                onClick={() => navFunc(card.route)}
                            >
                                <div
                                    className="dashboard-module-media relative h-28 overflow-hidden"
                                    style={{ background: art.background }}
                                >
                                    <div className="flex h-full items-center justify-center">
                                        <div className="dashboard-module-icon text-[36px] transition duration-300 group-hover:scale-110">
                                            {art.icon}
                                        </div>
                                    </div>

                                    {showLock ? (
                                        <div className="absolute right-4 top-4 flex items-center justify-center text-[13px] text-brand">
                                            <LockOutlined />
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex min-h-[148px] flex-col px-4 pb-4 pt-3.5">
                                    <div className="pr-4">
                                        <div className="display-font text-[19px] font-bold leading-tight text-ink">{card.title}</div>
                                        <div className="mt-1.5 text-[13px] leading-5 text-muted">{description}</div>
                                    </div>
                                    <div
                                        className="mt-auto flex items-center justify-between gap-3 pt-4"
                                        style={{ color: art.actionBg }}
                                    >
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
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
