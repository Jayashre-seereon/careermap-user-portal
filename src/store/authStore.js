import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialSignupForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirmPassword: "",
  city: "",
  state: "",
};

const initialOnboardingData = {
  userType: "",
  name: "",
  childName: "",
  selectedClass: "",
  selectedStream: "",
  selectedInterests: [],
  selectedClarity: "",
  selectedStrengths: [],
  selectedPriorities: [],
  selectedGuidance: "",
};

export const useAuthStore = create(
  persist(
    (set) => ({
      signupForm: initialSignupForm,
      onboardingData: initialOnboardingData,
      tempToken: "",
      accessToken: "",
      refreshToken: "",
      user: null,

      setSignupForm: (data) =>
        set((state) => ({
          signupForm: {
            ...state.signupForm,
            ...data,
          },
        })),

      setOnboardingData: (data) =>
        set(() => ({
          onboardingData: data,
        })),

      setTempToken: (tempToken) => set(() => ({ tempToken })),

      setAuthSession: ({ accessToken = "", refreshToken = "", user = null }) =>
        set(() => ({
          accessToken,
          refreshToken,
          user,
          tempToken: "",
        })),

      setUser: (user) => set(() => ({ user })),

      clearAuthFlow: () =>
        set(() => ({
          signupForm: initialSignupForm,
          tempToken: "",
        })),

      logout: () =>
        set(() => ({
          signupForm: initialSignupForm,
          onboardingData: initialOnboardingData,
          tempToken: "",
          accessToken: "",
          refreshToken: "",
          user: null,
        })),
    }),
    {
      name: "careermap-auth-store",
      partialize: (state) => ({
        signupForm: state.signupForm,
        onboardingData: state.onboardingData,
        tempToken: state.tempToken,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
