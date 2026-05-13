import React from "react";
import { Button, Card, Col, List, Row, Space } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { subscriptions } from "../../../data/careermapData";
import { ModuleScreen, PageHero, SoftTag } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function SubscriptionPage() {
  const { activePlanId } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");

  return (
    <ModuleScreen className="space-y-10">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div className="text-center">
        <h2 className="text-2xl font-black text-ink">Choose Your Plan</h2>
        <p className="text-muted text-sm mt-1">Four options tailored to your growth</p>
      </div>

      {/* Row setup for 4 cards: xs (1 card), sm (2 cards), lg (4 cards) */}
      <Row gutter={[16, 16]} justify="center">
        {subscriptions.map((plan) => {
          const isSelected = activePlanId === plan.id;

          return (
            <Col xs={24} sm={12} lg={6} key={plan.id}>
              <Card
                className={`!h-full !rounded-2xl !transition-all !duration-300 shadow-sm hover:shadow-lg relative overflow-hidden flex flex-col ${
                  isSelected ? "!border-brand !border-2" : "!border-[#eedad4]"
                }`}
                bodyStyle={{ padding: "0", display: "flex", flexDirection: "column", flex: 1 }}
              >
                {/* Header Area */}
                <div className={`p-5 ${isSelected ? "bg-brand/5" : "bg-gray-50/50"}`}>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="text-sm font-bold text-ink/40 uppercase tracking-widest">
                      {plan.name}
                    </div>
                    <div className="flex gap-1">
                      {plan.recommended && <SoftTag color="red" className="!text-[9px]">Recommended</SoftTag>}
                      {plan.highestseller && <SoftTag color="gold" className="!text-[9px]">Best Seller</SoftTag>}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-brand">{plan.price}</span>
                    <span className="text-muted text-[10px] font-medium">/mo</span>
                  </div>
                </div>

                {/* Features Area */}
                <div className="p-5 flex-grow">
                  <List
                    split={false}
                    dataSource={plan.features}
                    renderItem={(item) => (
                      <List.Item className="!border-none !px-0 !py-1.5">
                        <div className="flex items-start gap-2">
                          <CheckOutlined className="text-brand text-[12px] mt-1 flex-shrink-0" />
                          <span className="text-[13px] text-ink/80 leading-snug">{item}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>

                {/* Footer Button */}
                <div className="p-5 pt-0 mt-auto">
                  <Button
                    block
                    type={isSelected ? "default" : "primary"}
                    size="large"
                    className={`!h-11 !rounded-xl !text-sm !font-bold transition-transform active:scale-95 ${
                      isSelected ? "!bg-gray-100 !text-gray-400 !border-transparent" : "shadow-md"
                    }`}
                    onClick={() => navigate(`/checkout?planId=${plan.id}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
                  >
                    {isSelected ? "Current" : "Select"}
                  </Button>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </ModuleScreen>
  );
}
