import { useEffect, useMemo, useState } from "react";
import { ArrowRightOutlined, LockOutlined, StarFilled } from "@ant-design/icons";
import { Modal } from "antd";
import { useSearchParams } from "react-router-dom";
import { getMentorById, getMentors } from "../../../api/mentorApi";
import { mentors as fallbackMentors } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

function formatNumericDate(value) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    key: parsed.toISOString().split("T")[0],
    day: parsed.toLocaleDateString("en-IN", { weekday: "short" }),
    date: String(parsed.getDate()),
    month: parsed.toLocaleDateString("en-IN", { month: "short" }),
  };
}

function buildFallbackAvailability() {
  const output = [];

  for (let index = 0; index < 6; index += 1) {
    const current = new Date();
    current.setDate(current.getDate() + index);
    const info = formatNumericDate(current);

    output.push({
      key: info.key,
      day: info.day,
      date: info.date,
      month: info.month,
      slots: index % 4 === 1 ? [] : ["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"].slice(0, 3 + (index % 3)),
    });
  }

  return output;
}

function normalizeAvailability(availability) {
  if (Array.isArray(availability) && availability.length) {
    return availability
      .map((item) => {
        const info = formatNumericDate(item?.rawDate || item?.date);

        if (!info && !item?.key) {
          return null;
        }

        return {
          key: item?.key || info?.key || String(item?.date || ""),
          day: item?.day || info?.day || "Day",
          date: item?.date || info?.date || "",
          month: item?.month || info?.month || "",
          slots: Array.isArray(item?.slots) ? item.slots.filter(Boolean) : [],
        };
      })
      .filter(Boolean);
  }

  return buildFallbackAvailability();
}

function Avatar({ name, accent, avatar }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] shadow-sm" style={{ backgroundColor: `${accent}18` }}>
      <span className="text-[22px] font-black" style={{ color: accent }}>
        {avatar || String(name || "M").slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="rounded-[24px] border border-[#f0e4e2] bg-white p-5 shadow-sm">
      <h3 className="m-0 text-[18px] font-black text-[#1a0a09]">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      {children}
    </div>
  );
}

