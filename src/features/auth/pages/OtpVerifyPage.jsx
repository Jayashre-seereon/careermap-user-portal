import { PhoneOutlined } from "@ant-design/icons";
import { Button, Input, Space } from "antd";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppState } from "../../../state/AppStateContext";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function OtpVerifyPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [params] = useSearchParams();
  const [otp, setOtp] = useState("");
  const next = params.get("next") || "/profile-setup";
  const identifier = params.get("identifier") || "your phone";

  return (
    <AuthShell title="Verify OTP" subtitle={`Enter the 4-digit code sent to ${identifier}.`} backTo="/login">
      <Space direction="vertical" size="large" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            borderRadius: "16px",
            padding: "16px 24px",
            background: "#fdf5f4",
            border: "1px solid rgba(154,33,25,0.15)",
            textAlign: "center",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "6px", color: "#9a2119" }}>
            <PhoneOutlined />
          </div>
          <div style={{ fontSize: "13px", color: "#888" }}>OTP sent to</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#9a2119" }}>{identifier}</div>
        </div>
        <div className="cm-otp" style={{ display: "flex", justifyContent: "center" }}>
          <Input.OTP length={4} value={otp} onChange={setOtp} />
        </div>
        <Button
          type="primary"
          block
          size="large"
          disabled={otp.length !== 4}
          onClick={() => {
            if (next.startsWith("/app")) {
              authenticate();
            }
            navigate(next);
          }}
          style={{ ...authPrimaryButtonStyle, width: "100%" }}
        >
          Verify and Continue
        </Button>
      </Space>
    </AuthShell>
  );
}
