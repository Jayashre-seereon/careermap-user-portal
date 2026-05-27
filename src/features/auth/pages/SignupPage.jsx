import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, sendSignupOtp } from "../../../api/authApi";
import { useAuthStore } from "../../../store/authStore";
import { formatOtpMobile, normalizeMobile } from "../../../utils/auth";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function SignupPage() {
  const navigate = useNavigate();
  const setSignupForm = useAuthStore((state) => state.setSignupForm);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  async function handleRegister() {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.city.trim() || !form.state.trim()) {
      setStatus({ type: "error", message: "Please fill all fields." });
      return;
    }

    if (normalizeMobile(form.mobile).length !== 10) {
      setStatus({ type: "error", message: "Enter a valid 10 digit mobile number." });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setStatus({ type: "error", message: "Password and confirm password must match." });
      return;
    }

    const otpMobile = formatOtpMobile(form.mobile);

    try {
      setIsSubmitting(true);
      setStatus(null);
      await sendSignupOtp(otpMobile);
      setSignupForm({
        ...form,
        mobile: normalizeMobile(form.mobile),
      });
      navigate(`/otp-verify?next=${encodeURIComponent("/profile-setup")}&identifier=${encodeURIComponent(otpMobile)}&otpType=signup`);
    } catch (error) {
      setStatus({
        type: "error",
        message: getApiErrorMessage(error, "Failed to send OTP."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create Account" subtitle="Join Career Map today." backTo="/auth-entry">
      <Form layout="vertical" className="cm-form-label" style={{ display: "grid", gap: "2px" }}>
        {[
          ["name", "Full Name"],
          ["email", "Email Address"],
          ["mobile", "Mobile Number"],
          ["password", "Password"],
          ["confirmPassword", "Confirm Password"],
          ["city", "City"],
          ["state", "State"],
        ].map(([key, label]) => (
          <Form.Item key={key} label={label}>
            {String(key).toLowerCase().includes("password") ? (
              <Input.Password
                className="cm-input-field"
                value={form[key]}
                onChange={(event) => update(key, event.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone twoToneColor="#9a2119" /> : <EyeInvisibleOutlined />)}
                size="large"
                style={{ borderRadius: "10px" }}
              />
            ) : (
              <Input
                className="cm-input-field"
                value={form[key]}
                onChange={(event) => update(key, key === "mobile" ? normalizeMobile(event.target.value) : event.target.value)}
                size="large"
                style={{ borderRadius: "10px" }}
              />
            )}
          </Form.Item>
        ))}
        <Button type="primary" block size="large" style={authPrimaryButtonStyle} onClick={handleRegister} disabled={isSubmitting}>
          {isSubmitting ? "Sending OTP..." : "Register"}
        </Button>
        {status ? <Alert type={status.type} title={status.message} style={{ borderRadius: "10px" }} /> : null}
      </Form>
    </AuthShell>
  );
}
