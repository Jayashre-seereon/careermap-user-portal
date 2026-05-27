import api from "./axios";

function buildLocation(city, state) {
  return [city, state].filter(Boolean).join(", ") || "Location not available";
}

function stripHtml(value) {
  if (!value) {
    return "";
  }

  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function mapInstituteItem(item, index) {
  const state = item?.state || "";
  const city = item?.city || "";
  const instituteType = item?.institute_type || "Institute";
  const courses = Array.isArray(item?.course_offered) ? item.course_offered.filter(Boolean) : [];

  return {
    id: String(item?.id ?? `institute-${index}`),
    name: item?.name || "Unnamed Institute",
    location: buildLocation(city, state),
    courses,
    type: instituteType,
    state,
    city,
    about: stripHtml(item?.about) || "About information is not available right now.",
    website: item?.url || "#",
    rank: item?.rank || "Top",
  };
}

export async function getInstitutes() {
  const response = await api.get("/institutes");
  const items = Array.isArray(response?.data?.data) ? response.data.data : [];

  return items.map((item, index) => mapInstituteItem(item, index));
}