function MentorCard({ mentor, isFree, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
    >
      <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#f0e4e2] transition-colors group-hover:bg-[#9a2119]" />

      <div className="mb-4 flex items-start justify-between gap-3 pt-2">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px]" style={{ backgroundColor: `${mentor.accent}18` }}>
            <span className="text-[20px] font-black" style={{ color: mentor.accent }}>
              {mentor.avatar}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-black text-[#1a0a09]">{mentor.name}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-[#b8837e]">
              {mentor.specialty}
            </div>
          </div>
        </div>
        {!isFree ? (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">LOCKED</span>
        ) : (
          <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">FREE</span>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ef] px-2.5 py-1 text-[11px] font-semibold text-[#1a0a09]">
          <StarFilled style={{ color: "#d4a017" }} />
          {mentor.rating}
        </span>
        <span className="rounded-full bg-[#fff6ef] px-2.5 py-1 text-[11px] font-semibold text-[#1a0a09]">
          {mentor.experience}
        </span>
        <span className="rounded-full bg-[#fff6ef] px-2.5 py-1 text-[11px] font-semibold text-[#9a2119]">
          {mentor.price}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(mentor.tags || []).map((tag) => (
          <span key={tag} className="rounded-full bg-[#fff0ee] px-3 py-1 text-[11px] font-semibold text-[#c13124]">
            {tag}
          </span>
        ))}
      </div>

      <div className="border-t border-[#f0e4e2] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#8c6c67]">Tap to view mentor</span>
          <span className="text-sm font-bold text-[#9a2119]">
            Explore <ArrowRightOutlined />
          </span>
        </div>
      </div>
    </button>
  );
}

export default function BookMentorPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess, addBooking } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();

  const unlocked = isUnlocked("book-mentor");
  const [mentorList, setMentorList] = useState(fallbackMentors);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentValues, setPaymentValues] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    bank: "",
  });
  const [processing, setProcessing] = useState(false);
  const [booked, setBooked] = useState(false);

  const activeMentor = useMemo(() => {
    if (!selectedMentorId) {
      return null;
    }

    return (
      selectedMentor ||
      mentorList.find((item) => String(item.id) === String(selectedMentorId) || item.name === selectedMentorId) ||
      null
    );
  }, [mentorList, selectedMentor, selectedMentorId]);

  const dates = useMemo(() => normalizeAvailability(activeMentor?.availability), [activeMentor]);
  const slots = useMemo(() => {
    if (!dates.length) {
      return [];
    }

    const activeDate = dates.find((item) => item.key === selectedDate) || dates[0];
    return activeDate?.slots || [];
  }, [dates, selectedDate]);

  function buildMentorReturnTo(mentorRef = activeMentor) {
    const mentorName = typeof mentorRef === "string" ? mentorRef : mentorRef?.name;
    const mentorId = typeof mentorRef === "object" ? mentorRef?.id : "";
    const nextParams = new URLSearchParams();

    if (mentorId) nextParams.set("mentorId", mentorId);
    if (mentorName) nextParams.set("mentor", mentorName);
    if (selectedDate) nextParams.set("date", selectedDate);
    if (selectedSlot) nextParams.set("time", selectedSlot);

    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    let active = true;

    async function loadMentors() {
      try {
        setLoadError("");
        const items = await getMentors();
        if (active) {
          setMentorList(items.length ? items : fallbackMentors);
        }
      } catch (error) {
        if (active) {
          setLoadError(error?.response?.data?.message || error?.message || "Failed to load mentor list.");
          setMentorList(fallbackMentors);
        }
      }
    }

    loadMentors();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const mentorParam = params.get("mentorId") || params.get("mentor");
    if (!mentorParam) {
      return;
    }

    let active = true;

    async function resolveMentor() {
      const numericId = /^\d+$/.test(mentorParam);

      if (numericId) {
        try {
          const mentor = await getMentorById(mentorParam);
          if (active && mentor) {
            setSelectedMentor(mentor);
            setSelectedMentorId(String(mentor.id));
            return;
          }
        } catch {
          // Fall back to the list below.
        }
      }

      const mentor = mentorList.find(
        (item) => String(item.id) === String(mentorParam) || item.name === mentorParam
      );

      if (active && mentor) {
        setSelectedMentor(mentor);
        setSelectedMentorId(String(mentor.id || mentor.name));
      }
    }

    resolveMentor();
    return () => {
      active = false;
    };
  }, [mentorList, params]);

  useEffect(() => {
    if (!activeMentor) {
      setSelectedDate("");
      setSelectedSlot("");
      return;
    }

    if (!selectedDate && dates[0]) {
      setSelectedDate(dates[0].key);
    }

    if (selectedDate && !dates.some((item) => item.key === selectedDate)) {
      setSelectedDate(dates[0]?.key || "");
      setSelectedSlot("");
    }
  }, [activeMentor, dates, selectedDate]);

  useEffect(() => {
    if (!processing || !activeMentor) {
      return undefined;
    }

    const timer = setTimeout(() => {
      addBooking({
        id: `booking-${activeMentor.name}-${selectedDate}-${selectedSlot}`,
        mentorName: activeMentor.name,
        date: selectedDate,
        time: selectedSlot,
        status: "Confirmed",
      });
      setProcessing(false);
      setBooked(true);
    }, 1600);

    return () => clearTimeout(timer);
  }, [activeMentor, addBooking, processing, selectedDate, selectedSlot]);

  const detailUnlocked = activeMentor ? canAccessFreeDetail("book-mentor", activeMentor.name) : true;
  const canPay =
    paymentMethod === "upi"
      ? paymentValues.upiId.includes("@") && paymentValues.upiId.length > 3
      : paymentMethod === "card"
        ? paymentValues.cardName.trim().length > 0 &&
          paymentValues.cardNumber.replace(/\s/g, "").length === 16 &&
          paymentValues.cardExpiry.trim().length > 0 &&
          paymentValues.cardCvv.length >= 3
        : Boolean(paymentValues.bank);

  if (processing && activeMentor) {
    return (
      <ModuleScreen className="space-y-6">
        <div className="motion-item flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black leading-tight text-[#1a0a09]">Book a Mentor</h1>
            <p className="mt-1 mb-0 text-xs text-[#b8837e]">Confirming your mentor booking.</p>
          </div>
          <PageHero backOnly onBack={() => setProcessing(false)} className="shrink-0" />
        </div>

        <div className="flex min-h-[320px] items-center justify-center px-2">
          <div className="w-full max-w-[560px] rounded-[28px] border border-[#f0e4e2] bg-white px-6 py-7 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#f1d9d3] border-t-[#9a2119] animate-spin" />
            <div className="mt-5 inline-flex rounded-full bg-[#fdf0ee] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9a2119]">
              Processing
            </div>
            <div className="mt-4 text-[22px] font-black text-[#1a0a09]">Processing Payment</div>
            <div className="mx-auto mt-2 max-w-md text-[14px] leading-7 text-[#6f6663]">
              Please wait while we confirm your mentor booking.
            </div>
            <div className="mx-auto mt-6 h-2 w-full max-w-[280px] overflow-hidden rounded-full bg-[#f3ece8]">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#c72733] to-[#51154c] animate-pulse" />
            </div>
          </div>
        </div>
      </ModuleScreen>
    );
  }

  if (booked && activeMentor) {
    return (
      <ModuleScreen className="space-y-6">
        <div className="rounded-[28px] border border-[#f0e4e2] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-green-50 text-3xl text-green-600">
            ✓
          </div>
          <h2 className="mt-4 text-2xl font-black text-[#1a0a09]">Session booked successfully</h2>
          <p className="mt-2 text-sm leading-7 text-[#6f6663]">
            Payment successful. Your session with <strong className="text-[#1a0a09]">{activeMentor.name}</strong> is confirmed for{" "}
            {selectedDate} at {selectedSlot}.
          </p>
          <div className="mx-auto mt-5 max-w-md rounded-[22px] border border-[#f0e4e2] bg-[#fffaf8] p-4 text-left">
            <div className="text-sm text-[#6f6663]">Mentor: {activeMentor.name}</div>
            <div className="mt-1 text-sm text-[#6f6663]">Date: {selectedDate}</div>
            <div className="mt-1 text-sm text-[#6f6663]">Time: {selectedSlot}</div>
            <div className="mt-1 text-sm text-[#6f6663]">Price: {activeMentor.price}</div>
          </div>
          <button
            type="button"
            className="mt-6 rounded-[16px] bg-[#9a2119] px-6 py-3 text-sm font-extrabold text-white"
            onClick={() => {
              setBooked(false);
              setSelectedMentorId("");
              setSelectedMentor(null);
              setSelectedDate("");
              setSelectedSlot("");
              setPaymentOpen(false);
            }}
          >
            Back to Mentor List
          </button>
        </div>
      </ModuleScreen>
    );
  }

  if (activeMentor) {
    return (
      <ModuleScreen className="space-y-6 pb-24">
        <div className="motion-item flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-black leading-tight text-[#1a0a09]">Book a Mentor</h1>
            <p className="mt-1 mb-0 text-xs text-[#b8837e]">Profile, schedule selection, and booking flow.</p>
          </div>
          <PageHero backOnly onBack={() => setSelectedMentorId("")} className="shrink-0" />
        </div>

        {!unlocked ? (
          <div className="inline-flex self-start rounded-full bg-green-50 px-3 py-2 text-[12px] font-extrabold text-green-700">
            {detailUnlocked ? "1 free mentor detail unlocked" : "Subscribe to unlock more mentor profiles"}
          </div>
        ) : null}

        <div className="relative overflow-hidden rounded-[30px] border border-[#f0e4e2] bg-white p-6 shadow-sm">
          <div className="absolute right-5 top-5 h-14 w-14 rounded-full bg-[#f9ece8]" />
          <div className="absolute left-5 top-20 h-4 w-4 rounded-full bg-[#f1d9d3]" />
          <div className="absolute bottom-6 right-6 h-3 w-3 rounded-full bg-[#f1d9d3]" />

          <div className="relative z-[1]">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar name={activeMentor.name} accent={activeMentor.accent} avatar={activeMentor.avatar} />
              <div className="rounded-full bg-[#fdf0ee] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9a2119]">
                Mentor Profile
              </div>
              <h2 className="m-0 text-[24px] font-black leading-tight text-[#1a0a09]">{activeMentor.name}</h2>
              <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#b8837e]">
                {activeMentor.specialty}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6ef] px-3 py-1 font-semibold text-[#1a0a09]">
                  <StarFilled style={{ color: "#d4a017" }} /> {activeMentor.rating} rating
                </span>
                <span className="rounded-full bg-[#fff6ef] px-3 py-1 font-semibold text-[#1a0a09]">
                  {activeMentor.experience}
                </span>
                <span className="rounded-full bg-[#fff6ef] px-3 py-1 font-semibold text-[#9a2119]">
                  {activeMentor.price}
                </span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1">
                {(activeMentor.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-[#fff0ee] px-3 py-1 text-[11px] font-semibold text-[#c13124]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SectionCard title="About">
          <p className="m-0 text-[14px] leading-7 text-[#6f6663]">{activeMentor.bio}</p>
        </SectionCard>

        <SectionCard title="Select Date">
          <div className="flex flex-wrap gap-2.5">
            {dates.map((date) => {
              const isActive = selectedDate === date.key;
              const hasSlots = (date.slots || []).length > 0;

              return (
                <button
                  key={date.key}
                  type="button"
                  disabled={!hasSlots}
                  onClick={() => {
                    setSelectedDate(date.key);
                    setSelectedSlot("");
                  }}
                  className="w-[62px] rounded-[16px] py-3.5 px-3.5 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-35"
                  style={{
                    backgroundColor: isActive ? "#9a2119" : "#f2ebe6",
                    color: isActive ? "#fff" : "#1a0a09",
                  }}
                >
                  <div className="text-[10px] font-bold">{date.day}</div>
                  <div className="text-[17px] font-black">{date.date}</div>
                  <div className="text-[10px] font-bold">{date.month}</div>
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Select Time">
          {selectedDate ? (
            <div className="flex flex-wrap gap-2.5">
              {slots.length ? (
                slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className="rounded-[12px] px-[14px] py-2.5 px-3.5 text-[12px] font-extrabold transition-all duration-150"
                    style={{
                      backgroundColor: selectedSlot === slot ? "#9a2119" : "#f2ebe6",
                      color: selectedSlot === slot ? "#fff" : "#1a0a09",
                    }}
                  >
                    {slot}
                  </button>
                ))
              ) : (
                <div className="text-sm text-[#8c6c67]">No time slots available for this date.</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-[#8c6c67]">Choose a date to see available time slots.</div>
          )}
        </SectionCard>

        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#efe4df] bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto w-full max-w-5xl">
            <button
              type="button"
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setPaymentOpen(true)}
              className="w-full rounded-[18px] py-3.5 text-[14px] font-extrabold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "linear-gradient(90deg, #c72733 0%, #51154c 100%)",
              }}
            >
              Book & Pay
            </button>
          </div>
        </div>

        <Modal
          open={paymentOpen}
          centered
          onCancel={() => setPaymentOpen(false)}
          footer={null}
          width={760}
          className="[&_.ant-modal-content]:!rounded-[28px] [&_.ant-modal-content]:!overflow-hidden"
        >
          <div className="bg-[#f7f7f8]">
            <div className="flex items-center justify-between border-b border-[#efefef] bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setPaymentOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                <ArrowRightOutlined className="rotate-180" />
                Back
              </button>

              <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-green-700">
                <LockOutlined />
                Secure Checkout
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6">
                <h2 className="text-3xl font-black text-[#12284c] max-sm:text-2xl">Complete your purchase</h2>
                <p className="mt-1 text-sm text-[#9ba3b3]">You're one step away from booking {activeMentor.name}</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.55fr_0.95fr]">
                <div className="overflow-hidden rounded-[24px] border border-[#efefef] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
                  <div className="border-b border-[#f6f6f6] px-6 py-4">
                    <h3 className="m-0 text-sm font-black uppercase tracking-tight text-gray-800">Payment Method</h3>
                  </div>

                  <div className="flex flex-col gap-5 px-6 py-5">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "upi", label: "UPI", icon: "⚡" },
                        { id: "card", label: "Card", icon: "💳" },
                        { id: "netbanking", label: "Net Banking", icon: "🏦" },
                      ].map((item) => {
                        const active = paymentMethod === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setPaymentMethod(item.id)}
                            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-medium transition-all"
                            style={{
                              borderColor: active ? "#9a2119" : "#e5e7eb",
                              backgroundColor: active ? "#fdf1f0" : "#fff",
                              color: active ? "#9a2119" : "#6b7280",
                            }}
                          >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-3">
                      {paymentMethod === "upi" ? (
                        <>
                          <Field label="UPI ID">
                            <input
                              className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                              placeholder="yourname@upi"
                              value={paymentValues.upiId}
                              onChange={(event) => setPaymentValues((current) => ({ ...current, upiId: event.target.value }))}
                            />
                          </Field>
                          <p className="text-xs text-gray-400">Supported: @okicici, @ybl, @paytm, @upi</p>
                        </>
                      ) : null}

                      {paymentMethod === "card" ? (
                        <>
                          <Field label="Cardholder Name">
                            <input
                              className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                              placeholder="Full name on card"
                              value={paymentValues.cardName}
                              onChange={(event) =>
                                setPaymentValues((current) => ({ ...current, cardName: event.target.value }))
                              }
                            />
                          </Field>
                          <Field label="Card Number">
                            <input
                              className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                              placeholder="0000 0000 0000 0000"
                              value={paymentValues.cardNumber}
                              onChange={(event) =>
                                setPaymentValues((current) => ({
                                  ...current,
                                  cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(),
                                }))
                              }
                            />
                          </Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label="Expiry">
                              <input
                                className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                                placeholder="MM / YY"
                                value={paymentValues.cardExpiry}
                                onChange={(event) => setPaymentValues((current) => ({ ...current, cardExpiry: event.target.value }))}
                              />
                            </Field>
                            <Field label="CVV">
                              <input
                                className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                                placeholder="***"
                                value={paymentValues.cardCvv}
                                onChange={(event) =>
                                  setPaymentValues((current) => ({
                                    ...current,
                                    cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                                  }))
                                }
                              />
                            </Field>
                          </div>
                        </>
                      ) : null}

                      {paymentMethod === "netbanking" ? (
                        <>
                          <Field label="Select Bank">
                            <select
                              className="rounded-lg border border-gray-200 px-4 py-3 text-[14px] outline-none"
                              value={paymentValues.bank}
                              onChange={(event) =>
                                setPaymentValues((current) => ({ ...current, bank: event.target.value }))
                              }
                            >
                              <option value="">Choose your bank</option>
                              {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                                <option key={bank} value={bank}>
                                  {bank}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <p className="text-xs text-gray-400">You will be redirected to your bank&apos;s secure portal.</p>
                        </>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-400">
                      <LockOutlined style={{ color: "#9ca3af", fontSize: 13 }} />
                      Your payment info is encrypted and never stored.
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-[#f0d5d3] bg-white shadow-[0_1px_4px_rgba(154,33,25,0.08)]">
                  <div className="h-1 w-full bg-[#9a2119]" />
                  <div className="flex h-full flex-col px-5 py-5">
                    <div className="mb-4 inline-flex self-start items-center gap-1.5 rounded-full bg-[#fdf1f0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9a2119]">
                      <StarFilled style={{ color: "#9a2119" }} />
                      Selected Booking
                    </div>

                    <h3 className="text-base font-black text-gray-900 mb-0.5">{activeMentor.name}</h3>
                    <p className="mb-4 text-xs text-gray-400">{activeMentor.specialty}</p>

                    <div className="flex flex-col gap-2 mb-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Mentor</span>
                        <span className="font-semibold text-gray-800">{activeMentor.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-semibold text-gray-800">{selectedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Time</span>
                        <span className="font-semibold text-gray-800">{selectedSlot}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration</span>
                        <span className="font-semibold text-gray-800">45 mins</span>
                      </div>
                    </div>

                    <div className="my-4 border-t border-gray-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">Total due</span>
                      <span className="text-2xl font-black text-[#9a2119]">{activeMentor.price}</span>
                    </div>

                    <div className="mt-5">
                      <button
                        type="button"
                        disabled={!canPay}
                        onClick={() => {
                          setPaymentOpen(false);
                          setProcessing(true);
                        }}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ background: "#9a2119" }}
                      >
                        <LockOutlined />
                        Complete Payment
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                      <span>🔒</span>
                      <span>256-bit SSL and PCI-DSS compliant</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </Modal>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-6 pb-8">
      <div className="motion-item flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-black leading-tight text-[#1a0a09]">Book a Mentor</h1>
          <p className="mt-1 mb-0 text-xs text-[#b8837e]">Mentor list and booking flow adapted from the mobile app.</p>
          {loadError ? <p className="mt-2 text-xs font-semibold text-[#9a2119]">{loadError}</p> : null}
        </div>
        <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
      </div>

      <div className="rounded-[28px] border border-[#f0e4e2] bg-white p-6 shadow-sm">
        <div className="inline-flex rounded-full bg-[#fdf0ee] px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#9a2119]">
          Mentor Booking
        </div>
        <h2 className="mt-4 text-[24px] font-black text-[#1a0a09]">Choose a mentor and open the profile view</h2>
        <p className="mt-2 text-[14px] leading-7 text-[#6f6663]">
          Tap a mentor to see ratings, about information, available dates, and time slots exactly in the booking flow.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mentorList.map((mentor, index) => {
          const mentorFree = unlocked || canAccessFreeDetail("book-mentor", mentor.name);

          return (
            <MentorCard
              key={mentor.id || mentor.name}
              mentor={mentor}
              isFree={mentorFree}
              onClick={() => {
                if (!unlocked && !mentorFree) {
                  setUnlockModalItem(mentor.name);
                  return;
                }

                registerFreeDetailAccess("book-mentor", mentor.name);
                setSelectedMentorId(String(mentor.id || index));
                setSelectedMentor(mentor);
              }}
            />
          );
        })}
      </div>

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
    </ModuleScreen>
  );
}
