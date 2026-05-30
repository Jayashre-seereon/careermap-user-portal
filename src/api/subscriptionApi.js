import api from "./axios";

// remove HTML tags (same as your institute file)
function stripHtml(value) {
  if (!value) return "";
  return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// convert API response → UI friendly format
function mapPlanItem(item, index) {
  return {
    id: String(item?.id ?? `plan-${index}`),
    name: item?.name || "Unnamed Plan",

    // convert HTML string → array (for List)
    features: stripHtml(item?.features)
      .split(".") // split if sentences
      .map((f) => f.trim())
      .filter(Boolean),

    description: stripHtml(item?.description),
    validity: item?.validity || "",
    price: item?.price || "0",

    // flags for ribbon
    highestseller: item?.plan_type === "best seller",
    recommended: item?.plan_type === "recommended",

    modules: Array.isArray(item?.modules)
      ? item.modules.map((m) => m.title)
      : [],
  };
}

// main API function
export async function getPlans() {
  const response = await api.get("/plans");
  const items = Array.isArray(response?.data?.data)
    ? response.data.data
    : [];

  return items.map((item, index) => mapPlanItem(item, index));
}