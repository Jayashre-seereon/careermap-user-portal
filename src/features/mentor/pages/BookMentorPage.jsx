import { useEffect, useMemo, useState } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { DatePicker, Modal, Select } from "antd";
import { useSearchParams } from "react-router-dom";
import { getMentorById, getMentors } from "../../../api/mentorApi";
import { mentors as fallbackMentors } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

const inputCls =
  "w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-lg bg-stone-50 text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition";

const timeSlots = ["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"];

const Avatar = ({ name }) => {
  const initials = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-200 bg-red-50 text-sm font-bold text-red-800">
      {initials || "M"}
    </div>
  );
};

const Tag = ({ children, variant = "default" }) => {
  const cls = {
    default: "bg-red-50 text-red-800",
    free: "bg-green-50 text-green-700",
    lock: "bg-gray-100 text-gray-500",
  }[variant];

  return <span className={`${cls} rounded-full px-2.5 py-0.5 text-xs font-medium`}>{children}</span>;
};

const Btn = ({ children, onClick, disabled, ghost, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={[
      "rounded-lg px-5 py-2 text-sm font-medium transition-all duration-150",
      ghost
        ? "border border-gray-200 bg-transparent text-gray-500 hover:bg-gray-50"
        : disabled
          ? "cursor-not-allowed bg-red-800 text-white opacity-40"
          : "bg-red-800 text-white hover:bg-red-700 active:bg-red-900",
      className,
    ].join(" ")}
  >
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <div className="mb-3 flex flex-col gap-1.5">
    <label className="text-xs font-medium uppercase tracking-widest text-gray-400">{label}</label>
    {children}
  </div>
);

const MentorCard = ({ mentor, isFree, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#f0e4e2] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[#9a2119] hover:shadow-lg hover:shadow-[#9a2119]/10"
  >
    <div className="absolute left-0 right-0 top-0 h-[3px] bg-[#f0e4e2] transition-colors duration-200 group-hover:bg-[#9a2119]" />
    <div className="mb-3 pt-2">
      <div className="flex items-start gap-3">
        <Avatar name={mentor.name} />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-base font-black text-[#1a0a09]">{mentor.name}</p>
          <p className="mt-1 mb-0 text-[11px] font-semibold uppercase tracking-widest text-[#b8837e]">{mentor.specialty}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[#9a2119]">{mentor.price}</span>
        <Tag variant={isFree ? "free" : "lock"}>{isFree ? "FREE" : "LOCKED"}</Tag>
      </div>
    </div>

    <div className="mb-4 flex flex-wrap gap-1.5">
      {mentor.tags.map((tag) => (
        <Tag key={tag}>{tag}</Tag>
      ))}
    </div>

    <div className="mt-auto flex items-center justify-between border-t border-[#f0e4e2] pt-3">
      <span className="text-xs font-semibold text-[#8c6c67]">Tap to view mentor</span>
      <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
        Explore <ArrowRightOutlined />
      </span>
    </div>
  </button>
);

const BookingSummary = ({ mentor, date, time }) => (
  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
    {[
      ["Mentor", mentor?.name],
      ["Date", date?.format?.("YYYY-MM-DD") ?? date],
      ["Time", time],
    ].map(([label, value]) => (
      <div key={label} className="flex justify-between py-1 text-sm text-gray-500">
        <span>{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
    ))}
    <div className="mt-2 flex justify-between border-t border-red-200 pt-3 text-sm font-semibold text-red-800">
      <span>Total</span>
      <span>{mentor?.price}</span>
    </div>
  </div>
);

export default function BookMentorPage() {
  const { addBooking, canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();

  const unlocked = isUnlocked("book-mentor");
  const [mentorList, setMentorList] = useState(fallbackMentors);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentValues, setPaymentValues] = useState({
    upiId: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    bank: "",
  });

  const activeMentor = useMemo(() => {
    if (selectedMentor) {
      return selectedMentor;
    }

    if (!selectedMentorId) {
      return null;
    }

    return mentorList.find(
      (item) => String(item.id) === String(selectedMentorId) || item.name === selectedMentorId
    ) || null;
  }, [mentorList, selectedMentor, selectedMentorId]);

  function buildMentorReturnTo(mentorRef = activeMentor) {
    const mentorName = typeof mentorRef === "string" ? mentorRef : mentorRef?.name;
    const mentorId = typeof mentorRef === "object" ? mentorRef?.id : "";
    const nextParams = new URLSearchParams();

    if (mentorId) nextParams.set("mentorId", mentorId);
    if (mentorName) nextParams.set("mentor", mentorName);

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

  const mentorsToRender = mentorList.length ? mentorList : fallbackMentors;
  const canPay =
    paymentMethod === "upi"
      ? paymentValues.upiId.includes("@")
      : paymentMethod === "card"
        ? paymentValues.cardName && paymentValues.cardNumber.length === 16 && paymentValues.cardCvv.length >= 3
        : Boolean(paymentValues.bank);

  const pv = (patch) => setPaymentValues((current) => ({ ...current, ...patch }));

  if (booked && activeMentor) {
    return (
      <ModuleScreen className="space-y-6">
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-800">
            ✓
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Session Confirmed!</h2>
          <p className="text-sm font-light leading-relaxed text-gray-500">
            Payment received. Your session with <strong className="text-gray-900">{activeMentor.name}</strong>
            <br />is booked for {selectedDate?.format("YYYY-MM-DD")} at {selectedSlot}.
          </p>
          <Btn
            className="mt-6"
            onClick={() => {
              setBooked(false);
              setSelectedMentor(null);
              setSelectedMentorId("");
              setSelectedDate(null);
              setSelectedSlot("");
            }}
          >
            Back to Mentors
          </Btn>
        </div>
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-6 pb-12">
      <div className="motion-item flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-black leading-tight text-[#1a0a09]">Book a Mentor</h1>
          <p className="mt-1 mb-0 text-xs text-[#b8837e]">
            Connect with experienced professionals for guided career sessions.
          </p>
          {loadError ? <p className="mt-2 text-xs font-semibold text-[#9a2119]">{loadError}</p> : null}
        </div>
        <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
      </div>

      <div className="content-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mentorsToRender.map((mentor) => {
          const mentorFree = unlocked || canAccessFreeDetail("book-mentor", mentor.name);

          return (
            <MentorCard
              key={mentor.name}
              mentor={mentor}
              isFree={mentorFree}
              onClick={() => {
                if (!unlocked && !mentorFree) {
                  setUnlockModalItem(mentor.name);
                  return;
                }

                registerFreeDetailAccess("book-mentor", mentor.name);
                setSelectedMentor(mentor);
                setSelectedMentorId(String(mentor.id || mentor.name));
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

      <Modal open={Boolean(selectedMentor)} footer={null} onCancel={() => setSelectedMentor(null)} width={560}>
        {activeMentor ? (
          <div className="p-1">
            <div className="mb-5 border-b border-gray-100 pb-4">
              <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">{activeMentor.specialty}</p>
              <h2 className="text-2xl font-bold text-gray-900">{activeMentor.name}</h2>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <Field label="Date">
                <DatePicker value={selectedDate} onChange={setSelectedDate} className="w-full rounded-lg border-gray-200 bg-stone-50" />
              </Field>
              <Field label="Time Slot">
                <Select
                  placeholder="Select time"
                  value={selectedSlot || undefined}
                  onChange={setSelectedSlot}
                  className="w-full"
                  options={timeSlots.map((slot) => ({ label: slot, value: slot }))}
                />
              </Field>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Btn
                ghost
                onClick={() => {
                  setSelectedMentor(null);
                  setSelectedMentorId("");
                }}
              >
                Cancel
              </Btn>
              <Btn disabled={!selectedDate || !selectedSlot} onClick={() => setPaymentOpen(true)}>
                Book & Pay &rarr;
              </Btn>
            </div>

            <Modal open={paymentOpen} footer={null} onCancel={() => setPaymentOpen(false)} width={480}>
              <div className="p-1">
                <div className="mb-5 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                </div>

                <BookingSummary mentor={activeMentor} date={selectedDate} time={selectedSlot} />

                <Field label="Payment Method">
                  <div className="mt-1 flex gap-2">
                    {[
                      { key: "upi", label: "UPI", icon: "📱" },
                      { key: "card", label: "Card", icon: "💳" },
                      { key: "netbanking", label: "Net Banking", icon: "🏦" },
                    ].map((method) => (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => setPaymentMethod(method.key)}
                        className={`flex-1 rounded-lg border py-2.5 text-center text-sm transition-all duration-150 ${
                          paymentMethod === method.key
                            ? "border-red-800 bg-red-50 font-medium text-red-800"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <div className="mb-0.5 text-lg">{method.icon}</div>
                        {method.label}
                      </button>
                    ))}
                  </div>
                </Field>

                {paymentMethod === "upi" ? (
                  <Field label="UPI ID">
                    <input
                      className={inputCls}
                      placeholder="yourname@upi"
                      value={paymentValues.upiId}
                      onChange={(event) => pv({ upiId: event.target.value })}
                    />
                  </Field>
                ) : null}

                {paymentMethod === "card" ? (
                  <>
                    <Field label="Name on Card">
                      <input
                        className={inputCls}
                        placeholder="Full name"
                        value={paymentValues.cardName}
                        onChange={(event) => pv({ cardName: event.target.value })}
                      />
                    </Field>
                    <Field label="Card Number">
                      <input
                        className={inputCls}
                        placeholder="1234 5678 9012 3456"
                        maxLength={16}
                        value={paymentValues.cardNumber}
                        onChange={(event) =>
                          pv({ cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16) })
                        }
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry">
                        <input
                          className={inputCls}
                          placeholder="MM/YY"
                          value={paymentValues.cardExpiry}
                          onChange={(event) => pv({ cardExpiry: event.target.value })}
                        />
                      </Field>
                      <Field label="CVV">
                        <input
                          className={inputCls}
                          placeholder="***"
                          maxLength={4}
                          value={paymentValues.cardCvv}
                          onChange={(event) =>
                            pv({ cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4) })
                          }
                        />
                      </Field>
                    </div>
                  </>
                ) : null}

                {paymentMethod === "netbanking" ? (
                  <Field label="Select Bank">
                    <select
                      className={inputCls}
                      value={paymentValues.bank}
                      onChange={(event) => pv({ bank: event.target.value })}
                    >
                      <option value="">Choose bank</option>
                      {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : null}

                <div className="mt-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <Btn ghost onClick={() => setPaymentOpen(false)}>
                    Back
                  </Btn>
                  <Btn
                    disabled={!canPay}
                    onClick={() => {
                      addBooking({
                        id: `booking-${activeMentor.name}-${selectedDate?.format("YYYY-MM-DD")}-${selectedSlot}`,
                        mentorName: activeMentor.name,
                        date: selectedDate?.format("YYYY-MM-DD"),
                        time: selectedSlot,
                        status: "Confirmed",
                      });
                      setPaymentOpen(false);
                      setBooked(true);
                    }}
                  >
                    Pay {activeMentor.price} &rarr;
                  </Btn>
                </div>
              </div>
            </Modal>
          </div>
        ) : null}
      </Modal>
    </ModuleScreen>
  );
}
