import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { notifications as notificationItems } from "../data/careermapData";

const STORAGE_KEY = "careermap-userportal-state";

const planFeatures = {
  psychometric: ["psychometric-test"],
  premium: ["psychometric-test", "book-mentor", "master-class"],
  infocentre: ["psychometric-test", "book-mentor", "master-class", "scholarship", "career-library"],
  abroad: ["abroad-consultancy"],
};

const initialState = {
  activePlanId: null,
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
    name: "Aarav Sharma",
    email: "aarav.sharma@email.com",
    mobile: "+91 98765 43210",
    password: "Aarav@123",
    address: "24 Palm Residency",
    city: "Bengaluru",
    stateName: "Karnataka",
    gender: "Male",
    dob: "2007-09-14",
    childName: "",
  },
  preferences: {
    darkMode: false,
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
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialState;
    }
    return { ...initialState, ...JSON.parse(stored) };
  } catch {
    return initialState;
  }
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(readInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const activePlanId = state.activePlanId;
    return {
      ...state,
      hasActiveSubscription: activePlanId !== null,
      unreadNotificationsCount: notificationItems.filter((item) => item.unread).length,
      isUnlocked(feature) {
        if (!activePlanId) {
          return false;
        }
        return planFeatures[activePlanId]?.includes(feature);
      },
      activatePlan(planId) {
        setState((current) => {
          if (current.activePlanId === planId) {
            return current;
          }

          return { ...current, activePlanId: planId };
        });
      },
      authenticate() {
        setState((current) => ({ ...current, authenticated: true }));
      },
      logout() {
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
      toggleDarkMode() {
        setState((current) => ({
          ...current,
          preferences: {
            ...current.preferences,
            darkMode: !current.preferences.darkMode,
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
        if (activePlanId && planFeatures[activePlanId]?.includes(feature)) {
          return true;
        }
        const firstViewedItem = state.freeAccessUsage[feature];
        return firstViewedItem === null || firstViewedItem === itemKey;
      },
      registerFreeDetailAccess(feature, itemKey) {
        setState((current) => {
          if (current.activePlanId && planFeatures[current.activePlanId]?.includes(feature)) {
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
      subscriptionRecords: activePlanId
        ? [
            {
              id: activePlanId,
              planName:
                activePlanId === "psychometric"
                  ? "Psychometric Test"
                  : activePlanId === "premium"
                    ? "Psychometric + Counselling"
                    : activePlanId === "infocentre"
                      ? "Infocentre Access"
                      : "Study Abroad Access",
              price:
                activePlanId === "psychometric"
                  ? "Rs 1,500"
                  : activePlanId === "premium"
                    ? "Rs 3,000"
                    : activePlanId === "infocentre"
                      ? "Rs 5,000"
                      : "Rs 2,500",
              expiryDate: "10 Apr 2027",
              transactionId: `TXN-${activePlanId.toUpperCase()}-2401`,
            },
          ]
        : [],
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
