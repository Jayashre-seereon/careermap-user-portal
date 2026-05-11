import { useEffect, useState } from "react";
import { Button, Col, Form, Input, List, Modal, Row } from "antd";
import { PageHero, SectionCard, Text } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function ProfilePage() {
  const { activePlanId, bookings, hasActiveSubscription, onboarding, profileEditRequestKey, savedCareers, saveUserProfile, subscriptionRecords, testHistory, userProfile } = useAppState();
  const { navigate } = usePortalNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(userProfile);

  useEffect(() => setForm(userProfile), [userProfile]);
  useEffect(() => {
    if (profileEditRequestKey > 0) setEditOpen(true);
  }, [profileEditRequestKey]);

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <SectionCard title="Saved Careers"><List dataSource={savedCareers} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        </Col>
        <Col xs={24} xl={8}>
          <SectionCard title="Test History"><List dataSource={testHistory} renderItem={(item) => <List.Item>{item.title} â€¢ {item.subtitle}</List.Item>} /></SectionCard>
        </Col>
        <Col xs={24} xl={8}>
          <SectionCard title="Mentor Bookings"><List dataSource={bookings} renderItem={(item) => <List.Item>{item.mentorName} â€¢ {item.date} â€¢ {item.time}</List.Item>} /></SectionCard>
        </Col>
      </Row>
      <SectionCard title="Subscription">
        {hasActiveSubscription ? <List dataSource={subscriptionRecords} renderItem={(item) => <List.Item>{item.planName} â€¢ {item.price} â€¢ {item.expiryDate}</List.Item>} /> : <Text>No active plan</Text>}
      </SectionCard>
      <div className="flex flex-wrap gap-3">
        <Button type="primary" onClick={() => setEditOpen(true)}>Edit Profile</Button>
        <Button onClick={() => navigate("/app/settings")}>Open Settings</Button>
      </div>
      <Modal open={editOpen} footer={null} onCancel={() => setEditOpen(false)} title="Edit Profile">
        <Form
          layout="vertical"
          onFinish={() => {
            saveUserProfile(form);
            setEditOpen(false);
          }}
        >
          {[
            ["name", onboarding.userType === "parent" ? "Parent Name" : "Full Name"],
            ["email", "Email Address"],
            ["mobile", "Mobile Number"],
            ["password", "Password"],
            ["address", "Address"],
            ["city", "City"],
            ["stateName", "State"],
            ["dob", "Date of Birth"],
          ].map(([key, label]) => (
            <Form.Item label={label} key={key}>
              <Input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
            </Form.Item>
          ))}
          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form>
      </Modal>
      <Text>Current plan: {hasActiveSubscription ? activePlanId : "No active plan"}</Text>
    </div>
  );
}
