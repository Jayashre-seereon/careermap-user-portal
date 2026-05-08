import { Col, Row, Tag } from "antd";
import { LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SoftTag, Text } from "../../../components/ui";
import { moduleCards, moduleArtPresets } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";

export function ExploreModulesSection({ unreadNotificationsCount }) {
    const { navigate } = { navigate: useNavigate() };
    const navFunc = useNavigate();
    const { isUnlocked } = useAppState();

    return (
        <div >
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="display-font text-2xl font-bold text-ink">Explore Modules</div>
                    <div className="mt-1 text-sm text-muted">Open any module and continue the exact flow from there.</div>
                </div>
                           </div>
            <Row gutter={[16, 16]}>
                {moduleCards.map((card) => {
                    const showLock =
                        (card.title === "Career Library" && !isUnlocked("career-library")) ||
                        (card.title === "Master Class" && !isUnlocked("master-class")) ||
                        (card.title === "Book Mentor" && !isUnlocked("book-mentor")) ||
                        (card.title === "Scholarships" && !isUnlocked("scholarship")) ||
                        (card.title === "Study Abroad" && !isUnlocked("abroad-consultancy"));
                    const art = moduleArtPresets[card.title] || {
                        background: `linear-gradient(135deg, ${card.tone}22 0%, ${card.tone} 100%)`,
                        accent: card.tone,
                        image: null,
                    };

                    return (
                        <Col xs={24} sm={12} lg={8} key={card.title}>
                            <button
                                type="button"
                                className="group h-full w-full overflow-hidden rounded-[24px] border border-[#eedad4] bg-white text-left shadow-[0_16px_36px_rgba(38,33,38,0.08)] transition hover:-translate-y-1 hover:border-brand hover:shadow-[0_22px_46px_rgba(38,33,38,0.14)]"
                                onClick={() => navFunc(card.route)}
                            >
                                <div
                                    className="relative h-44 overflow-hidden"
                                    style={{ background: art.background }}
                                >
                                    {art.image ? <img src={art.image} alt={card.title} className="h-full w-full object-cover" /> : null}
                                   
                                    {showLock ? (
                                        <div className="absolute right-4 top-4 flex  items-center justify-center  text-brand ">
                                            <LockOutlined />
                                        </div>
                                    ) : null}
                                </div>
                                <div className="flex min-h-[170px] flex-col px-5 pb-5 pt-4">
                                    <div className="pr-8">
                                        <div className="display-font text-[22px] font-bold leading-tight text-ink">{card.title}</div>
                                        <div className="mt-2 text-sm leading-6 text-muted">{card.subtitle}</div>
                                    </div>
                                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                                        <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: art.accent }}>
                                            Explore now
                                        </div>
                                        <div
                                            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition group-hover:translate-x-1"
                                            style={{ backgroundColor: art.accent }}
                                        >
                                            <ArrowRightOutlined />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
}
