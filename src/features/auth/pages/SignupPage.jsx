import { Button, Form, Input } from "antd";
import { Link } from "react-router-dom";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function SignupPage() {
  return (
    <AuthShell title="Create Account" subtitle="Join Career Map today." backTo="/auth-entry">
      <Form layout="vertical" className="cm-form-label" style={{ display: "grid", gap: "2px" }}>
        {["Full Name", "Email Address", "Mobile Number", "Password", "Confirm Password", "City", "State"].map((label) => (
          <Form.Item key={label} label={label}>
            {label.toLowerCase().includes("password") ? (
              <Input.Password className="cm-input-field" size="large" style={{ borderRadius: "10px" }} />
            ) : (
              <Input className="cm-input-field" size="large" style={{ borderRadius: "10px" }} />
            )}
          </Form.Item>
        ))}
        <Link to="/otp-verify">
          <Button type="primary" block size="large" style={authPrimaryButtonStyle}>
            Register
          </Button>
        </Link>
      </Form>
    </AuthShell>
  );
}
