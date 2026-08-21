import { useEffect, useMemo, useState } from "react";
import { Alert, Button ,Select} from "antd";
import {
  EnvironmentOutlined,
  BookOutlined,
  RightOutlined,
  BankOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { State, City } from "country-state-city";
import { getInstitutes } from "../../../api/instituteApi";
import { institutes as fallbackInstitutes } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { UnlockRedirectModal, usePortalNavigation } from "../../portal/components/portalPageShared";
import { checkModuleAccess } from "../../../api/moduleAccessApi";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
function getAccentByType(type = "") {
  const t = type.toLowerCase();

  if (t.includes("government")) {
    return "from-[#b42117] to-[#9a2119]"; // 🔴 RED
  }

  if (t.includes("private")) {
    return "from-[#ff7b12] to-[#c84f15]"; // 🟠 ORANGE
  }

  return "from-gray-400 to-gray-500"; // fallback
}
const ACCENTS = ["from-[#9a2119] to-[#c73a2f]", "from-[#b42117] to-[#9a2119]", "from-[#c84f15] to-[#ff7b12]"];

function getAccent(name = "") {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

export default function InstitutePage() {
  const { goToDashboard, navigate, location } = usePortalNavigation();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(fallbackInstitutes);
  const [error, setError] = useState("");
  const [country, setCountry] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [secondCategory, setSecondCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [unlockModalItem, setUnlockModalItem] = useState(null);
  const [moduleMode, setModuleMode] = useState(location.state?.accessStatus || "preview");
  const [page, setPage] = useState(1);
const [pagination, setPagination] = useState(null);
const [loading, setLoading] = useState(false);
  useEffect(() => {
  let active = true;

 async function loadInstitutes(currentPage) {
  try {
    setLoading(true);
    setError("");

    const response = await getInstitutes(currentPage);

    if (active) {
      setItems(response.items);
      setPagination(response.pagination);
    }
  } catch (loadError) {
    if (active) {
      setError(
        loadError?.response?.data?.message ||
        loadError?.message ||
        "Failed to load institutes."
      );
    }
  } finally {
    if (active) {
      setLoading(false);
    }
  }
}

  loadInstitutes();

  return () => {
    active = false;
  };
}, []);

// ✅ Correct place
useEffect(() => {
  setStateFilter("");
}, [country]);

 useEffect(() => {
  let active = true;

  async function loadInstitutes(currentPage) {
    try {
      setLoading(true);
      setError("");

      const response = await getInstitutes(currentPage);

      if (active) {
        setItems(response.items);
        setPagination(response.pagination);
      }
    } catch (loadError) {
      if (active) {
        setError(
          loadError?.response?.data?.message ||
          loadError?.message ||
          "Failed to load institutes."
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  }

  loadInstitutes(page);

  return () => {
    active = false;
  };
}, [page]);
  const categoryOptions = useMemo(
    () => [...new Map(items.filter((i) => i.category).map((i) => [i.category.id, i.category])).values()],
    [items]
  );

  const secondCategoryOptions = useMemo(() => {
    const source = category
      ? items.filter((i) => String(i.category?.id) === String(category))
      : items;
    return [...new Map(source.filter((i) => i.secondcategory).map((i) => [i.secondcategory.id, i.secondcategory])).values()];
  }, [items, category]);

  const subCategoryOptions = useMemo(() => {
    let source = items;
    if (category) {
      source = source.filter((i) => String(i.category?.id) === String(category));
    }
    if (secondCategory) {
      source = source.filter((i) => String(i.secondcategory?.id) === String(secondCategory));
    }
    return [...new Map(source.filter((i) => i.subcategory).map((i) => [i.subcategory.id, i.subcategory])).values()];
  }, [items, category, secondCategory]);

  function handleCategoryChange(value) {
    setCategory(value);
    setSecondCategory("");
    setSubCategory("");
  }

  function handleSecondCategoryChange(value) {
    setSecondCategory(value);
    setSubCategory("");
  }

const filtered = useMemo(
  () =>
    items
      .filter((item) => {
        const matchesSearch =
          !search ||
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.location?.toLowerCase().includes(search.toLowerCase()) ||
          item.type?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !category || String(item.category?.id) === String(category);
        const matchesSecondCategory = !secondCategory || String(item.secondcategory?.id) === String(secondCategory);
        const matchesSubCategory = !subCategory || String(item.subcategory?.id) === String(subCategory);
        const matchesCountry = !country || item.country?.toLowerCase() === country.toLowerCase();
        const matchesState = !stateFilter || item.state?.toLowerCase() === stateFilter.toLowerCase();
        const matchesType = !type || item.type?.trim() === type;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSecondCategory &&
          matchesSubCategory &&
          matchesCountry &&
          matchesState &&
          matchesType
        );
      })
      .sort((a, b) => {
        // prefer createdAt if backend provides it
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // fallback: higher id = more recently added
        return Number(b.id) - Number(a.id);
      }),
  [items, search, category, secondCategory, subCategory, country, stateFilter, type]
);
const countryOptions = useMemo(() => {
  const list = [...new Set(items.map(i => i.country).filter(Boolean))];
  return list;
}, [items]);
const stateOptions = useMemo(() => {
  if (!country) return [];

 if (country === "india") {
  return State.getStatesOfCountry("IN").map((s) => ({
    value: s.name.toLowerCase(),   
    label: s.name,
  }));
}

  // 🌍 Other countries → your API logic
  const states = items
  .filter((i) => i.country?.toLowerCase() === country)
    .map((i) => i.state)
    .filter(Boolean);

  return [...new Set(states)].map((s) => ({
    value: s,
    label: s,
  }));
}, [items, country]);

const typeOptions = useMemo(
  () => [...new Set(items.map(i => i.type?.trim()).filter(Boolean))],
  [items]
);
  return (
    <ModuleScreen className="space-y-5">
      {error ? <Alert type="warning" title={error} showIcon style={{ borderRadius: 16 }} /> : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Institutions</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#fdf0ee] px-3 py-1 text-xs text-[#9a2119]">{filtered.length}</span>
          <PageHero backOnly onBack={goToDashboard} className="shrink-0" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
    <Select
      showSearch
      allowClear
      placeholder="All Categories"
      optionFilterProp="label"
      value={category || undefined}
      onChange={(value) => handleCategoryChange(value || "")}
      options={categoryOptions.map((opt) => ({ value: String(opt.id), label: opt.title }))}
      style={{ minWidth: 180 }}
      className="pill-select"
    />
  </div>

  <div className="relative">
    <Select
      showSearch
      allowClear
      placeholder="All Second Categories"
      optionFilterProp="label"
      value={secondCategory || undefined}
      onChange={(value) => handleSecondCategoryChange(value || "")}
      options={secondCategoryOptions.map((opt) => ({ value: String(opt.id), label: opt.name }))}
      style={{ minWidth: 200 }}
      className="pill-select"
    />
  </div>

  <div className="relative">
    <Select
      showSearch
      allowClear
      placeholder="All Sub Categories"
      optionFilterProp="label"
      value={subCategory || undefined}
      onChange={(value) => setSubCategory(value || "")}
      options={subCategoryOptions.map((opt) => ({ value: String(opt.id), label: opt.title }))}
      style={{ minWidth: 200 }}
      className="pill-select"
    />
  </div>

  <div className="relative">
    <Select
      showSearch
      allowClear
      placeholder="All Countries"
      optionFilterProp="label"
      value={country || undefined}
     onChange={(value) => setCountry(value?.toLowerCase() || "")}  options={countryOptions.map((c) => ({ value: c, label: c }))}
      style={{ minWidth: 160 }}
      className="pill-select"
    />
  </div>
<Select
  showSearch
  allowClear
  placeholder="All States"
  value={stateFilter || undefined}
  onChange={(value) => setStateFilter(value || "")}
  options={stateOptions}
  style={{ minWidth: 160 }}
/>

  <div className="relative">
    <Select
      showSearch
      allowClear
      placeholder="All Types"
      optionFilterProp="label"
      value={type || undefined}
      onChange={(value) => setType(value || "")}
      options={typeOptions.map((t) => ({ value: t, label: t }))}
      style={{ minWidth: 160 }}
      className="pill-select"
    />
  </div>

        {(category || secondCategory || subCategory || country || stateFilter || type) ? (
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setSecondCategory("");
              setSubCategory("");
              setCountry("");
              setStateFilter("");
              setType("");
            }}
            className="rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[#9a2119] underline-offset-2 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="content-stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item, index) => {
      const accent = getAccentByType(item.type);
          const initials = getInitials(item.name);
          const websiteUrl = item.url || item.website;
          const isPreviewMode = moduleMode === "preview";
          const isFree = !isPreviewMode || index < 4;

          return (
            <div
              key={item.id || item.name}
              onClick={() => {
                if (!isFree) {
                  setUnlockModalItem(item.name);
                }
              }}
              className="group cursor-pointer overflow-hidden rounded-[28px] border border-[#e8dfda] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d7c3bc] hover:shadow-xl"
            >
              <div className={`h-24 bg-gradient-to-r ${accent} p-5`}>
                <div className="flex items-start justify-between gap-3">
                 <div className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">
  {item.type}
</div>
                 <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isFree ? "bg-green-50" : "bg-red-50"}`}>
                {isFree ? <UnlockOutlined className="text-green-600" /> : <LockOutlined className="text-red-500" />}
              </div>
                </div>
              </div>

              <div className="relative px-5 pb-5 pt-0">
                <div className={`-mt-8 flex h-[64px] w-[64px] items-center justify-center rounded-[20px] border-4 border-white bg-gradient-to-br ${accent} text-[20px] font-black text-white shadow-md`}>
                  {item.logo ? (
                    <img src={item.logo} alt={item.name} className="h-full w-full rounded-[16px] object-cover" loading="lazy" />
                  ) : (
                    initials
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="line-clamp-3 text-[20px] font-black leading-tight text-[#241d1e]">
                    {item.name}
                  </h3>
                  <p className="mt-3 flex min-h-[44px] items-start gap-2 text-[14px] leading-6 text-[#746d73]">
                    <EnvironmentOutlined className="mt-1 text-[13px] text-[#9a2119]" />
                    <span>{item.location}</span>
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#efe3de] pt-4">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#aa8a83]">
                  
                  </span>
                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isFree) {
                          e.preventDefault();
                          setUnlockModalItem(item.name);
                        }
                      }}
                      className="flex items-center gap-2 text-[14px] font-bold text-[#b22b1f]"
                    >
                      Explore <RightOutlined />
                    </a>
                  ) : (
                    <span>No Website</span>
                  )}
                </div>
                
              </div>
            </div>
          );
        })}
      </div>

     {pagination && pagination.totalPages > 1 && (
  <div className="flex items-center justify-center gap-3 py-6">
    <Button
      disabled={!pagination.hasPreviousPage || loading}
      onClick={() => setPage((prev) => prev - 1)}
    >
      Previous
    </Button>

    <span className="text-sm font-semibold">
      Page {pagination.page} of {pagination.totalPages}
    </span>

    <Button
      disabled={!pagination.hasNextPage || loading}
      onClick={() => setPage((prev) => prev + 1)}
    >
      Next
    </Button>
  </div>
)}
      <UnlockRedirectModal
        open={Boolean(unlockModalItem)}
        title="Unlock Institute"
        itemLabel={unlockModalItem}
        description="Your free institute access has already been used. Subscribe to unlock "
        onCancel={() => setUnlockModalItem(null)}
        onConfirm={() => {
          setUnlockModalItem(null);
          navigate(`/app/subscription?returnTo=${encodeURIComponent(location.pathname)}`);
        }}
      />
    </ModuleScreen>
  );
}
