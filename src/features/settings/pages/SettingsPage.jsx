import { useState } from "react";
import { Alert, Button, Collapse, Form, Input } from "antd";
import { PageHero, SectionCard } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function SettingsPage() {
  const { logout, preferences, requestProfileEdit, toggleDarkMode } = useAppState();
  const { navigate } = usePortalNavigation();
  const [view, setView] = useState("menu");
  const [feedback, setFeedback] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [helpForm, setHelpForm] = useState({ email: "", message: "" });

  if (view === "password") {
    return (
      <SectionCard title="Change Password" extra={<Button onClick={() => setView("menu")}>Back</Button>}>
        <Form layout="vertical">
          <Form.Item label="Current Password"><Input.Password value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} /></Form.Item>
          <Form.Item label="New Password"><Input.Password value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} /></Form.Item>
          <Form.Item label="Confirm Password"><Input.Password value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} /></Form.Item>
          <Button type="primary" onClick={() => setFeedback("Password changed successfully.")}>Save Password</Button>
          {feedback ? <Alert className="mt-4" type="success" message={feedback} /> : null}
        </Form>
      </SectionCard>
    );
  }

  if (view === "help") {
    return (
      <SectionCard title="Help Centre" extra={<Button onClick={() => setView("menu")}>Back</Button>}>
        <Form layout="vertical">
          <Form.Item label="Your Email"><Input value={helpForm.email} onChange={(event) => setHelpForm((current) => ({ ...current, email: event.target.value }))} /></Form.Item>
          <Form.Item label="Message"><Input.TextArea rows={6} value={helpForm.message} onChange={(event) => setHelpForm((current) => ({ ...current, message: event.target.value }))} /></Form.Item>
          <Button type="primary" onClick={() => setFeedback("Help request sent successfully.")}>Send to Email Support</Button>
          {feedback ? <Alert className="mt-4" type="success" message={feedback} /> : null}
        </Form>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      {feedback ? <Alert type="success" message={feedback} /> : null}
      <Collapse
        items={[
          { key: "profile", label: "Edit Profile", children: <Button onClick={() => { requestProfileEdit(); navigate("/app/profile"); }}>Open profile editor</Button> },
          { key: "password", label: "Change Password", children: <Button onClick={() => setView("password")}>Open password form</Button> },
          { key: "theme", label: preferences.darkMode ? "Light Mode" : "Dark Mode", children: <Button onClick={toggleDarkMode}>Toggle Theme</Button> },
          { key: "help", label: "Help Centre", children: <Button onClick={() => setView("help")}>Open help centre</Button> },
        ]}
      />
      <Button danger onClick={() => { logout(); navigate("/auth-entry"); }}>
        Logout
      </Button>
    </div>
  );
}
