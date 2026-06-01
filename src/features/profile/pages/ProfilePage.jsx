import { useEffect, useMemo, useState } from "react";
import { Avatar, Alert, Button, Col, Form, Input, List, Modal, Row, Space, Tag, message } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  EditOutlined,
  HistoryOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ModuleScreen, PageHero, SectionCard } from "../../../components/ui";
import { getApiErrorMessage } from "../../../api/authApi";
import { updateUserProfile } from "../../../api/userApi";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";
import { buildUsername, mapApiUserToProfile, splitFullName } from "../../../utils/auth";

export default function ProfilePage() {
  const {
    bookings,
    hasActiveSubscription,
    onboarding,
    profileEditRequestKey,
    savedCareers,
    saveUserProfile,
    subscriptionRecords,
    testHistory,
    userProfile,
  } = useAppState();

  const { navigate } = usePortalNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState(userProfile);

  useEffect(() => {
    setForm(userProfile);
  }, [userProfile]);

  useEffect(() => {
    if (profileEditRequestKey > 0) {
      setEditOpen(true);
    }
  }, [profileEditRequestKey]);

  const profileName = useMemo(() => userProfile.name || "Your profile", [userProfile.name]);
  const profileEmail = useMemo(() => userProfile.email || "No email added yet", [userProfile.email]);

  const scrollableCardClass = "h-[320px] overflow-y-auto scrollbar-hide";

  async function handleProfileSave() {
    const { firstName, lastName } = splitFullName(form.name);
    const payload = {
      firstName,
      lastName,
      username: buildUsername(form.name, form.email),
      email: form.email?.trim(),
      country: form.country?.trim(),
      state: form.stateName?.trim(),
      city: form.city?.trim(),
      district: form.district?.trim(),
      gender: form.gender,
      address: form.address?.trim(),
      dataOfBirth: form.dob ? new Date(form.dob).toISOString() : undefined,
    };

    try {
      setIsSavingProfile(true);
      setStatus(null);

      const response = await updateUserProfile(payload);
      const mappedProfile = mapApiUserToProfile(response?.data || response?.user || response);

      if (mappedProfile) {
        saveUserProfile({
          ...userProfile,
          ...mappedProfile,
          mobile: userProfile.mobile,
          password: userProfile.password,
          childName: userProfile.childName,
        });
      } else {
        saveUserProfile({
          ...userProfile,
          ...form,
        });
      }

      setEditOpen(false);
      message.success(response?.message || "Profile updated successfully");
      setStatus({
        type: "success",
        message: response?.message || "Profile updated successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: getApiErrorMessage(error, "Failed to update profile."),
      });
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <ModuleScreen className="space-y-8">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-[#eedad4] bg-white p-6 shadow-soft md:flex-row md:items-center">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          <Avatar size={80} icon={<UserOutlined />} className="bg-brand/10 text-brand border-2 border-brand/20" />
          <div className="text-center md:text-left">
            <h1 className="m-0 text-2xl font-black text-ink">{profileName}</h1>
            <p className="m-0 text-muted">{profileEmail}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
              <Tag color="gold" className="!m-0 !rounded-full !px-3 !font-bold">
                {hasActiveSubscription ? "Subscribed" : "Free tier"}
              </Tag>
              <Tag className="!m-0 !rounded-full !px-3 !font-bold">
                {bookings.length} bookings
              </Tag>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            icon={<EditOutlined />}
            onClick={() => setEditOpen(true)}
            className="!h-11 !rounded-xl font-bold"
          >
            Edit Profile
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => navigate("/app/settings")}
            className="!h-11 !rounded-xl font-bold"
          >
            Settings
          </Button>
        </div>
      </div>

      {status ? <Alert type={status.type} message={status.message} showIcon /> : null}

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <SectionCard title={<Space><BookOutlined className="text-brand" /> Saved Careers</Space>}>
            <div className={scrollableCardClass}>
              <List
                dataSource={savedCareers}
                renderItem={(item) => (
                  <List.Item className="!px-0 !border-gray-50">
                    <div className="flex w-full items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand" />
                      <span className="text-sm font-medium text-ink">{item}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </SectionCard>
        </Col>

        <Col xs={24} lg={8}>
          <SectionCard title={<Space><HistoryOutlined className="text-brand" /> Test History</Space>}>
            <div className={scrollableCardClass}>
              <List
                dataSource={testHistory}
                renderItem={(item) => (
                  <List.Item className="!items-start !px-0 !py-3">
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-ink">{item.title}</div>
                      <div className="mt-1 text-xs text-muted">{item.subtitle}</div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </SectionCard>
        </Col>

        <Col xs={24} lg={8}>
          <SectionCard title={<Space><CalendarOutlined className="text-brand" /> Mentor Bookings</Space>}>
            <div className={scrollableCardClass}>
              <List
                dataSource={bookings}
                renderItem={(item) => (
                  <List.Item className="!px-0 !py-3">
                    <div className="flex w-full flex-col gap-1">
                      <div className="text-sm font-bold text-ink">{item.mentorName}</div>
                      <div className="flex w-full justify-between gap-2">
                        <span className="text-xs italic text-muted">{item.date}</span>
                        <Tag className="!m-0 !text-[10px]">{item.time}</Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </SectionCard>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <SectionCard title={<Space><CreditCardOutlined className="text-brand" /> Subscription Plan</Space>}>
            {hasActiveSubscription ? (
              <List
                dataSource={subscriptionRecords}
                className="w-full"
                renderItem={(item) => (
                  <div className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-brand/10 p-3">
                        <CreditCardOutlined className="text-xl text-brand" />
                      </div>
                      <div>
                        <span className="block text-xs font-black uppercase tracking-[0.18em] text-brand">
                          {item.planName}
                        </span>
                        <span className="text-sm font-bold text-ink">Active Subscription</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <span className="block text-xs font-bold uppercase text-muted">Expiry Date</span>
                      <span className="font-bold text-ink">{item.expiryDate}</span>
                    </div>
                    <Tag color="green" className="!m-0 !rounded-full !px-4 !font-bold uppercase">
                      Active
                    </Tag>
                  </div>
                )}
              />
            ) : (
              <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gray-50 p-6 md:flex-row md:items-center">
                <p className="m-0 text-sm text-muted">You are currently on the Free Tier</p>
                <Button type="primary" className="!rounded-xl font-bold" onClick={() => navigate("/app/subscription")}>
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </SectionCard>
        </Col>
      </Row>

      <Modal
        open={editOpen}
        footer={null}
        onCancel={() => setEditOpen(false)}
        title={<span className="text-xl font-black">Edit Profile</span>}
        className="!rounded-3xl"
        centered
      >
        <Form layout="vertical" className="mt-4" onFinish={handleProfileSave}>
          <div className="grid grid-cols-2 gap-x-4">
            {[
              ["name", onboarding.userType === "parent" ? "Parent Name" : "Full Name", 2],
              ["email", "Email Address", 2],
              ["mobile", "Mobile Number", 1],
              ["dob", "Date of Birth", 1],
              ["city", "City", 1],
              ["stateName", "State", 1],
              ["address", "Detailed Address", 2],
            ].map(([key, label, span]) => (
              <Form.Item
                label={<span className="text-xs font-bold uppercase text-muted">{label}</span>}
                key={key}
                className={span === 2 ? "col-span-2" : "col-span-1"}
              >
                <Input
                  value={form[key] || ""}
                  readOnly={key === "mobile"}
                  className="!h-11 !rounded-xl"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, [key]: event.target.value }))
                  }
                />
                {key === "mobile" ? (
                  <div className="mt-2 text-xs text-muted">Mobile number is managed through OTP verification.</div>
                ) : null}
              </Form.Item>
            ))}
          </div>

          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            loading={isSavingProfile}
            className="mt-4 !h-12 !rounded-xl font-bold shadow-lg shadow-brand/20"
          >
            Save Profile Changes
          </Button>
        </Form>
      </Modal>
    </ModuleScreen>
  );
}
