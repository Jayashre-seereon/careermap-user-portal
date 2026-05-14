import { useEffect, useState } from "react";
import { DatePicker, Select, Modal } from "antd";
import { useSearchParams } from "react-router-dom";
import { mentors } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

/* ─── Avatar initials ─────────────────────────────────────────── */
const Avatar = ({ name }) => {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-11 h-11 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-800 font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
};

/* ─── Tag ─────────────────────────────────────────────────────── */
const Tag = ({ children, variant = "default" }) => {
  const cls = {
    default: "bg-red-50 text-red-800",
    free: "bg-green-50 text-green-700",
    lock: "bg-gray-100 text-gray-500",
  }[variant];
  return (
    <span className={`${cls} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
      {children}
    </span>
  );
};

/* ─── Button ──────────────────────────────────────────────────── */
const Btn = ({ children, onClick, disabled, ghost, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      text-sm font-medium px-5 py-2 rounded-lg transition-all duration-150
      ${ghost
        ? "border border-gray-200 text-gray-500 bg-transparent hover:bg-gray-50"
        : disabled
          ? "bg-red-800 text-white opacity-40 cursor-not-allowed"
          : "bg-red-800 text-white hover:bg-red-700 active:bg-red-900"
      }
      ${className}
    `}
  >
    {children}
  </button>
);

/* ─── Form field ──────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5 mb-3">
    <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-lg bg-stone-50 text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition";

/* ─── Mentor card ─────────────────────────────────────────────── */
const MentorCard = ({ mentor, isFree, onClick }) => (
  <div
    onClick={onClick}
    className="
      motion-item group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer relative overflow-hidden
      hover:-translate-y-0.5 hover:border-red-300 hover:shadow-lg hover:shadow-red-900/8
      transition-all duration-200
    "
  >
    {/* Left accent bar */}
    <div className="absolute top-0 left-0 w-1 h-full bg-gray-200 group-hover:bg-red-800 transition-colors duration-200 rounded-l-2xl" />

    {/* Header row */}
    <div className="flex items-start justify-between gap-4 mb-3 pl-2">
      <div className="flex gap-3 items-start">
        <Avatar name={mentor.name} />
        <div>
          <p className="text-base font-semibold text-gray-900">{mentor.name}</p>
          <p className="text-sm text-red-700 mt-0.5">{mentor.specialty}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-sm font-semibold text-red-800 whitespace-nowrap">{mentor.price}</span>
        <Tag variant={isFree ? "free" : "lock"}>{isFree ? "FREE" : "LOCKED"}</Tag>
      </div>
    </div>

    {/* Bio */}
    <p className="text-sm text-gray-500 leading-relaxed mb-3 pl-2 font-light">{mentor.bio}</p>

    {/* Tags */}
    <div className="flex flex-wrap gap-1.5 pl-2">
      {mentor.tags.map((t) => <Tag key={t}>{t}</Tag>)}
    </div>
  </div>
);

/* ─── Payment method button ───────────────────────────────────── */
const PaymentBtn = ({ label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-2.5 text-center rounded-lg border text-sm transition-all duration-150
      ${active ? "border-red-800 bg-red-50 text-red-800 font-medium" : "border-gray-200 text-gray-400 hover:border-gray-300"}
    `}
  >
    <div className="text-lg mb-0.5">{icon}</div>
    {label}
  </button>
);

/* ─── Booking summary ─────────────────────────────────────────── */
const BookingSummary = ({ mentor, date, time }) => (
  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 mb-5">
    {[
      ["Mentor", mentor?.name],
      ["Date", date?.format?.("YYYY-MM-DD") ?? date],
      ["Time", time],
    ].map(([k, v]) => (
      <div key={k} className="flex justify-between text-sm py-1 text-gray-500">
        <span>{k}</span>
        <span className="text-gray-900 font-medium">{v}</span>
      </div>
    ))}
    <div className="flex justify-between text-sm pt-3 mt-2 border-t border-red-200 text-red-800 font-semibold">
      <span>Total</span>
      <span>{mentor?.price}</span>
    </div>
  </div>
);

/* ─── Main page ───────────────────────────────────────────────── */
export default function BookMentorPage() {
  const { addBooking, canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const [params] = useSearchParams();

  const unlocked = isUnlocked("book-mentor");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentValues, setPaymentValues] = useState({
    upiId: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", bank: "",
  });

  function buildMentorReturnTo(mentorName = selectedMentor?.name) {
    const nextParams = new URLSearchParams();
    if (mentorName) nextParams.set("mentor", mentorName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    const mentorName = params.get("mentor");
    if (!mentorName) return;
    const mentor = mentors.find((m) => m.name === mentorName);
    if (mentor) setSelectedMentor(mentor);
  }, [params]);

  const canPay =
    paymentMethod === "upi" ? paymentValues.upiId.includes("@") :
    paymentMethod === "card" ? paymentValues.cardName && paymentValues.cardNumber.length === 16 && paymentValues.cardCvv.length >= 3 :
    Boolean(paymentValues.bank);

  const pv = (patch) => setPaymentValues((c) => ({ ...c, ...patch }));

  /* ── Success screen ── */
  if (booked && selectedMentor) {
    return (
      <ModuleScreen className="space-y-6">
      <div className="flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-800 text-2xl mb-4">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Confirmed!</h2>
        <p className="text-gray-500 text-sm leading-relaxed font-light">
          Payment received. Your session with{" "}
          <strong className="text-gray-900">{selectedMentor.name}</strong>
          <br />is booked for {selectedDate?.format("YYYY-MM-DD")} at {selectedSlot}.
        </p>
        <Btn
          className="mt-6"
          onClick={() => { setBooked(false); setSelectedMentor(null); setSelectedDate(null); setSelectedSlot(""); }}
        >
          ← Back to Mentors
        </Btn>
      </div>
      </ModuleScreen>
    );
  }

  /* ── Main layout ── */
  return (
    <ModuleScreen className="space-y-6 pb-12">
      <PageHero backOnly onBack={goToDashboard} />

      {/* Hero */}
      <div className="motion-item px-5 pt-6 pb-1">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Book a Mentor</h1>
        <p className="text-gray-400 mt-1.5 text-base font-light">
          Connect with experienced professionals for guided career sessions.
        </p>
      </div>

      {/* Mentor list */}
      <div className="content-stagger flex flex-col gap-3 px-5 py-5">
        {mentors.map((mentor) => {
          const mentorFree = unlocked || canAccessFreeDetail("book-mentor", mentor.name);
          return (
            <MentorCard
              key={mentor.name}
              mentor={mentor}
              isFree={mentorFree}
              onClick={() => {
                if (!unlocked && !mentorFree) { setUnlockModalItem(mentor.name); return; }
                registerFreeDetailAccess("book-mentor", mentor.name);
                setSelectedMentor(mentor);
              }}
            />
          );
        })}
      </div>

    

      {/* Unlock modal */}
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

      {/* ── Booking modal ── */}
      <Modal
        open={Boolean(selectedMentor)}
        footer={null}
        onCancel={() => setSelectedMentor(null)}
        width={560}
        className="rounded-2xl"
      >
        {selectedMentor && (
          <div className="p-1">
            <div className="border-b border-gray-100 pb-4 mb-5">
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{selectedMentor.specialty}</p>
              <h2 className="text-2xl font-bold text-gray-900">{selectedMentor.name}</h2>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed font-light mb-5">{selectedMentor.bio}</p>

            <div className="h-px bg-gray-100 my-5" />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Field label="Date">
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  className="w-full rounded-lg border-gray-200 bg-stone-50"
                />
              </Field>
              <Field label="Time Slot">
                <Select
                  placeholder="Select time"
                  value={selectedSlot || undefined}
                  onChange={setSelectedSlot}
                  className="w-full"
                  options={["9:00 AM","10:00 AM","11:30 AM","2:00 PM","3:30 PM","5:00 PM","6:30 PM"]
                    .map((s) => ({ label: s, value: s }))}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-5">
              <Btn ghost onClick={() => setSelectedMentor(null)}>Cancel</Btn>
              <Btn disabled={!selectedDate || !selectedSlot} onClick={() => setPaymentOpen(true)}>
                Book & Pay →
              </Btn>
            </div>

            {/* ── Payment modal ── */}
            <Modal
              open={paymentOpen}
              footer={null}
              onCancel={() => setPaymentOpen(false)}
              width={480}
            >
              <div className="p-1">
                <div className="border-b border-gray-100 pb-4 mb-5">
                  <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                </div>

                <BookingSummary mentor={selectedMentor} date={selectedDate} time={selectedSlot} />

                <Field label="Payment Method">
                  <div className="flex gap-2 mt-1">
                    {[
                      { key: "upi", label: "UPI", icon: "📱" },
                      { key: "card", label: "Card", icon: "💳" },
                      { key: "netbanking", label: "Net Banking", icon: "🏦" },
                    ].map((m) => (
                      <PaymentBtn
                        key={m.key}
                        label={m.label}
                        icon={m.icon}
                        active={paymentMethod === m.key}
                        onClick={() => setPaymentMethod(m.key)}
                      />
                    ))}
                  </div>
                </Field>

                {paymentMethod === "upi" && (
                  <Field label="UPI ID">
                    <input
                      className={inputCls}
                      placeholder="yourname@upi"
                      value={paymentValues.upiId}
                      onChange={(e) => pv({ upiId: e.target.value })}
                    />
                  </Field>
                )}

                {paymentMethod === "card" && (
                  <>
                    <Field label="Name on Card">
                      <input className={inputCls} placeholder="Full name"
                        value={paymentValues.cardName}
                        onChange={(e) => pv({ cardName: e.target.value })} />
                    </Field>
                    <Field label="Card Number">
                      <input className={inputCls} placeholder="1234 5678 9012 3456" maxLength={16}
                        value={paymentValues.cardNumber}
                        onChange={(e) => pv({ cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry">
                        <input className={inputCls} placeholder="MM/YY"
                          value={paymentValues.cardExpiry}
                          onChange={(e) => pv({ cardExpiry: e.target.value })} />
                      </Field>
                      <Field label="CVV">
                        <input className={inputCls} placeholder="•••" maxLength={4}
                          value={paymentValues.cardCvv}
                          onChange={(e) => pv({ cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                      </Field>
                    </div>
                  </>
                )}

                {paymentMethod === "netbanking" && (
                  <Field label="Select Bank">
                    <select
                      className={inputCls}
                      value={paymentValues.bank}
                      onChange={(e) => pv({ bank: e.target.value })}
                    >
                      <option value="">Choose bank</option>
                      {["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 mt-5">
                  <Btn ghost onClick={() => setPaymentOpen(false)}>Back</Btn>
                  <Btn
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
                    Pay {selectedMentor.price} →
                  </Btn>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </Modal>
    </ModuleScreen>
  );
}
