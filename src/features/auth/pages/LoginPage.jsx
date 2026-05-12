import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { existingUsers } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

const { Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authenticate } = useAppState();
  const [mode, setMode] = useState("mobile");
  const [status, setStatus] = useState(null);
  const [values, setValues] = useState({ mobile: "", coupon: "", email: "", password: "" });
  const isExistingUser = params.get("userType") === "existing";

  const knownMobileUser = useMemo(() => existingUsers.find((item) => item.mobile === values.mobile), [values.mobile]);
  const knownCouponUser = useMemo(() => existingUsers.find((item) => item.coupon === values.coupon.trim().toUpperCase()), [values.coupon]);
  const knownEmailUser = useMemo(
    () => existingUsers.find((item) => item.email.toLowerCase() === values.email.trim().toLowerCase()),
    [values.email],
  );

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  function goAfterAuth() {
    if (isExistingUser) {
      authenticate();
      navigate("/app/dashboard");
      return;
    }

    navigate("/profile-setup");
  }

  function sendOtp() {
    if (isExistingUser && !knownMobileUser) {
      setStatus({ type: "error", message: "User not exist with this mobile number." });
      return;
    }

    navigate(`/otp-verify?next=${encodeURIComponent(isExistingUser ? "/app/dashboard" : "/profile-setup")}&identifier=${values.mobile}`);
  }

  function loginCoupon() {
    if (isExistingUser && !knownCouponUser) {
      setStatus({ type: "error", message: "User not exist with this coupon code." });
      return;
    }

    goAfterAuth();
  }

  function loginEmail() {
    if (!knownEmailUser) {
      setStatus({ type: "error", message: "User not exist with this email." });
      return;
    }

    if (knownEmailUser.password !== values.password) {
      setStatus({ type: "error", message: "Incorrect password." });
      return;
    }

    authenticate();
    navigate("/app/dashboard");
  }

  return (
    <AuthShell
      title={isExistingUser ? "Welcome Back" : "Continue Your Journey"}
      subtitle={isExistingUser ? "Choose how you'd like to log in." : "Use OTP or coupon to continue."}
      backTo="/auth-entry"
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {isExistingUser ? (
          <div
            style={{
              borderRadius: "12px",
              padding: "12px 16px",
              background: "#fdf5f4",
              border: "1px solid rgba(154,33,25,0.2)",
              fontSize: "12px",
              color: "#5a2a27",
              lineHeight: "1.7",
            }}
          >
            <strong style={{ color: "#9a2119" }}>Example existing user</strong>
            <br />
            Mobile: 9876543210 | Email: jaya@email.com | Password: Jaya@123 | Coupon: CAREER2026
          </div>
        ) : null}

        <div style={{ display: "flex", gap: "6px", background: "#f7ece8", borderRadius: "12px", padding: "4px" }}>
          {(isExistingUser ? ["mobile", "coupon", "email"] : ["mobile", "coupon"]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              style={{
                flex: 1,
                padding: "8px 4px",
                border: "none",
                cursor: "pointer",
                borderRadius: "9px",
                fontSize: "13px",
                fontWeight: "700",
                background: mode === item ? "#9a2119" : "transparent",
                color: mode === item ? "#fff" : "#9a2119",
                transition: "all 0.2s",
                boxShadow: mode === item ? "0 2px 8px rgba(154,33,25,0.25)" : "none",
              }}
            >
              {item === "mobile" ? "Mobile OTP" : item === "coupon" ? "Coupon" : "Email"}
            </button>
          ))}
        </div>

        {mode === "mobile" ? (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Mobile Number">
              <Input
                className="cm-input-field"
                prefix={<PhoneOutlined style={{ color: "#9a2119" }} />}
                value={values.mobile}
                onChange={(event) => update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))}
                size="large"
                style={{ borderRadius: "10px" }}
              />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.mobile.length !== 10} onClick={sendOtp} style={{ ...authPrimaryButtonStyle, width: "100%" }}>
              Send OTP
            </Button>
          </Form>
        ) : null}

        {mode === "coupon" ? (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Institution Coupon Code">
              <Input
                className="cm-input-field"
                value={values.coupon}
                onChange={(event) => update("coupon", event.target.value.toUpperCase())}
                size="large"
                style={{ borderRadius: "10px", fontWeight: "700", letterSpacing: "2px" }}
              />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.coupon.length < 3} onClick={loginCoupon} style={{ ...authPrimaryButtonStyle, width: "100%" }}>
              {isExistingUser ? "Login with Coupon" : "Continue with Coupon"}
            </Button>
          </Form>
        ) : null}

        {mode === "email" && isExistingUser ? (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Email Address">
              <Input
                className="cm-input-field"
                prefix={<MailOutlined style={{ color: "#9a2119" }} />}
                value={values.email}
                onChange={(event) => update("email", event.target.value)}
                size="large"
                style={{ borderRadius: "10px" }}
              />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password
                className="cm-input-field"
                prefix={<LockOutlined style={{ color: "#9a2119" }} />}
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#9a2119" /> : <EyeInvisibleOutlined />)}
                size="large"
                style={{ borderRadius: "10px" }}
              />
            </Form.Item>
            <Button type="primary" block size="large" onClick={loginEmail} style={{ ...authPrimaryButtonStyle, width: "100%" }}>
              Login with Email
            </Button>
            <div style={{ marginTop: "10px" }}>
              <Link to="/forgot-password" style={{ fontSize: "13px", fontWeight: "700", color: "#9a2119" }}>
                Forgot Password?
              </Link>
            </div>
          </Form>
        ) : null}

        {status ? <Alert type={status.type} message={status.message} style={{ borderRadius: "10px" }} /> : null}

        <div style={{ textAlign: "center", fontSize: "13px", paddingTop: "4px" }}>
          <div style={{ marginBottom: "6px" }}>
            {isExistingUser ? (
              <Link to="/onboarding" style={{ color: "#9a2119", fontWeight: "600" }}>
                New user? Start onboarding
              </Link>
            ) : (
              <Link to="/auth-entry" style={{ color: "#9a2119", fontWeight: "600" }}>
                Existing user? Go to login options
              </Link>
            )}
          </div>
          <Text style={{ fontSize: "11px", color: "#bbb" }}>By continuing, you agree to Career Map&apos;s Terms of Service and Privacy Policy.</Text>
        </div>
      </Space>
    </AuthShell>
  );
}
