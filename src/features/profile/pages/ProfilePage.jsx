import { useEffect, useState } from "react";
import { Button, Col, Form, Input, List, Modal, Row, Avatar, Tag, Space } from "antd";
import { 
  UserOutlined, 
  BookOutlined, 
  HistoryOutlined, 
  CalendarOutlined, 
  CreditCardOutlined, 
  EditOutlined,
  SettingOutlined 
} from "@ant-design/icons";
import { ModuleScreen, PageHero, SectionCard } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

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
    userProfile 
  } = useAppState();
  
  const { navigate } = usePortalNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(userProfile);

  useEffect(() => setForm(userProfile), [userProfile]);
  useEffect(() => {
    if (profileEditRequestKey > 0) setEditOpen(true);
  }, [profileEditRequestKey]);

  // Shared class for uniform height and internal scrolling
  const scrollableCardClass = "h-[320px] overflow-y-auto scrollbar-hide";

  return (
    <ModuleScreen className="space-y-8">
      <PageHero backOnly onBack={() => navigate(-1)} />

      {/* 1. Header Profile Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Avatar size={80} icon={<UserOutlined />} className="bg-brand/10 text-brand border-2 border-brand/20" />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black text-ink m-0">{userProfile.name}</h1>
            <p className="text-muted m-0">{userProfile.email}</p>
           
          </div>
        </div>
        <div className="flex gap-3">
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)} className="!rounded-xl !h-11 font-bold">Edit Profile</Button>
          <Button icon={<SettingOutlined />} onClick={() => navigate("/app/settings")} className="!rounded-xl !h-11 font-bold">Settings</Button>
        </div>
      </div>

      {/* 2. Activity Grid - Uniform Height with Scrolling */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={8}>
          <SectionCard title={<Space><BookOutlined className="text-brand" /> Saved Careers</Space>}>
            <div className={scrollableCardClass}>
              <List 
                dataSource={savedCareers} 
                renderItem={(item) => (
                  <List.Item className="!px-0 !border-gray-50">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-2 h-2 rounded-full bg-brand" />
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
                  <List.Item className="!px-0 flex-col !items-start !py-3">
                    <div className="text-sm font-bold text-ink">{item.title}</div>
                    <div className="text-xs text-muted mt-1">{item.subtitle}</div>
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
                    <div className="flex flex-col gap-1 w-full">
                      <div className="text-sm font-bold text-ink">{item.mentorName}</div>
                      <div className="flex justify-between w-full">
                        <span className="text-xs text-muted italic">{item.date}</span>
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

      {/* 3. Subscription - Full Width & Slim Design */}
      <Row>
        <Col span={24}>
          <SectionCard title={<Space><CreditCardOutlined className="text-brand" /> Subscription Plan</Space>}>
            {hasActiveSubscription ? (
              <List 
                dataSource={subscriptionRecords} 
                className="w-full"
                renderItem={(item) => (
                  <div className="bg-gray-50 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-brand/10 p-3 rounded-xl">
                        <CreditCardOutlined className="text-brand text-xl" />
                      </div>
                      <div>
                        <span className="font-black text-brand uppercase text-xs block">{item.planName}</span>
                        <span className="text-ink font-bold text-sm">Active Subscription</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-muted text-xs block uppercase font-bold">Expiry Date</span>
                      <span className="text-ink font-bold">{item.expiryDate}</span>
                    </div>
                    <Tag color="green" className="!rounded-full px-4 font-bold uppercase">Active</Tag>
                  </div>
                )} 
              />
            ) : (
              <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl">
                <p className="text-muted text-sm m-0">You are currently on the Free Tier</p>
                <Button type="primary" className="!rounded-xl font-bold" onClick={() => navigate("/app/subscription")}>Upgrade to Pro</Button>
              </div>
            )}
          </SectionCard>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal open={editOpen} footer={null} onCancel={() => setEditOpen(false)} title={<span className="text-xl font-black">Edit Profile</span>} className="!rounded-3xl" centered>
        <Form layout="vertical" className="mt-4" onFinish={() => { saveUserProfile(form); setEditOpen(false); }}>
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
              <Form.Item label={<span className="text-xs font-bold text-muted uppercase">{label}</span>} key={key} className={span === 2 ? "col-span-2" : "col-span-1"}>
                <Input value={form[key]} className="!rounded-xl !h-11" onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
              </Form.Item>
            ))}
          </div>
          <Button type="primary" size="large" block htmlType="submit" className="!h-12 !rounded-xl font-bold mt-4 shadow-lg shadow-brand/20">Save Profile Changes</Button>
        </Form>
      </Modal>
    </ModuleScreen>
  );
}
