import React, { useEffect, useState } from "react";
import { Button, Card, Col, List, Row } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { getPlans,createOrder, verifyPayment } from "../../../api/subscriptionApi";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";
import { loadRazorpayScript } from "../../../utils/razorpay.js";
export default function SubscriptionPage() {
  const { activePlanIds } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const activePlanIdSet = new Set((activePlanIds || []).map((id) => String(id)));

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // handle payment button click
  const handleSelectPlan = async (planId) => {
    if (activePlanIdSet.has(String(planId))) {
      return;
    }

    // try loading razor pay sdk script. if fails, show error toast
    const script = await loadRazorpayScript();

    if(!script) {
      alert("Failed to load payment gateway. Please check your connection and try again.");
      return;
    }



    // order create
    const orderResponse = await createOrder(planId);
    // response - order id.
    const { order, key } = orderResponse || {};
    if(!order.id || !key) {
      alert("Failed to initiate payment. Please try again.");
      return;
    }

    // razor pay sdk -> orderid and open payment modal
    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async function (response) {
        alert("Payment successful! Transaction ID: " + response.razorpay_payment_id);
        // on successful payment, navigate to success page with transaction id and plan id as query params
      // verify the payment 
      // verify-payment 
       await verifyPayment({ planId, ...response });
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <ModuleScreen className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-black text-ink">Choose Your Plan</h2>
          <p className="text-muted text-sm mt-1">Four options tailored to your growth</p>
        </div>
        <PageHero backOnly onBack={() => navigate(-1)} className="shrink-0" />
      </div>

      <div className="rounded-[22px] border border-[#eedad4] bg-[#fff8f3] p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[15px] font-black text-ink">Unsure About Your Next Step?</div>
            <div className="text-[12px] font-medium text-muted">Speak to our Counsellor for guidance.</div>
          </div>
          <button
            type="button"
            className="rounded-full bg-brand px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
            onClick={() =>
              navigate("/app/settings", {
                state: {
                  openHelpCenter: true,
                },
              })
            }
          >
            Speak to our Counsellor
          </button>
        </div>
      </div>

      {/* Row setup for 4 cards: xs (1 card), sm (2 cards), lg (4 cards) */}
      <Row gutter={[16, 16]} justify="center">
      {plans.map((plan) => {
          const isSelected = activePlanIdSet.has(String(plan.id));
          const ribbonLabel = plan.highestseller ? "Best Seller" : plan.recommended ? "Recommended" : null;
          const ribbonClass = plan.highestseller
            ? "bg-[#d4a63a] text-[#fffaf0]"
            : "bg-[#9a2119] text-white";

          return (
            <Col xs={24} sm={12} lg={6} key={plan.id}>
              <Card
                className={`!h-full !rounded-2xl !transition-all !duration-300 shadow-sm hover:shadow-lg relative overflow-hidden flex flex-col ${
                  isSelected ? "!border-brand !border-2" : "!border-[#eedad4]"
                }`}
                bodyStyle={{ padding: "0", display: "flex", flexDirection: "column", flex: 1 }}
              >
               {ribbonLabel ? (
  <div className="pointer-events-none absolute right-0 top-0 z-10 h-[200px] w-[200px] overflow-hidden">
    {/* First ribbon */}
    {/* First ribbon */}
<div
  className={`absolute right-[-40px] top-[22px] w-[170px] rotate-45 whitespace-nowrap py-1.5 text-center text-[9px] font-black uppercase tracking-[0.14em] shadow-sm ${ribbonClass}`}
>
  {ribbonLabel}
</div>
{/* Second ribbon (only if both flags true) */}
{plan.highestseller && plan.recommended && (
  <div className="absolute right-[-40px] top-[50px] w-[170px] rotate-45 whitespace-nowrap py-1.5 text-center text-[9px] font-black uppercase tracking-[0.14em] shadow-sm bg-[#9a2119] text-white">
    Recommended
  </div>
)}
  </div>
) : null}

                {/* Header Area */}
              {/* Header Area */}
                <div className={`p-5 ${isSelected ? "bg-brand/5" : "bg-gray-50/50"}`}>
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="text-sm font-bold text-ink/40 uppercase tracking-widest">
                      {plan.name}
                    </div>
                  </div>
                  
                 <div className="flex items-baseline gap-1">
  <span className="text-3xl font-black text-brand">
    ₹{plan.price}
  </span>
  <span className="text-muted text-[10px] font-medium">
    /{plan.validity}
  </span>
</div>

                  {plan.descriptionList?.length ? (
                    <ul className="m-0 mt-3 list-none space-y-1.5 p-0">
                      {plan.descriptionList.map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckOutlined className="text-brand text-[11px] mt-1 flex-shrink-0" />
                          <span className="text-[12px] leading-snug text-ink/70">
                            {line}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

            
  {/* Features Area */}
                <div className="p-5 flex-grow">
<List
  split={false}
  dataSource={plan.modules.length ? plan.modules : ["No modules available"]}
  renderItem={(item) => (
    <List.Item className="!border-none !px-0 !py-1.5">
      <div className="flex items-start gap-2">
        <CheckOutlined className="text-brand text-[12px] mt-1 flex-shrink-0" />
        <span className="text-[13px] text-ink/80 leading-snug">
          {item}
        </span>
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
                    disabled={isSelected}
                    size="large"
                    className={`!h-11 !rounded-xl !text-sm !font-bold transition-transform active:scale-95 ${
                      isSelected ? "!bg-green-50 !text-green-400 !border-transparent !cursor-not-allowed" : "shadow-md"
                    }`}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isSelected ? "Current Plan" : "Choose Plan"}
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
