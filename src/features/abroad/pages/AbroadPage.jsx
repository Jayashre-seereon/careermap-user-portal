import { useState } from "react";
import { studyAbroadCountries } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";

export default function AbroadPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();

  const unlocked = isUnlocked("abroad-consultancy");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ================= SUCCESS SCREEN ================= */
  if (submitted) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-[#9a2119]">
          Request Submitted ✅
        </h2>
        <p className="text-gray-600 mt-2">
          Our team will contact you shortly.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedCountry(null);
          }}
          className="mt-4 bg-[#9a2119] text-white px-5 py-2 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  /* ================= DETAIL PAGE ================= */
  if (selectedCountry) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">

        {/* HERO */}
        <div className="bg-white border-b">
          <div className="p-6 space-y-3">
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-sm text-gray-500"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-extrabold text-[#9a2119]">
              Study in {selectedCountry.name}
            </h1>

            <p className="text-gray-600 max-w-2xl">
              {selectedCountry.detail}
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <InfoCard title="🎓 Tuition Fees" value={selectedCountry.tuition} />
          <InfoCard title="🏠 Living Cost" value={selectedCountry.living} />
        </div>

        {/* CONTENT */}
        <div className="px-6 space-y-6">
          <SectionCard title="Popular Courses">
            <div className="flex flex-wrap gap-2">
              {selectedCountry.popularCourses.map((c, i) => (
                <span
                  key={i}
                  className="bg-[#9a2119]/10 text-[#9a2119] px-3 py-1 text-sm rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top Universities">
            <ul className="space-y-2">
              {selectedCountry.topUniversities.map((u, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-[#9a2119] rounded-full"></span>
                  {u}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Scholarships">
            <ul className="space-y-2">
              {selectedCountry.scholarships.map((s, i) => (
                <li key={i} className="text-gray-700">🎁 {s}</li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Requirements">
            <ul className="space-y-2">
              {selectedCountry.requirements.map((r, i) => (
                <li key={i} className="text-gray-700">✔ {r}</li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* STICKY CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={() => setFormOpen(true)}
            className="w-full bg-[#9a2119] text-white py-3 rounded-xl font-semibold shadow-md"
          >
            🎯 Get Free Consultation
          </button>
        </div>

        {/* FORM MODAL */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-md space-y-4">
              <h2 className="text-lg font-bold text-[#9a2119]">
                Consultation Form
              </h2>

              <input className="w-full border p-2 rounded" placeholder="Course Interest" />
              <input className="w-full border p-2 rounded" placeholder="Budget Range" />
              <input className="w-full border p-2 rounded" placeholder="Preferred Intake" />

              <button
                onClick={() => {
                  if (unlocked) {
                    setSubmitted(true);
                    setFormOpen(false);
                  }
                }}
                className="w-full bg-[#9a2119] text-white py-2 rounded"
              >
                {unlocked ? "Submit Request" : "Subscribe to Submit"}
              </button>

              <button
                onClick={() => setFormOpen(false)}
                className="w-full text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================= LIST PAGE ================= */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#9a2119]">
        Study Abroad
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        {studyAbroadCountries.map((country) => {
          const countryFree =
            unlocked || canAccessFreeDetail("abroad-consultancy", country.name);

          return (
            <div
              key={country.name}
              onClick={() => {
                if (!unlocked && !countryFree) {
                  setUnlockModalItem(country.name);
                  return;
                }

                registerFreeDetailAccess("abroad-consultancy", country.name);
                setSelectedCountry(country);
              }}
              className="relative cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {!unlocked && (
                <span
                  className={`absolute right-4 top-4 text-xs px-2 py-1 rounded-full ${
                    countryFree
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {countryFree ? "FREE" : "LOCK"}
                </span>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#9a2119]">
                  {country.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {country.description}
                </p>

                <p className="font-semibold text-[#9a2119]">
                  {country.tuition}
                </p>

                <p className="text-xs text-gray-400">
                  Click to explore →
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* UNLOCK MODAL */}
      {unlockModalItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md space-y-4">
            <h2 className="text-lg font-bold text-[#9a2119]">
              Unlock Required
            </h2>

            <p className="text-gray-600 text-sm">
              You’ve used your free access for <b>{unlockModalItem}</b>.
              Subscribe to unlock all countries.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUnlockModalItem(null)}
                className="px-4 py-2 text-sm border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setUnlockModalItem(null);
                }}
                className="px-4 py-2 text-sm bg-[#9a2119] text-white rounded-lg"
              >
                Unlock Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function InfoCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-[#9a2119] mt-1">{value}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border">
      <h2 className="font-semibold text-lg mb-3 text-gray-800">
        {title}
      </h2>
      {children}
    </div>
  );
}