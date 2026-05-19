import { useState } from "react";
import { Button } from "antd";
import {
  EnvironmentOutlined,
  StarFilled,
  BookOutlined,
  GlobalOutlined,
  CheckCircleFilled,
  SearchOutlined,
  RightOutlined,
  BankOutlined,
} from "@ant-design/icons";

import { institutes } from "../../../data/careermapData";
import { ModuleScreen, PageHero } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

/* -------- HELPERS -------- */
function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const ACCENTS = [
  "from-[#9a2119] to-red-400",
  "from-red-700 to-[#9a2119]",
  "from-[#9a2119] to-orange-500",
];

function getAccent(name = "") {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

/* ================= COMPONENT ================= */
export default function InstitutePage() {
  const { navigate, goToDashboard } = usePortalNavigation();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = institutes.filter((i) =>
    !search ||
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.location?.toLowerCase().includes(search.toLowerCase()) ||
    i.type?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= DETAIL VIEW ================= */
  if (selected) {
    const accent = getAccent(selected.name);
    const initials = getInitials(selected.name);

    return (
      <ModuleScreen className="space-y-4">
        <div>
          <PageHero backOnly onBack={() => setSelected(null)} />
        </div>

        {/* HERO */}
        <div className="motion-item bg-white rounded-2xl border overflow-hidden shadow">
          <div className="flex">

            {/* LEFT */}
            <div className="w-24 bg-[#9a2119] flex flex-col items-center justify-center py-6">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                <BankOutlined className="text-white text-lg" />
              </div>

              <div className="flex flex-col items-center">
                <StarFilled className="text-yellow-300" />
                <span className="text-white font-bold">{selected.rank}</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex-1 p-5 space-y-3">
              <span className="text-xs bg-[#fdf0ee] text-[#9a2119] px-2 py-1 rounded-full">
                {selected.type}
              </span>

              <h1 className="font-bold text-lg">{selected.name}</h1>

              <p className="text-sm text-gray-500 flex items-center gap-1">
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

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={<BankOutlined />} label="Type" value={selected.type} />
            <Stat icon={<StarFilled />} label="Rank" value={selected.rank} />
            <Stat icon={<BookOutlined />} label="Courses" value={`${selected.courses?.length || 0}+`} />
          </div>

          {/* ABOUT */}
          <Card title="About">
            <p className="text-sm text-gray-500">{selected.about}</p>
          </Card>

          {/* COURSES */}
          <Card title="Courses Offered">
            <div className="flex flex-wrap gap-2">
              {selected.courses?.map((c) => (
                <span
                  key={c}
                  className="bg-[#fdf0ee] text-[#9a2119] px-3 py-1 text-xs rounded-lg"
                >
                  {c}
                </span>
              ))}
            </div>
          </Card>

          {/* CTA */}
          <Button
            type="primary"
            href={selected.website}
            target="_blank"
            block
            className="motion-item !h-12 !rounded-xl !bg-[#9a2119] !border-[#9a2119]"
          >
            Visit Website
          </Button>
        </div>
      </ModuleScreen>
    );
  }

  /* ================= LIST VIEW ================= */
  return (
    <ModuleScreen className="space-y-5">
        <PageHero backOnly onBack={goToDashboard} />

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <h1 className="text-xl font-bold">Institutions</h1>
          <span className="text-xs bg-[#fdf0ee] text-[#9a2119] px-3 py-1 rounded-full">
            {filtered.length}
          </span>
        </div>

       

        {/* GRID */}
        <div className="content-stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item) => {
            const accent = getAccent(item.name);
            const initials = getInitials(item.name);

            return (
              <div
                key={item.name}
                onClick={() => setSelected(item)}
                className="bg-white border rounded-xl p-4 cursor-pointer hover:shadow"
              >
                <div className={`h-1 bg-gradient-to-r ${accent} mb-3`} />

                <div className="flex gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${accent} rounded-lg flex items-center justify-center text-white font-bold`}>
                    {initials}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{item.name}</h3>

                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <EnvironmentOutlined /> {item.location}
                    </p>
                  </div>

                  <span className="text-xs bg-[#9a2119] text-white px-2 py-0.5 rounded">
                    {item.rank}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#f0e4e2] pt-3 text-xs">
                  <span className="bg-[#fdf0ee] text-[#9a2119] px-2 py-1 rounded">
                    {item.type}
                  </span>

                  <span className="flex items-center gap-1 text-sm font-bold text-[#9a2119]">
                    Explore <RightOutlined />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No results found
          </div>
        )}
    </ModuleScreen>
  );
}

/* ================= SMALL UI ================= */

function Card({ title, children }) {
  return (
    <div className="motion-item bg-white border rounded-xl p-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Chip({ icon, text, green }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
      green ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
    }`}>
      {icon} {text}
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="motion-item bg-white border rounded-lg p-3 text-center">
      <div className="text-[#9a2119] mb-1">{icon}</div>
      <p className="font-bold text-[#9a2119]">{value}</p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
}
