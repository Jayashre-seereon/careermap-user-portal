import { useState } from "react";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { studyAbroadCountries } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function AbroadPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate } = usePortalNavigation();
  const unlocked = isUnlocked("abroad-consultancy");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <ModuleScreen className="space-y-6">
        <PageHero backOnly onBack={() => setSubmitted(false)} />
        <div className="motion-item rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#9a2119]">Request Submitted</h2>
          <p className="mt-2 text-gray-600">Our team will contact you shortly.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedCountry(null);
            }}
            className="mt-4 rounded-lg bg-[#9a2119] px-5 py-2 text-white"
          >
            Back to Home
          </button>
        </div>
      </ModuleScreen>
    );
  }

  if (selectedCountry) {
    return (
      <ModuleScreen className="space-y-6 pb-24">
        <PageHero backOnly onBack={() => setSelectedCountry(null)} />

        <div className="motion-item rounded-2xl border bg-white">
          <div className="space-y-3 p-6">
            <h1 className="text-3xl font-extrabold text-[#9a2119]">Study in {selectedCountry.name}</h1>
            <p className="max-w-2xl text-gray-600">{selectedCountry.detail}</p>
          </div>
        </div>

        <div className="content-stagger grid gap-4 md:grid-cols-2">
          <InfoCard title="Tuition Fees" value={selectedCountry.tuition} />
          <InfoCard title="Living Cost" value={selectedCountry.living} />
        </div>

        <div className="content-stagger space-y-6">
          <SectionCard title="Popular Courses">
            <div className="flex flex-wrap gap-2">
              {selectedCountry.popularCourses.map((course) => (
                <span key={course} className="rounded-full bg-[#9a2119]/10 px-3 py-1 text-sm text-[#9a2119]">
                  {course}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Top Universities">
            <ul className="space-y-2">
              {selectedCountry.topUniversities.map((university) => (
                <li key={university} className="flex items-center gap-2 text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-[#9a2119]" />
                  {university}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Scholarships">
            <ul className="space-y-2">
              {selectedCountry.scholarships.map((scholarship) => (
                <li key={scholarship} className="text-gray-700">
                  {scholarship}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Requirements">
            <ul className="space-y-2">
              {selectedCountry.requirements.map((requirement) => (
                <li key={requirement} className="text-gray-700">
                  {requirement}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
          <div className="mx-auto w-full max-w-7xl">
            <button
              onClick={() => setFormOpen(true)}
              className="w-full rounded-xl bg-[#9a2119] py-3 font-semibold text-white shadow-md"
            >
              Get Free Consultation
            </button>
          </div>
        </div>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[90%] max-w-md space-y-4 rounded-xl bg-white p-6">
              <h2 className="text-lg font-bold text-[#9a2119]">Consultation Form</h2>
              <input className="w-full rounded border p-2" placeholder="Course Interest" />
              <input className="w-full rounded border p-2" placeholder="Budget Range" />
              <input className="w-full rounded border p-2" placeholder="Preferred Intake" />
              <button
                onClick={() => {
                  if (unlocked) {
                    setSubmitted(true);
                    setFormOpen(false);
                  }
                }}
                className="w-full rounded bg-[#9a2119] py-2 text-white"
              >
                {unlocked ? "Submit Request" : "Subscribe to Submit"}
              </button>
              <button onClick={() => setFormOpen(false)} className="w-full text-sm text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        )}
      </ModuleScreen>
    );
  }

  return (
    <ModuleScreen className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />

      <div>
        <h1 className="text-2xl font-bold text-[#9a2119]">Study Abroad</h1>
      </div>

      <div className="content-stagger grid gap-4 md:grid-cols-2">
        {studyAbroadCountries.map((country) => {
          const countryFree = unlocked || canAccessFreeDetail("abroad-consultancy", country.name);

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
              className="relative cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {!unlocked && (
                <span
                  className={`absolute right-4 top-4 rounded-full px-2 py-1 text-xs ${
                    countryFree ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {countryFree ? "FREE" : "LOCK"}
                </span>
              )}

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#9a2119]">{country.name}</h3>
                <p className="line-clamp-2 text-sm text-gray-600">{country.description}</p>
                <p className="font-semibold text-[#9a2119]">{country.tuition}</p>
                <p className="text-xs text-gray-400">Click to explore</p>
              </div>
            </div>
          );
        })}
      </div>

      {unlockModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[90%] max-w-md space-y-4 rounded-xl bg-white p-6">
            <h2 className="text-lg font-bold text-[#9a2119]">Unlock Required</h2>
            <p className="text-sm text-gray-600">
              You have used your free access for <b>{unlockModalItem}</b>. Subscribe to unlock all countries.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setUnlockModalItem(null)} className="rounded-lg border px-4 py-2 text-sm">
                Cancel
              </button>
              <button onClick={() => setUnlockModalItem(null)} className="rounded-lg bg-[#9a2119] px-4 py-2 text-sm text-white">
                Unlock Now
              </button>
            </div>
          </div>
        </div>
      )}
    </ModuleScreen>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="motion-item rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-1 text-xl font-bold text-[#9a2119]">{value}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="motion-item rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
