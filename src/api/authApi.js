import api, { API_BASE_URL } from "./axios";

export async function sendOtp(mobile, type = "signup") {
  const response = await api.post("/auth/send-otp", {
    mobile,
    type,
  });

  return response.data;
}

export async function verifyOtp(mobile, code, type = "signup") {
  const response = await api.post("/auth/verify-otp", {
    mobile,
    type,
    code,
  });

  return response.data;
}

export async function loginWithPassword(email, password) {
  const response = await api.post("/auth/login/password", {
    email,
    password,
  });

  return response.data;
}

export async function sendSignupOtp(mobile) {
  return sendOtp(mobile, "signup");
}

export async function signupUser(payload, tempToken) {
  const response = await api.post("/user/signup", payload, {
    headers: {
      Authorization: `Bearer ${tempToken}`,
    },
  });

  return response.data;
}

export function getApiErrorMessage(error, fallbackMessage = "Something went wrong") {
  if (error?.message === "Network Error") {
    return `Network error. Check backend & URL: ${API_BASE_URL}`;
  }

  return error?.response?.data?.message || error?.message || fallbackMessage;
}
