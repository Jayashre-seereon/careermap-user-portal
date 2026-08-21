import { useEffect, useState } from "react";
import {
  ArrowRightOutlined,
  BookOutlined,
  BuildOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { createStudyAbroadConsultation, getStudyAbroadCountries } from "../../../api/studyabroadApi";
import { studyAbroadCountries as fallbackStudyAbroadCountries } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";

// Fixed, common to all destinations — shown once on the listing page, not per country
const INTRO_TEXT =
  "Explore world-class education opportunities in the world's leading study destinations. We help students secure admission to top-ranked universities offering Undergraduate (UG) and Postgraduate (PG) programs across the UK, USA, Canada, Europe, Singapore, and Dubai.";

const UG_PROGRAMS = [
  "BBA",
  "B.Com",
  "B.Tech / Engineering",
  "Computer Science",
  "Artificial Intelligence",
  "Data Science",
  "Nursing",
  "Psychology",
  "Architecture",
  "Hospitality Management",
  "Media & Communication",
  "Biotechnology",
];

const PG_PROGRAMS = [
  "MBA",
  "MSc Computer Science",
  "MSc Data Science",
  "MSc Artificial Intelligence",
  "MSc Engineering",
  "MSc Finance",
  "MSc Marketing",
  "Master of Public Health (MPH)",
  "Master of Laws (LLM)",
  "Master of Education (M.Ed.)",
  "MSc Cybersecurity",
  "MSc Business Analytics",
];

function ProgramList({ icon, title, programs }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fdf0ee] text-[#9a2119]">
          {icon}
        </div>
        <h3 className="m-0 text-base font-bold text-gray-800">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {programs.map((program) => (
          <span
            key={program}
            className="rounded-full border border-[#f5d8d1] bg-[#fdf4f2] px-3 py-1.5 text-sm font-semibold text-[#9a2119]"
          >
            {program}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AbroadPage() {
  const { isUnlocked } = useAppState();
  const { navigate, location, goToDashboard } = usePortalNavigation();
  const accessStatus = location.state?.accessStatus || "preview";
  const unlocked = accessStatus === "full" || isUnlocked("abroad-consultancy");

  const [countryList, setCountryList] = useState(fallbackStudyAbroadCountries);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [consultForm, setConsultForm] = useState({
    courseInterest: "",
    budgetRange: "",
    preferredIntake: "",
    message: "",
  });

  const activeCountry = selectedCountry;

  function buildAbroadReturnTo(countryRef = activeCountry) {
    const countryName = typeof countryRef === "string" ? countryRef : countryRef?.name;
    const countryId = typeof countryRef === "object" ? countryRef?.id : "";
    const nextParams = new URLSearchParams();

    if (countryId) nextParams.set("countryId", countryId);
    if (countryName) nextParams.set("country", countryName);

    const query = nextParams.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  useEffect(() => {
    let active = true;

    async function loadCountries() {
      try {
        setLoadError("");
        const items = await getStudyAbroadCountries();
        if (active) {
       setCountryList(items.length ? [...items].sort((a, b) => b.id - a.id) : fallbackStudyAbroadCountries); }
      } catch (error) {
        if (active) {
          setLoadError(error?.response?.data?.message || error?.message || "Failed to load study abroad destinations.");
          setCountryList(fallbackStudyAbroadCountries);
        }
      }
    }

    loadCountries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const countryParam = searchParams.get("countryId") || searchParams.get("country");

    if (!countryParam) {
      return;
    }

    const country = countryList.find(
      (item) => String(item.id) === String(countryParam) || item.name === countryParam || item.countryName === countryParam
    );

    if (country) {
      setSelectedCountry(country);
    }
  }, [countryList, location.search]);

  function handleCardConsult(country, isFree, event) {
    event.stopPropagation();
    if (!isFree || !unlocked) {
      setUnlockModalItem(country.name);
      return;
    }
    setSelectedCountry(country);
    setFormOpen(true);
  }

  if (submitted && activeCountry) {
    return (
      <ModuleScreen className="space-y-6">
        <PageHero backOnly onBack={() => setSubmitted(false)} />
        <div className="motion-item rounded-[28px] border border-[#f0e4e2] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf0ee] text-xl text-[#9a2119]">
            <CheckCircleOutlined />
          </div>
          <h2 className="text-xl font-bold text-[#9a2119]">Request Submitted</h2>
          <p className="mt-2 text-gray-600">
            Your consultation request for {activeCountry.name} has been recorded.
          </p>
          <button
            type="button"
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
    <ModuleScreen className="space-y-6  pb-28">
      {/* Back */}
      <PageHero
        backOnly
        onBack={() => setSelectedCountry(null)}
      />

      {/* Hero */}
      <div className="overflow-hidden rounded-[30px] border border-[#f0e4e2] bg-white shadow-sm">
        <div className="relative px-6 py-8 md:px-10 md:py-10">
          {/* Decorative background */}
          <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#fdf0ee]" />
          <div className="absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-[#fdf5f3]" />

          <div className="relative flex flex-col items-center text-center md:flex-row md:items-center md:text-left">
            {/* Country Icon */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[5px] border-[#f8ddd7] bg-[#fff7f5] text-4xl text-[#9a2119] shadow-sm">
              <GlobalOutlined />
            </div>

            {/* Country Details */}
            <div className="mt-5 md:ml-7 md:mt-0">
              <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
               

                <span className="rounded-full bg-[#fdf0ee] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a2119]">
                  Study Destination
                </span>
              </div>

              <h1 className="m-0 text-3xl font-extrabold tracking-tight text-[#241312] md:text-4xl">
                 {selectedCountry.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8c6c67]">
                Explore education opportunities, universities, programs,
                and study options in {selectedCountry.name}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Description */}
        <div className="rounded-[28px] border border-[#f0e4e2] bg-white p-6 shadow-sm md:p-8">
          {/* Section Header */}
          <div className="mb-6 flex items-center gap-3 border-b border-[#f4e6e3] pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fdf0ee] text-lg text-[#9a2119]">
              <ReadOutlined />
            </div>

            <div>
              <h2 className="m-0 text-xl font-bold text-[#241312]">
                About {selectedCountry.name}
              </h2>

              <p className="m-0 mt-1 text-xs text-[#9b817c]">
                Everything you need to know about studying here
              </p>
            </div>
          </div>

          {/* API Content */}
          <div
            className="
              text-sm leading-7 text-gray-700

              [&_h1]:mb-3
              [&_h1]:mt-5
              [&_h1]:text-2xl
              [&_h1]:font-bold
              [&_h1]:text-[#9a2119]

              [&_h2]:mb-3
              [&_h2]:mt-7
              [&_h2]:text-xl
              [&_h2]:font-bold
              [&_h2]:text-[#9a2119]

              [&_h3]:mb-2
              [&_h3]:mt-6
              [&_h3]:text-lg
              [&_h3]:font-bold
              [&_h3]:text-[#9a2119]

              [&_p]:mb-4

              [&_ul]:mb-5
              [&_ul]:list-disc
              [&_ul]:space-y-2
              [&_ul]:pl-6

              [&_ol]:mb-5
              [&_ol]:list-decimal
              [&_ol]:space-y-2
              [&_ol]:pl-6

              [&_li]:text-gray-700

              [&_strong]:font-bold
              [&_strong]:text-[#241312]

              [&_a]:font-semibold
              [&_a]:text-[#9a2119]
              [&_a]:underline
            "
            dangerouslySetInnerHTML={{
              __html:
                selectedCountry.descriptionHtml ||
                selectedCountry.description,
            }}
          />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
         

          {/* Consultation Card */}
          <div className="overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf0ee] text-xl text-[#9a2119]">
              <BookOutlined />
            </div>

            <h3 className="m-0 text-xl font-bold text-[#241312]">
              Need Help Choosing?
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Get personalized guidance about courses, universities,
              applications, and studying in {selectedCountry.name}.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!unlocked) {
                  setUnlockModalItem(selectedCountry.name);
                  return;
                }

                setFormOpen(true);
              }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9a2119] py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-[#7f1913] hover:shadow-md"
            >
              {unlocked
                ? "Get Free Consultation"
                : "Unlock Consultation"}

              <ArrowRightOutlined />
            </button>
          </div>

          {/* Quick Benefits */}
          <div className="rounded-[26px] border border-[#f0e4e2] bg-white p-5 shadow-sm">
            <h3 className="m-0 text-base font-bold text-[#241312]">
              Why Get Guidance?
            </h3>

            <div className="mt-4 space-y-3">
              {[
                "Course selection guidance",
                "University selection",
                "Application assistance",
                "Study destination guidance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-[#fff8f6] px-3 py-2.5"
                >
                  <CheckCircleOutlined className="text-[#9a2119]" />

                  <span className="text-sm font-medium text-gray-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {formOpen ? (
       <div className="fixed inset-0 z-0 flex items-start justify-center bg-black/50 p-4 pt-24 backdrop-blur-sm">    <div className="w-full max-w-md overflow-hidden rounded-[26px] bg-white shadow-2xl">
            <div className="border-b border-[#f0e4e2] px-6 py-5">
              <h2 className="m-0 text-xl font-bold text-[#241312]">
                Get Free Consultation
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Tell us about your study plans.
              </p>
            </div>

            <div className="space-y-4 p-6">
              <input
                className="w-full rounded-xl border border-[#ead9d5] bg-[#fffdfc] p-3 text-sm outline-none transition focus:border-[#9a2119] focus:ring-2 focus:ring-[#9a2119]/10"
                placeholder="Course Interest"
                value={consultForm.courseInterest}
                onChange={(event) =>
                  setConsultForm((current) => ({
                    ...current,
                    courseInterest: event.target.value,
                  }))
                }
              />

              <input
                className="w-full rounded-xl border border-[#ead9d5] bg-[#fffdfc] p-3 text-sm outline-none transition focus:border-[#9a2119] focus:ring-2 focus:ring-[#9a2119]/10"
                placeholder="Budget Range"
                value={consultForm.budgetRange}
                onChange={(event) =>
                  setConsultForm((current) => ({
                    ...current,
                    budgetRange: event.target.value,
                  }))
                }
              />

              <input
                className="w-full rounded-xl border border-[#ead9d5] bg-[#fffdfc] p-3 text-sm outline-none transition focus:border-[#9a2119] focus:ring-2 focus:ring-[#9a2119]/10"
                placeholder="Preferred Country"
                value={consultForm.preferredIntake}
                onChange={(event) =>
                  setConsultForm((current) => ({
                    ...current,
                    preferredIntake: event.target.value,
                  }))
                }
              />

              <textarea
                className="w-full resize-none rounded-xl border border-[#ead9d5] bg-[#fffdfc] p-3 text-sm outline-none transition focus:border-[#9a2119] focus:ring-2 focus:ring-[#9a2119]/10"
                rows={4}
                placeholder="Message"
                value={consultForm.message}
                onChange={(event) =>
                  setConsultForm((current) => ({
                    ...current,
                    message: event.target.value,
                  }))
                }
              />

              {submitError ? (
                <p className="text-sm font-medium text-[#9a2119]">
                  {submitError}
                </p>
              ) : null}

              <button
                type="button"
                disabled={submitting}
                onClick={async () => {
                  if (!unlocked) {
                    setFormOpen(false);
                    navigate(
                      `/app/subscription?returnTo=${encodeURIComponent(
                        buildAbroadReturnTo()
                      )}`
                    );
                    return;
                  }

                  try {
                    setSubmitting(true);
                    setSubmitError("");

                    await createStudyAbroadConsultation({
                      studyAbroadId: Number(selectedCountry.id),
                      preferredCountry: selectedCountry.name,
                      courseInterest: consultForm.courseInterest,
                      budgetRange: consultForm.budgetRange,
                      preferredIntake: consultForm.preferredIntake,
                      message: consultForm.message,
                    });

                    setSubmitted(true);
                    setFormOpen(false);
                  } catch (error) {
                    setSubmitError(
                      error?.response?.data?.message ||
                        error?.message ||
                        "Failed to submit consultation."
                    );
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="flex w-full items-center justify-center rounded-xl bg-[#9a2119] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#7f1913]"
              >
                {submitting
                  ? "Submitting..."
                  : unlocked
                  ? "Submit Request"
                  : "Subscribe to Submit"}
              </button>

              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="w-full text-sm font-medium text-gray-500 hover:text-[#9a2119]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Study Abroad"
        itemLabel={unlockModalItem}
        description="Your free study abroad access has already been used. Subscribe to unlock"
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          const returnTo = buildAbroadReturnTo(unlockModalItem);
          setUnlockModalItem(null);
          navigate(
            `/app/subscription?returnTo=${encodeURIComponent(returnTo)}`
          );
        }}
      />
    </ModuleScreen>
  );
}


  return (
    <ModuleScreen className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#9a2119]">Study Abroad</h1>
          <p className="mt-1 text-sm text-[#8c6c67]">Explore destinations and get a free consultation.</p>
          {loadError ? <p className="mt-2 text-sm font-semibold text-[#9a2119]">{loadError}</p> : null}
        </div>
        <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
      </div>

      {/* Two-column layout: destination cards on the left, programs panel on the right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Left column — intro text + destination cards */}
        <div className="space-y-6 lg:order-1">
          <p className="text-sm leading-7 text-gray-700">{INTRO_TEXT}</p>

          <div className="content-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {countryList.map((country, index) => {
              const isPreviewMode = accessStatus === "preview";
              const isFree = !isPreviewMode || index < 4;

              return (
                <div
                  key={country.id || country.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!isFree) {
                      setUnlockModalItem(country.name);
                      return;
                    }
                    setSelectedCountry(country);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      if (!isFree) {
                        setUnlockModalItem(country.name);
                        return;
                      }
                      setSelectedCountry(country);
                    }
                  }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-[26px] border border-[#f0e4e2] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#d9b5ad] hover:shadow-lg hover:shadow-[#9a2119]/10"
                >
                  <div className="flex flex-1 flex-col items-center px-5 pb-5 pt-7 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#f5d8d1] bg-[#fff7f5] text-2xl text-[#9a2119] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#9a2119] group-hover:text-white">
                      <GlobalOutlined />
                    </div>

                    <h3 className="m-0 mt-4 text-xl font-bold leading-tight text-[#241312] transition-colors group-hover:text-[#9a2119]">
                      {country.name}
                    </h3>

                    {!unlocked ? (
                      <span
                        className={`mt-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide ${
                          isFree ? "bg-green-50 text-green-600" : "bg-[#fdf0ee] text-[#9a2119]"
                        }`}
                      >
                        {isFree ? "FREE ACCESS" : "LOCKED"}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={(event) => handleCardConsult(country, isFree, event)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#9a2119] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#7f1913] hover:shadow-md"
                    >
                      Get Consultation
                      <ArrowRightOutlined className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column — programs panel (same for every destination, shown once here) */}
        <div className="motion-item space-y-6 rounded-[26px] border border-[#f0e4e2] bg-white p-6 shadow-sm lg:sticky lg:top-6 lg:order-2">
          <ProgramList icon={<BookOutlined />} title="Popular Undergraduate (UG) Programs" programs={UG_PROGRAMS} />

          <div className="border-t border-[#f0e4e2] pt-5">
            <ProgramList icon={<ReadOutlined />} title="Popular Postgraduate (PG) Programs" programs={PG_PROGRAMS} />
          </div>
        </div>
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
