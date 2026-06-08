import api from "./axios";
import { useAuthStore } from "../store/authStore";

export async function checkModuleAccess(
  moduleId
) {
  const response = await api.post(
    "/module-access/check",
    {
      moduleId,
    }
  );

  return response?.data ?? null;
}