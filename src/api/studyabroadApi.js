import api from "./axios";
import { useAuthStore } from "../store/authStore";

function stripHtml(value) {
  if (!value) {
    return "";
  }

  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
    // Kept as raw HTML so headings / bullet lists in the admin-entered description render correctly
    descriptionHtml: item?.description || "<p>Description not available.</p>",
    // Plain-text fallback, in case it's needed anywhere else
    description: stripHtml(item?.description) || "Description not available.",
    living: formatCost(item?.living_cost, "Living cost not available."),
    tuition: formatCost(item?.tution_cost, "Tuition cost not available."),
    workRights: item?.work_rights || "Work rights not available.",
  };
}

export async function getStudyAbroadCountries() {
  const response = await api.get("/studyabroad/");
  const items = Array.isArray(response?.data?.data) ? response.data.data : [];

  return items.map((item, index) => mapStudyAbroadItem(item, index));
}

export async function createStudyAbroadConsultation(payload) {
  const token = useAuthStore.getState().accessToken;
  const normalizedStudyAbroadId =
    payload?.studyAbroadId === null || payload?.studyAbroadId === undefined
      ? payload?.studyAbroadId
      : Number(payload.studyAbroadId);

  const requestBody = {
    ...payload,
    studyAbroadId: normalizedStudyAbroadId,
  };

  const response = await api.post("/studyabroad/consult/create", requestBody, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return response?.data?.data ?? null;
}