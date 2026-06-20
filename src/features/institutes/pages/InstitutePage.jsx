import { useEffect, useMemo, useState } from "react";
import { Alert, Button } from "antd";
import {
  EnvironmentOutlined,
  BookOutlined,
  RightOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { getInstitutes } from "../../../api/instituteApi";
import { institutes as fallbackInstitutes } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const ACCENTS = ["from-[#9a2119] to-[#c73a2f]", "from-[#b42117] to-[#9a2119]", "from-[#c84f15] to-[#ff7b12]"];

function getAccent(name = "") {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

export default function InstitutePage() {
  const { goToDashboard } = usePortalNavigation();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(fallbackInstitutes);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [secondCategory, setSecondCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    let active = true;

    async function loadInstitutes() {
      try {
        setError("");
        const response = await getInstitutes();
        if (active && response.length) {
          setItems(response);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError?.response?.data?.message || loadError?.message || "Failed to load institutes.");
        }
      }
    }

    loadInstitutes();
    return () => {
      active = false;
    };
  }, []);

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
      items.filter((item) => {
        const matchesSearch =
          !search ||
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.location?.toLowerCase().includes(search.toLowerCase()) ||
          item.type?.toLowerCase().includes(search.toLowerCase());

        const matchesCategory = !category || String(item.category?.id) === String(category);
        const matchesSecondCategory = !secondCategory || String(item.secondcategory?.id) === String(secondCategory);
        const matchesSubCategory = !subCategory || String(item.subcategory?.id) === String(subCategory);

        return matchesSearch && matchesCategory && matchesSecondCategory && matchesSubCategory;
      }),
    [items, search, category, secondCategory, subCategory]
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
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="appearance-none rounded-full border border-[#eaded9] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#d7c3bc] focus:border-[#9a2119]"
          >
            <option value="">All Categories</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.title}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#aa8a83]" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="relative">
          <select
            value={secondCategory}
            onChange={(e) => handleSecondCategoryChange(e.target.value)}
            className="appearance-none rounded-full border border-[#eaded9] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#d7c3bc] focus:border-[#9a2119]"
          >
            <option value="">All Second Categories</option>
            {secondCategoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#aa8a83]" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="relative">
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="appearance-none rounded-full border border-[#eaded9] bg-white py-1.5 pl-3 pr-7 text-[12px] font-semibold text-[#5b5256] outline-none transition hover:border-[#d7c3bc] focus:border-[#9a2119]"
          >
            <option value="">All Sub Categories</option>
            {subCategoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.title}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#aa8a83]" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {(category || secondCategory || subCategory) ? (
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setSecondCategory("");
              setSubCategory("");
            }}
            className="rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[#9a2119] underline-offset-2 hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <div className="content-stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const accent = getAccent(item.name);
          const initials = getInitials(item.name);
          const websiteUrl = item.url || item.website;

          return (
            <div
              key={item.id || item.name}
              className="group cursor-pointer overflow-hidden rounded-[28px] border border-[#e8dfda] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#d7c3bc] hover:shadow-xl"
            >
              <div className={`h-24 bg-gradient-to-r ${accent} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-full bg-white/18 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/90">
                    Institute
                  </div>
                  <div className="rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#9a2119] shadow-sm">
                    {item.rank}
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
                    View Details
                  </span>
                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
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

      {filtered.length === 0 ? <div className="py-10 text-center text-gray-500">No results found</div> : null}
    </ModuleScreen>
  );
}