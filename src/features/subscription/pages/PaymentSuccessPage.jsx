import { useEffect } from "react";
import { Button, List, Result } from "antd";
import { useSearchParams } from "react-router-dom";
import { subscriptions } from "../../../data/careermapData";
import { SectionCard } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function PaymentSuccessPage() {
  const { activatePlan } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const planId = params.get("planId");
  const returnTo = params.get("returnTo");
  const transactionId = params.get("transactionId");
  const plan = subscriptions.find((item) => item.id === planId) || subscriptions[0];

  useEffect(() => {
    activatePlan(plan.id);
  }, [activatePlan, plan.id]);

  return (
    <div className="p-4 md:p-8">
      <Result
        status="success"
        title="Payment Successful!"
        subTitle={`Your subscription is now active and ready to use. Transaction ID: ${transactionId || "TXN00000000"}`}
        extra={[
          <Button key="continue" type="primary" onClick={() => navigate(returnTo || "/app/dashboard")}>
            Continue
          </Button>,
        ]}
      />
      <div className="mx-auto max-w-xl">
        <SectionCard title="Subscription Details">
          <List
            dataSource={[
              ["Plan", plan.name],
              ["Amount", plan.price],
              ["Validity", "1 Year"],
            ]}
            renderItem={([label, value]) => (
              <List.Item>
                <span className="text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </List.Item>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}
