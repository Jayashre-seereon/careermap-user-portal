import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Input, List, Modal, Result, Row, Space, Statistic, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { studyAbroadCountries } from "../../../data/careermapData";
import { PageHero, SectionCard, SoftTag, Text, Title } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function AbroadPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("abroad-consultancy");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [values, setValues] = useState({ preferredCountry: "", courseInterest: "", budgetRange: "", preferredIntake: "" });

  function buildAbroadReturnTo(countryName = selectedCountry?.name) {
    const nextParams = new URLSearchParams();
    if (countryName) nextParams.set("country", countryName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    const countryName = params.get("country");
    if (!countryName) return;
    const country = studyAbroadCountries.find((item) => item.name === countryName);
    if (country) setSelectedCountry(country);
  }, [params]);

  if (submitted) {
    return <Result status="success" title="Our team will contact you shortly" subTitle="Your study abroad consultation request has been recorded." extra={<Button type="primary" onClick={() => { setSubmitted(false); setFormOpen(false); }}>Done</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={studyAbroadCountries}
        renderItem={(country) => {
          const countryFree = unlocked || canAccessFreeDetail("abroad-consultancy", country.name);
          return (
            <List.Item>
              <Card
                hoverable
                className="!h-full !border-[#eedad4]"
                onClick={() => {
                  if (!unlocked && !countryFree) {
                    setUnlockModalItem(country.name);
                    return;
                  }
                  registerFreeDetailAccess("abroad-consultancy", country.name);
                  setSelectedCountry(country);
                }}
              >
                <Space direction="vertical" className="!w-full !pr-24">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-lg font-black text-ink">{country.name}</div>
                    {!unlocked ? <SoftTag color={countryFree ? "green" : "default"}>{countryFree ? "FREE" : "LOCK"}</SoftTag> : null}
                  </div>
                  <Text>{country.description}</Text>
                  <Text className="!text-brand">{country.tuition}</Text>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
      {!unlocked ? <PremiumGate title="Unlock Study Abroad" description="Subscribe to more country details, scholarships, visa guidance, and counselling access." returnTo={buildAbroadReturnTo()} /> : null}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Study Abroad"
        itemLabel={unlockModalItem}
        description="Your free study abroad access has been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildAbroadReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />
      <Modal open={Boolean(selectedCountry)} footer={null} onCancel={() => setSelectedCountry(null)} width={900}>
        {selectedCountry ? (
          <div className="space-y-6">
            <Title level={3}>{selectedCountry.name}</Title>
            <Typography.Paragraph>{selectedCountry.detail}</Typography.Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}><Card><Statistic title="Tuition" value={selectedCountry.tuition} /></Card></Col>
              <Col xs={24} md={12}><Card><Statistic title="Living Cost" value={selectedCountry.living} /></Card></Col>
            </Row>
            <SectionCard title="Popular Courses"><Space wrap>{selectedCountry.popularCourses.map((course) => <SoftTag key={course} color="red">{course}</SoftTag>)}</Space></SectionCard>
            <SectionCard title="Top Universities"><List dataSource={selectedCountry.topUniversities} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <SectionCard title="Scholarships"><List dataSource={selectedCountry.scholarships} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <SectionCard title="Requirements"><List dataSource={selectedCountry.requirements} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <Button type="primary" onClick={() => { setValues((current) => ({ ...current, preferredCountry: selectedCountry.name })); setFormOpen(true); }}>
              Consult Now
            </Button>
          </div>
        ) : null}
      </Modal>
      <Modal open={formOpen} footer={null} onCancel={() => setFormOpen(false)} title="Consultation Form">
        <Form layout="vertical" onFinish={() => (unlocked ? setSubmitted(true) : null)}>
          <Form.Item label="Preferred Country"><Input value={values.preferredCountry} onChange={(event) => setValues((current) => ({ ...current, preferredCountry: event.target.value }))} /></Form.Item>
          <Form.Item label="Course Interest"><Input value={values.courseInterest} onChange={(event) => setValues((current) => ({ ...current, courseInterest: event.target.value }))} /></Form.Item>
          <Form.Item label="Budget Range"><Input value={values.budgetRange} onChange={(event) => setValues((current) => ({ ...current, budgetRange: event.target.value }))} /></Form.Item>
          <Form.Item label="Preferred Intake"><Input value={values.preferredIntake} onChange={(event) => setValues((current) => ({ ...current, preferredIntake: event.target.value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">{unlocked ? "Submit Request" : "Subscribe to Submit"}</Button>
        </Form>
      </Modal>
    </div>
  );
}
