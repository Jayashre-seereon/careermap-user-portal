import { useEffect, useState } from "react";
import { Alert, Button, Col, Input, Radio, Result, Row, Select, Space, Statistic } from "antd";
import { useSearchParams } from "react-router-dom";
import { subscriptions } from "../../../data/careermapData";
import { PageHero, SectionCard } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function CheckoutPage() {
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const planId = params.get("planId");
  const returnTo = params.get("returnTo");
  const plan = subscriptions.find((item) => item.id === planId) || subscriptions[0];
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [values, setValues] = useState({ upiId: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", bank: "" });

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const canPay =
    method === "upi"
      ? values.upiId.includes("@")
      : method === "card"
        ? values.cardName && values.cardNumber.length === 16 && values.cardExpiry && values.cardCvv.length >= 3
        : Boolean(values.bank);

  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => navigate(`/payment-success?planId=${plan.id}&transactionId=TXN${Date.now().toString().slice(-8)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`), 1600);
    return () => clearTimeout(timer);
  }, [navigate, plan.id, processing, returnTo]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero backOnly onBack={() => navigate(-1)} />
      {processing ? (
        <Result status="info" title="Processing payment" subTitle={`Please wait while we verify your ${method} payment.`} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <SectionCard title="Order Summary">
              <Space direction="vertical" size="middle" className="!w-full">
                <Statistic title="Plan" value={plan.name} />
                <Statistic title="Total Payable" value={plan.price} />
                <Statistic title="Validity" value="1 Year" />
              </Space>
            </SectionCard>
          </Col>
          <Col xs={24} lg={14}>
            <SectionCard title="Choose Payment Method">
              <Space direction="vertical" size="large" className="!w-full">
                <Radio.Group value={method} onChange={(event) => setMethod(event.target.value)}>
                  <Space direction="vertical">
                    <Radio value="upi">UPI</Radio>
                    <Radio value="card">Card</Radio>
                    <Radio value="netbanking">Net Banking</Radio>
                  </Space>
                </Radio.Group>
                {method === "upi" ? <Input placeholder="yourname@upi" value={values.upiId} onChange={(event) => update("upiId", event.target.value)} /> : null}
                {method === "card" ? (
                  <Row gutter={[12, 12]}>
                    <Col xs={24}><Input placeholder="Name on card" value={values.cardName} onChange={(event) => update("cardName", event.target.value)} /></Col>
                    <Col xs={24}><Input placeholder="1234567890123456" value={values.cardNumber} onChange={(event) => update("cardNumber", event.target.value.replace(/\D/g, "").slice(0, 16))} /></Col>
                    <Col xs={12}><Input placeholder="MM/YY" value={values.cardExpiry} onChange={(event) => update("cardExpiry", event.target.value)} /></Col>
                    <Col xs={12}><Input placeholder="CVV" value={values.cardCvv} onChange={(event) => update("cardCvv", event.target.value.replace(/\D/g, "").slice(0, 4))} /></Col>
                  </Row>
                ) : null}
                {method === "netbanking" ? <Select placeholder="Select Bank" options={["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak"].map((bank) => ({ label: bank, value: bank }))} value={values.bank || undefined} onChange={(value) => update("bank", value)} /> : null}
                <Alert type="success" showIcon message="Secure Payment" description="Your checkout is protected with encrypted verification." />
                <Button type="primary" size="large" disabled={!canPay} onClick={() => setProcessing(true)}>
                  Pay {plan.price}
                </Button>
              </Space>
            </SectionCard>
          </Col>
        </Row>
      )}
    </div>
  );
}
