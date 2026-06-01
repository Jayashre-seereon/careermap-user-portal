import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { notifications as notificationItems } from "../data/careermapData";
import { useAuthStore } from "../store/authStore";
import { getNotifications } from "../api/notificationApi";

const STORAGE_KEY = "careermap-userportal-state";
const LEGACY_DEMO_EMAIL = "aarav.sharma@email.com";
const emptyUserProfile = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  address: "",
  city: "",
  stateName: "",
  district: "",
  country: "India",
  gender: "",
  dob: "",
  childName: "",
};

const planFeatures = {
  psychometric: ["psychometric-test"],
  premium: ["psychometric-test", "book-mentor", "master-class"],
  infocentre: ["psychometric-test", "book-mentor", "master-class", "scholarship", "career-library"],
  abroad: ["abroad-consultancy"],
};

const initialState = {
  activePlanId: null,
  activePlanIds: [],
  promoMessage: "",
  onboarding: {
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
  },
  userProfile: {
    ...emptyUserProfile,
  },
  preferences: {
    notifications: {
      pushNotifications: true,
      scholarshipAlerts: true,
      mentorReminders: false,
    },
  },
  savedCareers: ["Software Engineering", "UX Design", "Psychology", "Digital Marketing"],
  testHistory: [
    { id: "1", title: "Personality Snapshot", subtitle: "Completed on 08 Apr 2026", status: "Completed" },
    { id: "2", title: "Career Aptitude Test", subtitle: "Scheduled for 13 Apr 2026", status: "Upcoming" },
    { id: "3", title: "Psychometric Summary", subtitle: "Available in reports", status: "Available" },
  ],
  bookings: [
    { id: "1", mentorName: "Dr. Priya Sharma", date: "12 Apr 2026", time: "4:00 PM", status: "Confirmed" },
    { id: "2", mentorName: "Prof. Rahul Verma", date: "15 Apr 2026", time: "6:30 PM", status: "Upcoming" },
  ],
  freeAccessUsage: {
    "career-library": null,
    "master-class": null,
    "book-mentor": null,
    scholarship: null,
    "abroad-consultancy": null,
  },
  profileEditRequestKey: 0,
  authenticated: false,
};

const AppStateContext = createContext(null);

