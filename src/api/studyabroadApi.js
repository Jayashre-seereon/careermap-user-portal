import api from "./axios";
import { useAuthStore } from "../store/authStore";

function stripHtml(value) {
  if (!value) {
    return "";
  }

  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatList(value, fallback) {
  if (Array.isArray(value)) {
    const items = value.map((item) => String(item).trim()).filter(Boolean);
    return items.length ? items : [fallback];
  }

  if (!value) {
    return [fallback];
  }

  const items = String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length ? items : [fallback];
}

function formatCost(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value).trim() || fallback;
}

function resolveFlag(title, countryName) {
  const rawValue = String(title || countryName || "").trim();
  return rawValue ? rawValue.slice(0, 3).toUpperCase() : "INT";
}

function mapStudyAbroadItem(item, index) {
  const title = item?.title || item?.country_name || "Study Abroad";
  const countryName = item?.country_name || title;

  return {
    id: String(item?.id ?? `study-abroad-${index}`),
    title,
    name: countryName,
    countryName,
    flag: resolveFlag(item?.flag, countryName),
    description: stripHtml(item?.description) || "Description not available.",
    detail: stripHtml(item?.overview) || "Overview not available.",
    overview: stripHtml(item?.overview) || "Overview not available.",
    visa: stripHtml(item?.visa_work) || "Visa guidance not available.",
    visaWork: stripHtml(item?.visa_work) || "Visa guidance not available.",
    living: formatCost(item?.living_cost, "Living cost not available."),
    livingCost: formatCost(item?.living_cost, "Living cost not available."),
    tuition: formatCost(item?.tution_cost, "Tuition cost not available."),
    tuitionCost: formatCost(item?.tution_cost, "Tuition cost not available."),
    intake: item?.intake || "Intake information not available.",
    workRights: item?.work_rights || "Work rights not available.",
    topUniversities: formatList(item?.top_university, "University details not available."),
    scholarships: formatList(item?.scholarship, "Scholarship details not available."),
    requirements: formatList(item?.requirment, "Requirement details not available."),
    popularCourses: formatList(item?.popular_course, "Course details not available."),
  };
}

export async function getStudyAbroadCountries() {
  const response = await api.get("/studyabroad/");
  const items = Array.isArray(response?.data?.data) ? response.data.data : [];

  return items.map((item, index) => mapStudyAbroadItem(item, index));
}

export async function createStudyAbroadConsultation(payload) {
  const token = useAuthStore.getState().accessToken;

  const response = await api.post("/studyabroad/consult/create", payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response?.data?.data ?? null;
}
