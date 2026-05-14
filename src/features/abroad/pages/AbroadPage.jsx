import { useState } from "react";
import {
  ArrowRightOutlined,
  BankOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { studyAbroadCountries } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

export default function AbroadPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const unlocked = isUnlocked("abroad-consultancy");

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function buildAbroadReturnTo(countryName = selectedCountry?.name) {
    const nextParams = new URLSearchParams();
    if (countryName) nextParams.set("country", countryName);
    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  if (submitted) {
    return (
      <ModuleScreen className="space-y-6">
        <PageHero backOnly onBack={() => setSubmitted(false)} />
        <div className="motion-item rounded-[28px] border border-[#f0e4e2] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0ee] text-xl text-[#9a2119]">
            <CheckCircleOutlined />
          </div>
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

        <div className="motion-item overflow-hidden rounded-[30px] border border-[#f0e4e2] bg-white shadow-sm">
          <div className="brand-gradient relative p-6 text-white md:p-8">
            <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-bold tracking-[0.28em] text-white/85">
              {selectedCountry.flag}
            </div>
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-white/90">
                <GlobalOutlined />
                Study Destination
              </div>
              <h1 className="m-0 text-3xl font-extrabold text-white">Study in {selectedCountry.name}</h1>
              <p className="m-0 max-w-2xl text-sm leading-7 text-white/80">{selectedCountry.detail}</p>
            </div>
          </div>
        </div>

        <div className="content-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard icon={<DollarOutlined />} title="Tuition Fees" value={selectedCountry.tuition} />
          <InfoCard icon={<BankOutlined />} title="Living Cost" value={selectedCountry.living} />
          <InfoCard icon={<SafetyCertificateOutlined />} title="Visa Type" value={selectedCountry.visa} />
          <InfoCard icon={<GlobalOutlined />} title="Work Rights" value={selectedCountry.workRights} />
        </div>

        <div className="content-stagger space-y-6">
          <SectionCard icon={<BookOutlined />} title="Popular Courses">
            <div className="flex flex-wrap gap-2">
              {selectedCountry.popularCourses.map((course) => (
                <span key={course} className="rounded-full border border-[#f5d8d1] bg-[#fdf4f2] px-3 py-1.5 text-sm font-semibold text-[#9a2119]">
                  {course}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={<ReadOutlined />} title="Top Universities">
            <ul className="space-y-2">
              {selectedCountry.topUniversities.map((university) => (
                <li key={university} className="flex items-start gap-3 rounded-2xl border border-[#f7ebe7] bg-[#fffaf8] px-4 py-3 text-gray-700">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#fdf0ee] text-[11px] text-[#9a2119]">
                    <EnvironmentOutlined />
                  </span>
                  {university}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard icon={<DollarOutlined />} title="Scholarships">
            <ul className="space-y-2">
              {selectedCountry.scholarships.map((scholarship) => (
                <li key={scholarship} className="flex items-start gap-3 rounded-2xl border border-[#f7ebe7] bg-[#fffaf8] px-4 py-3 text-gray-700">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#fdf0ee] text-[11px] text-[#9a2119]">
                    <CheckCircleOutlined />
                  </span>
                  {scholarship}
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard icon={<SafetyCertificateOutlined />} title="Requirements">
            <ul className="space-y-2">
              {selectedCountry.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3 rounded-2xl border border-[#f7ebe7] bg-[#fffaf8] px-4 py-3 text-gray-700">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#fdf0ee] text-[11px] text-[#9a2119]">
                    <ArrowRightOutlined />
                  </span>
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
                    return;
                  }

                  setFormOpen(false);
                  navigate(`/app/subscription?returnTo=${encodeURIComponent(buildAbroadReturnTo())}`);
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
      <PageHero backOnly onBack={goToDashboard} />

      <div>
        <h1 className="text-2xl font-bold text-[#9a2119]">Study Abroad</h1>
        <p className="mt-1 text-sm text-[#8c6c67]">Explore destinations, costs, visa details, and top universities.</p>
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
              className="group relative cursor-pointer overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#d9b5ad] hover:shadow-lg hover:shadow-[#9a2119]/10"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f1913] via-[#9a2119] to-[#d56547]" />
              {!unlocked && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    countryFree ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {countryFree ? "FREE" : "LOCK"}
                </span>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf0ee] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#9a2119]">
                      <GlobalOutlined />
                      {country.flag}
                    </div>
                    <h3 className="text-lg font-bold text-[#9a2119]">{country.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {!unlocked ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          countryFree ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {countryFree ? "FREE" : "LOCK"}
                      </span>
                    ) : null}
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff6f2] text-[#9a2119] transition-colors group-hover:bg-[#9a2119] group-hover:text-white">
                      <EnvironmentOutlined />
                    </div>
                  </div>
                </div>

                <p className="line-clamp-2 text-sm leading-7 text-gray-600">{country.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#f7ebe7] bg-[#fffaf8] px-3 py-3">
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">
                      <DollarOutlined className="text-[#9a2119]" />
                      Tuition
                    </div>
                    <p className="m-0 text-sm font-semibold text-[#1a0a09]">{country.tuition}</p>
                  </div>
                  <div className="rounded-2xl border border-[#f7ebe7] bg-[#fffaf8] px-3 py-3">
                    <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#b8837e]">
                      <BankOutlined className="text-[#9a2119]" />
                      Intake
                    </div>
                    <p className="m-0 text-sm font-semibold text-[#1a0a09]">{country.intake}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#f0e4e2] pt-3">
                  <span className="text-xs font-semibold text-[#8c6c67]">Tap to explore details</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
                    Explore <ArrowRightOutlined />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Study Abroad"
        itemLabel={unlockModalItem}
        description="Your free study abroad access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildAbroadReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`);
        }}
      />
    </ModuleScreen>
  );
}

function InfoCard({ icon, title, value }) {
  return (
    <div className="motion-item rounded-[24px] border border-[#f0e4e2] bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fdf0ee] text-lg text-[#9a2119]">
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#b8837e]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-7 text-[#1a0a09]">{value}</p>
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="motion-item rounded-[26px] border border-[#f0e4e2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fdf0ee] text-[#9a2119]">
          {icon}
        </div>
        <h2 className="m-0 text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}
