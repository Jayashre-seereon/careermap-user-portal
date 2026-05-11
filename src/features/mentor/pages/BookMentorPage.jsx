import { useEffect, useState } from "react";
import { Button, Card, Col, DatePicker, Input, List, Modal, Radio, Result, Row, Select, Space, Typography } from "antd";
import { useSearchParams } from "react-router-dom";
import { mentors } from "../../../data/careermapData";
import { PageHero, SoftTag, Text, Title } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { PremiumGate, UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function BookMentorPage() {
  const { addBooking, canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const [params] = useSearchParams();
  const unlocked = isUnlocked("book-mentor");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentValues, setPaymentValues] = useState({ upiId: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", bank: "" });

  function buildMentorReturnTo(mentorName = selectedMentor?.name) {
    const nextParams = new URLSearchParams();
    if (mentorName) nextParams.set("mentor", mentorName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    const mentorName = params.get("mentor");
    if (!mentorName) return;
    const mentor = mentors.find((item) => item.name === mentorName);
    if (mentor) setSelectedMentor(mentor);
  }, [params]);

  const canPay =
    paymentMethod === "upi"
      ? paymentValues.upiId.includes("@")
      : paymentMethod === "card"
        ? paymentValues.cardName && paymentValues.cardNumber.length === 16 && paymentValues.cardCvv.length >= 3
        : Boolean(paymentValues.bank);

  if (booked && selectedMentor) {
    return (
      <Result
        status="success"
        title="Session booked successfully"
        subTitle={`Payment successful. Your session with ${selectedMentor.name} is confirmed for ${selectedDate?.format("YYYY-MM-DD")} at ${selectedSlot}.`}
        extra={<Button type="primary" onClick={() => { setBooked(false); setSelectedMentor(null); setSelectedDate(null); setSelectedSlot(""); }}>Back to Mentor List</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={mentors}
        renderItem={(mentor) => {
          const mentorFree = unlocked || canAccessFreeDetail("book-mentor", mentor.name);
          return (
            <List.Item>
              <Card
                hoverable
                className="!relative !h-full !border-[#eedad4]"
                onClick={() => {
                  if (!unlocked && !mentorFree) {
                    setUnlockModalItem(mentor.name);
                    return;
                  }
                  registerFreeDetailAccess("book-mentor", mentor.name);
                  setSelectedMentor(mentor);
                }}
              >
                {!unlocked ? (
                  <div className="absolute right-4 top-4 z-10">
                    <SoftTag color={mentorFree ? "green" : "default"}>{mentorFree ? "FREE" : "LOCK"}</SoftTag>
                  </div>
                ) : null}
                <Space direction="vertical" size="middle" className="!w-full !pr-24">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-ink">{mentor.name}</div>
                      <div className="text-sm text-brand">{mentor.specialty}</div>
                    </div>
                    <div className="text-sm font-black text-brand">{mentor.price}</div>
                  </div>
                  <Text>{mentor.bio}</Text>
                  <Space wrap>
                    {mentor.tags.map((tag) => <SoftTag key={tag} color="blue">{tag}</SoftTag>)}
                  </Space>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
      {!unlocked ? <PremiumGate title="Unlock Mentor Access" description="Subscribe to more mentor profiles and booking access." returnTo={buildMentorReturnTo()} /> : null}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Mentor Access"
        itemLabel={unlockModalItem}
        description="Your free mentor access has been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildMentorReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />

      <Modal open={Boolean(selectedMentor)} footer={null} onCancel={() => setSelectedMentor(null)} width={860}>
        {selectedMentor ? (
          <div className="space-y-6">
            <Title level={3}>{selectedMentor.name}</Title>
            <Typography.Paragraph>{selectedMentor.bio}</Typography.Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <DatePicker className="!w-full" value={selectedDate} onChange={setSelectedDate} />
              </Col>
              <Col xs={24} md={12}>
                <Select className="!w-full" placeholder="Select time" value={selectedSlot || undefined} onChange={setSelectedSlot} options={["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"].map((slot) => ({ label: slot, value: slot }))} />
              </Col>
            </Row>
            <Button type="primary" disabled={!selectedDate || !selectedSlot} onClick={() => setPaymentOpen(true)}>
              Book & Pay
            </Button>
            <Modal open={paymentOpen} footer={null} onCancel={() => setPaymentOpen(false)} title="Payment">
              <Space direction="vertical" size="large" className="!w-full">
                <Card>
                  <Text>Mentor: {selectedMentor.name}</Text>
                  <br />
                  <Text>Date: {selectedDate?.format("YYYY-MM-DD")}</Text>
                  <br />
                  <Text>Time: {selectedSlot}</Text>
                  <br />
                  <Text>Price: {selectedMentor.price}</Text>
                </Card>
                <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <Space direction="vertical">
                    <Radio value="upi">UPI</Radio>
                    <Radio value="card">Credit / Debit Card</Radio>
                    <Radio value="netbanking">Net Banking</Radio>
                  </Space>
                </Radio.Group>
                {paymentMethod === "upi" ? <Input placeholder="yourname@upi" value={paymentValues.upiId} onChange={(event) => setPaymentValues((current) => ({ ...current, upiId: event.target.value }))} /> : null}
                {paymentMethod === "card" ? (
                  <Space direction="vertical" className="!w-full">
                    <Input placeholder="Name on card" value={paymentValues.cardName} onChange={(event) => setPaymentValues((current) => ({ ...current, cardName: event.target.value }))} />
                    <Input placeholder="1234567890123456" value={paymentValues.cardNumber} onChange={(event) => setPaymentValues((current) => ({ ...current, cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16) }))} />
                    <Input placeholder="MM/YY" value={paymentValues.cardExpiry} onChange={(event) => setPaymentValues((current) => ({ ...current, cardExpiry: event.target.value }))} />
                    <Input placeholder="CVV" value={paymentValues.cardCvv} onChange={(event) => setPaymentValues((current) => ({ ...current, cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                  </Space>
                ) : null}
                {paymentMethod === "netbanking" ? <Select placeholder="Select Bank" options={["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => ({ label: bank, value: bank }))} onChange={(value) => setPaymentValues((current) => ({ ...current, bank: value }))} /> : null}
                <Button
                  type="primary"
                  disabled={!canPay}
                  onClick={() => {
                    addBooking({
                      id: `booking-${selectedMentor.name}-${selectedDate?.format("YYYY-MM-DD")}-${selectedSlot}`,
                      mentorName: selectedMentor.name,
                      date: selectedDate?.format("YYYY-MM-DD"),
                      time: selectedSlot,
                      status: "Confirmed",
                    });
                    setPaymentOpen(false);
                    setBooked(true);
                  }}
                >
                  Pay {selectedMentor.price} & Confirm
                </Button>
              </Space>
            </Modal>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
