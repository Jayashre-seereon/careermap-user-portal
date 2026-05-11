import { Button, Card, Col, List, Row, Space } from "antd";
import { useSearchParams } from "react-router-dom";
import { subscriptions } from "../../../data/careermapData";
import { PageHero, SoftTag } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function SubscriptionPage() {
  const { activePlanId } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        {subscriptions.map((plan) => (
          <Col xs={24} lg={12} key={plan.id}>
            <Card className="!h-full !border-[#eedad4] !shadow-soft">
              <Space direction="vertical" size="middle" className="!w-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-ink">{plan.name}</div>
                    <div className="mt-2 text-sm text-muted">{plan.description}</div>
                  </div>
                  <div className="flex gap-2">
                    {plan.recommended ? <SoftTag color="red">Recommended</SoftTag> : null}
                    {plan.highestseller ? <SoftTag color="gold">Highest Seller</SoftTag> : null}
                  </div>
                </div>
                <div className="text-4xl font-black text-brand">{plan.price}</div>
                <List size="small" dataSource={plan.features} renderItem={(item) => <List.Item>{item}</List.Item>} />
                <Button
                  type={activePlanId === plan.id ? "default" : "primary"}
                  size="large"
                  onClick={() => navigate(`/checkout?planId=${plan.id}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
                >
                  {activePlanId === plan.id ? "Current Plan" : "Choose Plan"}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
