import { useEffect, useState } from "react";
import { Alert, Button, Col, Input, Radio, Result, Row, Select, Space, Divider } from "antd";
import { useSearchParams } from "react-router-dom";
import { 
  CreditCardOutlined, 
  ThunderboltOutlined, 
  BankOutlined, 
  SafetyCertificateFilled,
  ArrowLeftOutlined 
} from "@ant-design/icons";
import { subscriptions } from "../../../data/careermapData";
import { ModuleScreen } from "../../../components/ui";
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
    <ModuleScreen maxWidthClass="max-w-4xl" className="space-y-6 lg:mt-6">
      {/* Mini Header */}
      <div className="flex items-center justify-between">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="!text-muted hover:!text-brand"
        >
          Back to Plans
        </Button>
        <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold uppercase tracking-widest">
          <SafetyCertificateFilled /> Secure Checkout
        </div>
      </div>

      {processing ? (
        <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
          <Result 
            status="info" 
            title={<span className="text-xl font-bold">Verifying Payment</span>}
            subTitle="This will only take a moment..." 
          />
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {/* LEFT: Concise Payment Form */}
          <Col xs={24} lg={15}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-gray-50">
                <h2 className="text-base font-black text-ink m-0">Payment Method</h2>
              </div>
              
              <div className="p-5 space-y-6">
                <Radio.Group 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full"
                >
                  <div className="flex gap-2">
                    {[
                      { id: "upi", label: "UPI", icon: <ThunderboltOutlined /> },
                      { id: "card", label: "Card", icon: <CreditCardOutlined /> },
                      { id: "netbanking", label: "Net Bank", icon: <BankOutlined /> },
                    ].map((m) => (
                      <Radio.Button 
                        key={m.id}
                        value={m.id}
                        className={`!h-12 !flex-1 !flex !items-center !justify-center !rounded-lg !border-2 !transition-all
                          ${method === m.id ? '!border-brand !bg-brand/5 !text-brand' : '!border-gray-50 !text-muted hover:!border-brand/30'}`}
                      >
                        <Space size="small">
                          <span className="text-xs font-bold">{m.label}</span>
                        </Space>
                      </Radio.Button>
                    ))}
                  </div>
                </Radio.Group>

                <div className="min-h-[140px]">
                  {method === "upi" && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">UPI ID</label>
                      <Input 
                        placeholder="yourname@upi" 
                        className="!rounded-lg !h-11"
                        value={values.upiId} 
                        onChange={(e) => update("upiId", e.target.value)} 
                      />
                    </div>
                  )}

                  {method === "card" && (
                    <Row gutter={[10, 12]}>
                      <Col xs={24}>
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Cardholder Name</label>
                        <Input placeholder="Full Name" className="!rounded-lg !h-10 mt-1" value={values.cardName} onChange={(e) => update("cardName", e.target.value)} />
                      </Col>
                      <Col xs={24}>
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Card Number</label>
                        <Input placeholder="0000 0000 0000 0000" className="!rounded-lg !h-10 mt-1" value={values.cardNumber} onChange={(e) => update("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16))} />
                      </Col>
                      <Col xs={12}>
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Expiry</label>
                        <Input placeholder="MM/YY" className="!rounded-lg !h-10 mt-1" value={values.cardExpiry} onChange={(e) => update("cardExpiry", e.target.value)} />
                      </Col>
                      <Col xs={12}>
                        <label className="text-[11px] font-bold text-muted uppercase tracking-wider">CVV</label>
                        <Input type="password" placeholder="***" className="!rounded-lg !h-10 mt-1" value={values.cardCvv} onChange={(e) => update("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 4))} />
                      </Col>
                    </Row>
                  )}

                  {method === "netbanking" && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-muted uppercase tracking-wider">Select Bank</label>
                      <Select 
                        className="w-full !rounded-lg !h-11"
                        placeholder="Choose your bank" 
                        options={["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak"].map((bank) => ({ label: bank, value: bank }))} 
                        value={values.bank || undefined} 
                        onChange={(value) => update("bank", value)} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {/* RIGHT: Compact Order Summary */}
          <Col xs={24} lg={9}>
            <div className="bg-white rounded-2xl border border-[#eedad4] p-5 shadow-soft">
              <h3 className="text-sm font-black text-ink mb-4 uppercase tracking-tighter">Summary</h3>
              
              <div className="space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-xs text-muted">{plan.name} Plan</span>
                  <span className="text-xs font-bold text-ink">{plan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">GST (0%)</span>
                  <span className="text-xs font-bold text-green-600">Included</span>
                </div>
              </div>

              <Divider className="my-4" />

              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-ink">Total</span>
                <span className="text-xl font-black text-brand">{plan.price}</span>
              </div>

              <Button 
                type="primary" 
                size="large" 
                block 
                disabled={!canPay} 
                onClick={() => setProcessing(true)}
                className="!h-12 !rounded-xl !text-sm !font-bold shadow-lg shadow-brand/20"
              >
                Complete Payment
              </Button>
              
              <p className="text-[10px] text-center text-muted mt-4 px-4 leading-relaxed">
                By clicking, you agree to the Terms of Service. Your data is protected.
              </p>
            </div>
          </Col>
        </Row>
      )}
    </ModuleScreen>
  );
}
