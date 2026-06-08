import { useState } from "react";
import { Col, Row } from "antd";

import { LockOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../../state/AppStateContext";
import { buildDashboardModules, moduleIconMap, moduleStyleMap } from "../../../utils/dashboard.jsx";
import {
    AppstoreOutlined,
} from "@ant-design/icons";
import { UnlockRedirectModal } from "./portalPageShared.jsx";
import { checkModuleAccess } from "../../../api/moduleAccessApi";
export function ExploreModulesSection({ modules = [] }) {
    const navFunc = useNavigate();
    const { isUnlocked } = useAppState();
    const curatedCards = modules.length && modules[0]?.route ? modules : buildDashboardModules(modules);
    const [lockedModule, setLockedModule] =
  useState(null);
const handleModuleClick = async (card) => {
  try {

    const response =
      await checkModuleAccess(card.id);

   if (!response?.allowed) {

  setLockedModule({
    title: card.title,
    message: response?.message,
  });

  return;
}

  

  navFunc(card.route, {
  state: {
    accessStatus: card.accessStatus,
  },
});

  } catch (err) {

    console.error(err);

  }
};
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
                    console.log(card);
                    const showLock =
                        (card.title === "Career Library" && !isUnlocked("career-library")) ||
                        (card.title === "Master Class" && !isUnlocked("master-class")) ||
                        (card.title === "Book Mentor" && !isUnlocked("book-mentor")) ||
                        (card.title === "Scholarships" && !isUnlocked("scholarship")) ||
                        (card.title === "Study Abroad" && !isUnlocked("abroad-consultancy"));
                    const art = moduleStyleMap[card.title] || moduleStyleMap.Assessment;
                    const description =
                        card.title === "Assessment"
                            ? "Deep personality and aptitude analysis for smarter career decisions."
                            : card.subtitle;

                    return (
                        <Col xs={24} sm={12} lg={8} xl={6} key={card.title}>
                            <button
                                type="button"
                                className="dashboard-module-card group h-full w-full overflow-hidden rounded-[24px] border border-[#e8dbd6] bg-white text-left"
                                onClick={() => handleModuleClick(card)}
                            >
                                <div
                                    className="dashboard-module-media relative h-28 overflow-hidden"
                                    style={{ background: art.background }}
                                >
                                    <div className="flex h-full items-center justify-center">
                                        <div className="dashboard-module-icon text-[36px] transition duration-300 group-hover:scale-110">
                                            {moduleIconMap[card.title] || <AppstoreOutlined style={{ color: art.actionBg }} />}
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
             <UnlockRedirectModal
      open={!!lockedModule}
      title={`Unlock ${lockedModule?.title || "Module"}`}
      itemLabel={lockedModule?.title}
      description={
        lockedModule?.message ||
        "Free preview already used. Please purchase a subscription to continue accessing this module."
      }
      onCancel={() => setLockedModule(null)}
      onConfirm={() => {
        navFunc(
          `/app/subscription?returnTo=${encodeURIComponent(
            location.pathname
          )}`
        );

        setLockedModule(null);
      }}
    />

        </section>
    );
}
