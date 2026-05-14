import { useEffect } from "react";
import { Button, List, Result, Typography, Divider } from "antd";
import { useSearchParams } from "react-router-dom";
import { CheckCircleFilled, ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import { subscriptions } from "../../../data/careermapData";
import { ModuleScreen } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const { Text } = Typography;

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

  function resolveReturnPath(path) {
    if (!path) {
      return "/app/dashboard";
    }

    try {
      const decoded = decodeURIComponent(path);
      return decoded || "/app/dashboard";
    } catch {
      return path;
    }
  }

  const handleContinue = () => {
    const destination = resolveReturnPath(returnTo);
    navigate(destination);
  };

  return (
    <ModuleScreen maxWidthClass="max-w-md" className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full">
        {/* Main Success Card */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
              <CheckCircleFilled className="text-green-500 text-5xl" />
            </div>
            <h1 className="text-2xl font-black text-ink m-0">Payment Successful!</h1>
            <p className="text-muted text-sm mt-2 px-8">
              Your account has been upgraded to <strong>{plan.name}</strong>.
            </p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Receipt Section */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-dashed border-gray-200">
              <div className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-4">
                Transaction Details
              </div>
              
              <List
                split={false}
                className="!p-0"
                dataSource={[
                  ["Order ID", transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`],
                  ["Selected Plan", plan.name],
                  ["Amount Paid", plan.price],
                  ["Access Until", "May 2027"], // Example: current date + 1 year
                ]}
                renderItem={([label, value]) => (
                  <List.Item className="!border-none !py-1.5 !px-0 flex justify-between items-baseline">
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-xs font-bold text-ink">{value}</span>
                  </List.Item>
                )}
              />
              
              <Divider className="my-4 !border-gray-200" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">Status</span>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded uppercase">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                type="primary" 
                size="large" 
                block 
                icon={<ArrowRightOutlined />}
                onClick={handleContinue}
                className="!h-14 !rounded-2xl !text-base !font-bold shadow-lg shadow-brand/20"
              >
                Continue
              </Button>
              
             
            </div>
          </div>
        </div>

        {/* Footer Support Info */}
        <p className="text-center text-muted text-[11px] mt-6 px-10 leading-relaxed">
          A confirmation email has been sent to your registered address. 
          Need help? <span className="text-brand font-bold cursor-pointer">Contact Support</span>
        </p>
      </div>
    </ModuleScreen>
  );
}
