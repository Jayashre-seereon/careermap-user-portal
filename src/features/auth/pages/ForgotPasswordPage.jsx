import { MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { existingUsers } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function sendReset() {
    const user = existingUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setMessage("User not exist with this email.");
      return;
    }

    setMessage("Reset code sent. Use 1234.");
    setStep("code");
  }

  function verifyCode() {
    if (code !== "1234") {
      setMessage("Invalid reset code.");
      return;
    }

    authenticate();
    navigate("/app/dashboard");
  }

  return (
    <AuthShell
      title={step === "email" ? "Forgot Password" : "Enter Reset Code"}
      subtitle={step === "email" ? "Enter your email to receive a reset code." : "Enter the 4-digit code to continue."}
      backTo="/login"
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {step === "email" ? (
          <>
            <Form layout="vertical" className="cm-form-label">
              <Form.Item label="Email Address">
                <Input
                  className="cm-input-field"
                  prefix={<MailOutlined style={{ color: "#9a2119" }} />}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  size="large"
                  style={{ borderRadius: "10px" }}
                />
              </Form.Item>
            </Form>
            <Button type="primary" size="large" block onClick={sendReset} style={{ ...authPrimaryButtonStyle, width: "100%" }}>
              Send Reset Link
            </Button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Enter the 4-digit code sent to your email</div>
              <div className="cm-otp" style={{ display: "flex", justifyContent: "center" }}>
                <Input.OTP length={4} value={code} onChange={setCode} />
              </div>
            </div>
            <Button type="primary" size="large" block onClick={verifyCode} style={{ ...authPrimaryButtonStyle, width: "100%" }}>
              Verify Code
            </Button>
          </>
        )}
        {message ? (
          <Alert
            type={message.includes("not exist") || message.includes("Invalid") ? "error" : "success"}
            message={message}
            style={{ borderRadius: "10px" }}
          />
        ) : null}
      </Space>
    </AuthShell>
  );
}
