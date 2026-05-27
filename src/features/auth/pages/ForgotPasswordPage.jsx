import { Alert, Typography } from "antd";
import { AuthShell } from "../components/AuthShell";

const { Paragraph } = Typography;

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Forgot Password" subtitle="Reset password support is not connected yet." backTo="/login">
      <Alert
        type="info"
        title="Password reset is not connected to the backend yet."
        description={
          <Paragraph style={{ margin: 0 }}>
            Please use mobile OTP login or contact support until the reset API is added.
          </Paragraph>
        }
        style={{ borderRadius: "12px" }}
      />
    </AuthShell>
  );
}
