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
const [category, setCategory] = useState();
const [secondCategory, setSecondCategory] = useState();
const [subCategory, setSubCategory] = useState();
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
const categoryOptions = [...new Map(items.map(i => [i.category?.id, i.category])).values()];
const secondCategoryOptions = [...new Map(items.map(i => [i.secondcategory?.id, i.secondcategory])).values()];
const subCategoryOptions = [...new Map(items.map(i => [i.subcategory?.id, i.subcategory])).values()];
  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          !search ||
          item.name?.toLowerCase().includes(search.toLowerCase()) ||
          item.location?.toLowerCase().includes(search.toLowerCase()) ||
          item.type?.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
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

      <div className="rounded-2xl border border-[#eedad4] bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search institutes by name, location, or type"
          className="w-full rounded-xl border border-[#eaded9] px-4 py-3 text-sm outline-none transition focus:border-[#9a2119]"
        />
      </div>

      <div className="content-stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {filtered.map((item) => {
          const accent = getAccent(item.name);
          const initials = getInitials(item.name);

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
     {(item.url || item.website) ? (
  <a
    href={item.url || item.website}
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
                {item.tentativeDate ? <div className="mt-2 text-[11px] font-semibold text-[#8b7f7b]">Tentative: {item.tentativeDate}</div> : null}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? <div className="py-10 text-center text-gray-500">No results found</div> : null}
    </ModuleScreen>
  );
}

function Card({ title, children }) {
  return (
    <div className="motion-item rounded-xl border bg-white p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </div>
  );
}
