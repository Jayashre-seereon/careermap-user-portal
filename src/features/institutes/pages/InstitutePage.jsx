import { useEffect, useMemo, useState } from "react";
import { Alert, Button } from "antd";
import {
  EnvironmentOutlined,
  StarFilled,
  BookOutlined,
  GlobalOutlined,
  CheckCircleFilled,
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

const ACCENTS = ["from-[#9a2119] to-red-400", "from-red-700 to-[#9a2119]", "from-[#9a2119] to-orange-500"];

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
    const accent = getAccent(selected.name);

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
                <StarFilled className="text-yellow-300" />
                <span className="font-bold text-white">{selected.rank}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 p-5">
              <span className="rounded-full bg-[#fdf0ee] px-2 py-1 text-xs text-[#9a2119]">{selected.type}</span>
              <h1 className="text-lg font-bold">{selected.name}</h1>
              <p className="flex items-center gap-1 text-sm text-gray-500">
                <EnvironmentOutlined /> {selected.location}
              </p>

              <div className="flex gap-2 pt-2">
                <Chip icon={<BookOutlined />} text={`${selected.courses?.length || 0} Courses`} />
                <Chip icon={<GlobalOutlined />} text="Website" />
                <Chip icon={<CheckCircleFilled />} text="Verified" green />
              </div>
            </div>
          </div>
        </div>

        <div className="content-stagger space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<BankOutlined />} label="Type" value={selected.type} />
            <Stat icon={<StarFilled />} label="Rank" value={selected.rank} />
            <Stat icon={<BookOutlined />} label="Courses" value={`${selected.courses?.length || 0}+`} />
          </div>

          <Card title="About">
            <p className="text-sm text-gray-500">{selected.about}</p>
          </Card>

          <Card title="Courses Offered">
            <div className="flex flex-wrap gap-2">
              {selected.courses?.map((course) => (
                <span key={course} className="rounded-lg bg-[#fdf0ee] px-3 py-1 text-xs text-[#9a2119]">
                  {course}
                </span>
              ))}
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
            <div key={item.id || item.name} onClick={() => setSelected(item)} className="cursor-pointer rounded-xl border bg-white p-4 hover:shadow">
              <div className={`mb-3 h-1 bg-gradient-to-r ${accent}`} />

              <div className="flex gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${accent} font-bold text-white`}>
                  {initials}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <EnvironmentOutlined /> {item.location}
                  </p>
                </div>

                <span className="rounded bg-[#9a2119] px-2 py-0.5 text-xs text-white">{item.rank}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#f0e4e2] pt-3 text-xs">
                <span className="rounded bg-[#fdf0ee] px-2 py-1 text-[#9a2119]">{item.type}</span>
                <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
                  Explore <RightOutlined />
                </span>
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

function Chip({ icon, text, green }) {
  return <div className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${green ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{icon} {text}</div>;
}

function Stat({ icon, label, value }) {
  return (
    <div className="motion-item rounded-lg border bg-white p-3 text-center">
      <div className="mb-1 text-[#9a2119]">{icon}</div>
      <p className="font-bold text-[#9a2119]">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
