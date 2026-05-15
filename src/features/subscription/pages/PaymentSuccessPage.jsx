import { useEffect, useMemo } from "react";
import { Button, Divider, List, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { ArrowRightOutlined, CheckCircleOutlined, LockOutlined } from "@ant-design/icons";
import { subscriptions } from "../../../data/careermapData";
import { ModuleScreen } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

const { Text } = Typography;

export default function PaymentSuccessPage() {
  const { activatePlan, activePlanId } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const planId = params.get("planId");
  const returnTo = params.get("returnTo");
  const transactionId = params.get("transactionId");
  const plan = subscriptions.find((item) => item.id === planId) || subscriptions[0];
  const accessUntil = useMemo(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    });
  }, []);

  useEffect(() => {
    if (activePlanId !== plan.id) {
      activatePlan(plan.id);
    }
  }, [activePlanId, activatePlan, plan.id]);

  function resolveReturnPath(path) {
    if (!path) {
      return "/app/dashboard";
    }

    try {
      let decoded = path;
      while (decoded.includes("%")) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) {
          break;
        }
        decoded = next;
      }
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
    <ModuleScreen maxWidthClass="max-w-[22rem]" className="flex min-h-[72vh] items-center justify-center py-6">
      <div className="w-full">
        <div className="overflow-hidden rounded-[28px] border border-[#edd8d4] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="bg-[#a6251d] px-6 pb-16 pt-7 text-center text-white">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10">
              <CheckCircleOutlined className="text-[21px] text-white" />
            </div>
            <h1 className="m-0 font-serif text-[28px] font-bold text-white">Payment Successful</h1>
            <p className="mt-1.5 text-[13px] text-white/85">
              Your account has been upgraded to <strong>{plan.name}</strong>.
            </p>
          </div>

          <div className="relative -mt-11 px-4 pb-5">
            <div className="rounded-[24px] bg-white px-4 pb-4 pt-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="rounded-[16px] border border-dashed border-[#e5b0a8] bg-[#fdf5f4] p-3.5">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#b64a40]">
                Transaction Details
                </div>

                <List
                  split={false}
                  className="!p-0"
                  dataSource={[
                    ["Order ID", transactionId || "TXN-CONFIRMED"],
                    ["Selected plan", plan.name],
                    ["Amount paid", plan.price],
                    ["Access until", accessUntil],
                  ]}
                  renderItem={([label, value]) => (
                    <List.Item className="!border-none !px-0 !py-1 flex justify-between items-baseline gap-4">
                      <span className="text-xs text-[#6f6663]">{label}</span>
                      <span className="text-xs font-bold text-[#1a0a09] text-right">{value}</span>
                    </List.Item>
                  )}
                />

                <Divider className="my-3 !border-[#e7d8d2]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#1a0a09]">Status</span>
                  <span className="rounded-full border border-[#e4aca6] bg-[#fff1ef] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#b43f34]">
                    Confirmed
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#8e817d]">
                <LockOutlined className="text-[#b43f34]" />
                <Text className="!text-[11px] !text-[#8e817d]">Secured by 256-bit encryption</Text>
              </div>

              <Button
                block
                size="large"
                onClick={handleContinue}
                className="!mt-4 !h-10 !rounded-xl !border-[#cfc7c3] !bg-white !text-[15px] !font-semibold !text-[#1a0a09] hover:!border-[#b43f34] hover:!text-[#b43f34]"
              >
                <span className="inline-flex items-center gap-2">
                  Continue
                  <ArrowRightOutlined />
                </span>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-3 px-6 text-center text-[10px] leading-relaxed text-[#7f7470]">
          A confirmation email has been sent to your registered address.
          <br />
          Need help? <span className="font-bold text-[#b43f34]">Contact Support</span>
        </p>
      </div>
    </ModuleScreen>
  );
}
