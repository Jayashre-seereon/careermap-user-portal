import { Alert, Button, Col, Form, Input, Row } from "antd"; 
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, signupUser } from "../../../api/authApi";
import { useAppState } from "../../../state/AppStateContext";
import { useAuthStore } from "../../../store/authStore";
import {
  buildLandingData,
  buildUsername,
  isValidEmail,
  isValidDateInput,
  isValidMobileNumber,
  isValidPassword,
  normalizeMobile,
  splitFullName,
} from "../../../utils/auth";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { onboarding, saveOnboarding, saveUserProfile, showPromoMessage, userProfile } = useAppState();
  const signupForm = useAuthStore((state) => state.signupForm);
  const onboardingData = useAuthStore((state) => state.onboardingData);
  const tempToken = useAuthStore((state) => state.tempToken);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const clearAuthFlow = useAuthStore((state) => state.clearAuthFlow);
  const setOnboardingData = useAuthStore((state) => state.setOnboardingData);

  const mergedOnboarding = useMemo(
    () => ({
      ...onboarding,
      ...onboardingData,
      selectedInterests: onboardingData.selectedInterests?.length ? onboardingData.selectedInterests : onboarding.selectedInterests,
      selectedStrengths: onboardingData.selectedStrengths?.length ? onboardingData.selectedStrengths : onboarding.selectedStrengths,
      selectedPriorities: onboardingData.selectedPriorities?.length ? onboardingData.selectedPriorities : onboarding.selectedPriorities,
    }),
    [onboarding, onboardingData]
  );

  const [values, setValues] = useState({
    name: signupForm.name || mergedOnboarding.name || userProfile.name || "",
    username: buildUsername(signupForm.name || mergedOnboarding.name, signupForm.email || userProfile.email),
    email: signupForm.email || userProfile.email || "",

    // ✅ CHANGE 1: remove +91 when loading
    mobile: (signupForm.mobile || userProfile.mobile || "").replace("+91", ""),

    password: signupForm.password || userProfile.password || "",
    address: userProfile.address || "",
    city: signupForm.city || userProfile.city || "",
    stateName: signupForm.state || userProfile.stateName || "",
    district: userProfile.district || "",
    country: userProfile.country || "India",
    gender: userProfile.gender || "",
    dob: userProfile.dob || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const emailError = values.email && !isValidEmail(values.email) ? "Enter a valid email address." : "";
  const mobileError = values.mobile && !isValidMobileNumber(values.mobile) ? "Enter a valid 10 digit mobile number." : "";
  const passwordError = values.password && !isValidPassword(values.password) ? "Password must be at least 6 characters." : "";
  const dobError = values.dob && !isValidDateInput(values.dob) ? "Date of birth must be in YYYY-MM-DD format." : "";

  const canSubmit =
    values.name.trim() &&
    values.username.trim() &&
    isValidEmail(values.email) &&
    isValidMobileNumber(values.mobile) &&
    isValidPassword(values.password) &&
    values.address.trim() &&
    values.city.trim() &&
    values.stateName.trim() &&
    values.country.trim() &&
    values.gender &&
    isValidDateInput(values.dob) &&
    !isSubmitting;

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  async function handleSubmit() {
    if (!tempToken) {
      setStatus({ type: "error", message: "Please verify OTP first." });
      return;
    }

    const { firstName, lastName } = splitFullName(values.name);

    const payload = {
      firstName,
      lastName,
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      country: values.country.trim() || "India",
      state: values.stateName.trim(),
      city: values.city.trim(),
      district: values.district.trim(),
      gender: values.gender,
      address: values.address.trim(),
      dataOfBirth: new Date(values.dob).toISOString(),
      image: "image_url.png",

      // ✅ CHANGE 2: save with +91
      mobile: "+91" + values.mobile,

      status: "Active",
      landingData: buildLandingData(mergedOnboarding),
    };

    try {
      setIsSubmitting(true);
      const response = await signupUser(payload, tempToken);

      setAuthSession({
        accessToken: response.accessToken || "",
        refreshToken: response.refreshToken || "",
        user: response.user || null,
      });

      clearAuthFlow();

      saveUserProfile({
        ...userProfile,
        ...values,

        // ✅ CHANGE 3: store +91 locally also
        mobile: "+91" + values.mobile,
      });

      navigate("/promo");
    } catch (error) {
      setStatus({
        type: "error",
        message: getApiErrorMessage(error, "Failed to create profile."),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell title="Complete Your Profile" subtitle="Help us serve you better." backTo="/login">
      <Form layout="vertical">
        <Row gutter={12}>
          {[
            ["name", "Full Name"],
            ["username", "Username"],
            ["email", "Email"],
            ["mobile", "Mobile Number"],
            ["password", "Password"],
          ].map(([key, label]) => (
            <Col xs={24} md={12} key={key}>
              <Form.Item label={label}>
                {key === "password" ? (
                  <Input.Password value={values[key]} onChange={(e) => update(key, e.target.value)} />
                ) : key === "mobile" ? (
                  // ✅ CHANGE 4: show +91 in UI
                  <Input
                    addonBefore="+91"
                    value={values.mobile}
                    onChange={(e) => update("mobile", e.target.value.replace(/\D/g, ""))}
                  />
                ) : (
                  <Input value={values[key]} onChange={(e) => update(key, e.target.value)} />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>

        <Button type="primary" onClick={handleSubmit} disabled={!canSubmit}>
          {isSubmitting ? "Creating..." : "Submit"}
        </Button>

        {status && <Alert type={status.type} message={status.message} />}
      </Form>
    </AuthShell>
  );
}