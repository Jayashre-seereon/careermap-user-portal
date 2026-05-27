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
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState(fallbackInstitutes);
  const [error, setError] = useState("");

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

  if (selected) {
    return (
      <ModuleScreen className="space-y-4">
        <PageHero backOnly onBack={() => setSelected(null)} />

        <div className="motion-item overflow-hidden rounded-2xl border bg-white shadow">
          <div className="flex">
            <div className="flex w-24 flex-col items-center justify-center bg-[#9a2119] py-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <BankOutlined className="text-lg text-white" />
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-white">{selected.rank}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 p-5">
              <span className="rounded-full bg-[#fdf0ee] px-2 py-1 text-xs text-[#9a2119]">{selected.type}</span>
              <h1 className="text-lg font-bold">{selected.name}</h1>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <EnvironmentOutlined /> {selected.location}
              </p>
            </div>
          </div>
        </div>

        <div className="content-stagger space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card title="Type">
              <p className="m-0 text-base font-bold text-[#9a2119]">{selected.type}</p>
            </Card>
            <Card title="Courses">
              <p className="m-0 text-base font-bold text-[#1f1a1b]">{selected.courses?.length || 0} available</p>
            </Card>
          </div>

          <Card title="About">
            <p className="text-sm text-gray-500">{selected.about}</p>
          </Card>

          <Card title="Courses Offered">
            <div className="flex flex-wrap gap-2">
              {selected.courses?.length ? selected.courses.map((course) => (
                <span key={course} className="rounded-lg bg-[#fdf0ee] px-3 py-1 text-xs text-[#9a2119]">
                  {course}
                </span>
              )) : <span className="text-sm text-gray-500">No course list available.</span>}
            </div>
          </Card>

          <Button type="primary" href={selected.website} target="_blank" block className="motion-item !h-12 !rounded-xl !border-[#9a2119] !bg-[#9a2119]">
            Visit Website
          </Button>
        </div>
      </ModuleScreen>
    );
  }

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
              onClick={() => setSelected(item)}
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
                  {initials}
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
                  <span className="flex items-center gap-2 text-[14px] font-bold text-[#b22b1f] transition-transform duration-200 group-hover:translate-x-1">
                    Explore <RightOutlined />
                  </span>
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

function Card({ title, children }) {
  return (
    <div className="motion-item rounded-xl border bg-white p-4">
      <h3 className="mb-2 font-semibold">{title}</h3>
      {children}
    </div>
  );
}