function readInitialState() {
  const isAuthenticated = Boolean(useAuthStore.getState().accessToken);

  if (typeof window === "undefined") {
    return { ...initialState, authenticated: isAuthenticated };
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...initialState, authenticated: isAuthenticated };
    }
    const parsed = JSON.parse(stored);
    const migratedPlanIds = Array.isArray(parsed.activePlanIds)
      ? parsed.activePlanIds
      : parsed.activePlanId
        ? [parsed.activePlanId]
        : [];

    return {
      ...initialState,
      ...parsed,
      profileEditRequestKey: 0,
      authenticated: isAuthenticated,
      userProfile:
        !isAuthenticated && parsed?.userProfile?.email === LEGACY_DEMO_EMAIL
          ? emptyUserProfile
          : {
              ...emptyUserProfile,
              ...(parsed.userProfile || {}),
            },
      activePlanIds: migratedPlanIds,
      activePlanId: parsed.activePlanId ?? migratedPlanIds[migratedPlanIds.length - 1] ?? null,
    };
  } catch {
    return { ...initialState, authenticated: isAuthenticated };
  }
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(readInitialState);

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const items = await getNotifications();
        if (active && items.length) {
          setState((current) => ({ ...current, notifications: items }));
        }
      } catch {
        // Keep the local fallback notifications when the API is unavailable.
      }
    }

    loadNotifications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const { profileEditRequestKey, ...persistedState } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
  }, [state]);

  useEffect(() => {
    const syncAuthentication = ({ accessToken }) => {
      setState((current) =>
        current.authenticated === Boolean(accessToken)
          ? current
          : { ...current, authenticated: Boolean(accessToken) }
      );
    };

    syncAuthentication(useAuthStore.getState());
    return useAuthStore.subscribe(syncAuthentication);
  }, []);

  const value = useMemo(() => {
    const activePlanId = state.activePlanId;
    const activePlanIds = state.activePlanIds?.length
      ? state.activePlanIds
      : activePlanId
        ? [activePlanId]
        : [];
    const unlockedFeatures = new Set(
      activePlanIds.flatMap((planId) => planFeatures[planId] || [])
    );

    return {
      ...state,
      activePlanIds,
      hasActiveSubscription: activePlanIds.length > 0,
      unreadNotificationsCount: notificationItems.filter((item) => item.unread).length,
      isUnlocked(feature) {
        return unlockedFeatures.has(feature);
      },
      activatePlan(planId) {
        setState((current) => {
          const currentPlanIds = current.activePlanIds?.length
            ? current.activePlanIds
            : current.activePlanId
              ? [current.activePlanId]
              : [];

          if (currentPlanIds.includes(planId) && current.activePlanId === planId) {
            return current;
          }

          return {
            ...current,
            activePlanId: planId,
            activePlanIds: currentPlanIds.includes(planId)
              ? currentPlanIds
              : [...currentPlanIds, planId],
          };
        });
      },
      authenticate() {
        setState((current) => ({ ...current, authenticated: true }));
      },
      logout() {
        useAuthStore.getState().logout();
        setState((current) => ({ ...current, authenticated: false }));
      },
      showPromoMessage(message) {
        setState((current) => ({ ...current, promoMessage: message }));
      },
      clearPromoMessage() {
        setState((current) => ({ ...current, promoMessage: "" }));
      },
      saveOnboarding(data) {
        setState((current) => ({ ...current, onboarding: data }));
      },
      saveUserProfile(data) {
        setState((current) => ({ ...current, userProfile: data }));
      },
      updatePreferences(data) {
        setState((current) => ({
          ...current,
          preferences: {
            ...current.preferences,
            ...data,
            notifications: {
              ...current.preferences.notifications,
              ...(data.notifications || {}),
            },
          },
        }));
      },
      toggleSavedCareer(career) {
        setState((current) => ({
          ...current,
          savedCareers: current.savedCareers.includes(career)
            ? current.savedCareers.filter((item) => item !== career)
            : [...current.savedCareers, career],
        }));
      },
      addTestHistory(item) {
        setState((current) => ({
          ...current,
          testHistory: [item, ...current.testHistory.filter((entry) => entry.id !== item.id)],
        }));
      },
      addBooking(item) {
        setState((current) => ({
          ...current,
          bookings: [item, ...current.bookings.filter((entry) => entry.id !== item.id)],
        }));
      },
      canAccessFreeDetail(feature, itemKey) {
        if (unlockedFeatures.has(feature)) {
          return true;
        }
        const firstViewedItem = state.freeAccessUsage[feature];
        return firstViewedItem === null || firstViewedItem === itemKey;
      },
      registerFreeDetailAccess(feature, itemKey) {
        setState((current) => {
          const currentPlanIds = current.activePlanIds?.length
            ? current.activePlanIds
            : current.activePlanId
              ? [current.activePlanId]
              : [];
          const hasUnlockedFeature = currentPlanIds.some((planId) => planFeatures[planId]?.includes(feature));

          if (hasUnlockedFeature) {
            return current;
          }
          if (current.freeAccessUsage[feature] !== null) {
            return current;
          }
          return {
            ...current,
            freeAccessUsage: {
              ...current.freeAccessUsage,
              [feature]: itemKey,
            },
          };
        });
      },
      requestProfileEdit() {
        setState((current) => ({
          ...current,
          profileEditRequestKey: current.profileEditRequestKey + 1,
        }));
      },
      resetPortalState() {
        setState((current) => ({
          ...initialState,
          preferences: current.preferences,
        }));
      },
      subscriptionRecords: activePlanIds.map((planId) => ({
        id: planId,
        planName:
          planId === "psychometric"
            ? "Psychometric Test"
            : planId === "premium"
              ? "Psychometric + Counselling"
              : planId === "infocentre"
                ? "Infocentre Access"
                : "Study Abroad Access",
        price:
          planId === "psychometric"
            ? "Rs 1,500"
            : planId === "premium"
              ? "Rs 3,000"
              : planId === "infocentre"
                ? "Rs 5,000"
                : "Rs 2,500",
        expiryDate: "10 Apr 2027",
        transactionId: `TXN-${planId.toUpperCase()}-2401`,
      })),
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
}
