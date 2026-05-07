import { createBrowserRouter, Navigate } from "react-router-dom";
import RootProviders from "./providers/RootProviders";
import { PublicOnly, RequireAuth } from "./routes/guards";
import WebsiteLayout from "../shared/layout/WebsiteLayout";

import SplashPage from "../features/auth/pages/SplashPage";
import AuthEntryPage from "../features/auth/pages/AuthEntryPage";
import OnboardingPage from "../features/auth/pages/OnboardingPage";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import OtpVerifyPage from "../features/auth/pages/OtpVerifyPage";
import ProfileSetupPage from "../features/auth/pages/ProfileSetupPage";
import PromoPage from "../features/auth/pages/PromoPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";

import DashboardPage from "../features/dashboard/pages/DashboardPage";
import AssessmentPage from "../features/assessment/pages/AssessmentPage";
import PsychometricTestPage from "../features/assessment/pages/PsychometricTestPage";
import LibraryPage from "../features/library/pages/LibraryPage";
import LearnPage from "../features/learn/pages/LearnPage";
import BookMentorPage from "../features/mentor/pages/BookMentorPage";
import ScholarshipPage from "../features/scholarships/pages/ScholarshipPage";
import InstitutePage from "../features/institutes/pages/InstitutePage";
import EntranceExamPage from "../features/exams/pages/EntranceExamPage";
import AbroadPage from "../features/abroad/pages/AbroadPage";
import SubscriptionPage from "../features/subscription/pages/SubscriptionPage";
import CheckoutPage from "../features/subscription/pages/CheckoutPage";
import PaymentSuccessPage from "../features/subscription/pages/PaymentSuccessPage";
import NotificationsPage from "../features/notifications/pages/NotificationsPage";
import QuizPage from "../features/quiz/pages/QuizPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import SettingsPage from "../features/settings/pages/SettingsPage";
import AboutPage from "../features/about/pages/AboutPage";

export const router = createBrowserRouter([
  {
    element: <RootProviders />,
    children: [
      { path: "/", element: <SplashPage /> },
      {
        element: <PublicOnly />,
        children: [
          { path: "/auth-entry", element: <AuthEntryPage /> },
          { path: "/onboarding", element: <OnboardingPage /> },
          { path: "/login", element: <LoginPage /> },
          { path: "/signup", element: <SignupPage /> },
          { path: "/otp-verify", element: <OtpVerifyPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
      { path: "/profile-setup", element: <ProfileSetupPage /> },
      { path: "/promo", element: <PromoPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/payment-success", element: <PaymentSuccessPage /> },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/app",
            element: <WebsiteLayout />,
            children: [
              { index: true, element: <Navigate to="/app/dashboard" replace /> },
              { path: "dashboard", element: <DashboardPage /> },
              { path: "assessment", element: <AssessmentPage /> },
              { path: "psychometric-test", element: <PsychometricTestPage /> },
              { path: "library", element: <LibraryPage /> },
              { path: "learn", element: <LearnPage /> },
              { path: "book-mentor", element: <BookMentorPage /> },
              { path: "scholarships", element: <ScholarshipPage /> },
              { path: "institutes", element: <InstitutePage /> },
              { path: "entrance-exam", element: <EntranceExamPage /> },
              { path: "abroad", element: <AbroadPage /> },
              { path: "subscription", element: <SubscriptionPage /> },
              { path: "notifications", element: <NotificationsPage /> },
              { path: "quiz", element: <QuizPage /> },
              { path: "profile", element: <ProfilePage /> },
              { path: "settings", element: <SettingsPage /> },
              { path: "about", element: <AboutPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
