import { Alert, Button, Col, Form, Input, Row } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage, signupUser } from "../../../api/authApi";
import { useAppState } from "../../../state/AppStateContext";
import { useAuthStore } from "../../../store/authStore";
import {
  buildLandingData,
  buildUsername,
  isValidDateInput,
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
    mobile: signupForm.mobile || normalizeMobile(userProfile.mobile),
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

  useEffect(() => {
    const hasStoreSelections = Boolean(
      onboardingData.selectedClass ||
        onboardingData.selectedStream ||
        onboardingData.selectedClarity ||
        onboardingData.selectedInterests?.length ||
        onboardingData.selectedStrengths?.length ||
        onboardingData.selectedPriorities?.length
    );
    const hasContextSelections = Boolean(
      onboarding.selectedClass ||
        onboarding.selectedStream ||
        onboarding.selectedClarity ||
        onboarding.selectedInterests?.length ||
        onboarding.selectedStrengths?.length ||
        onboarding.selectedPriorities?.length
    );

    if (!hasStoreSelections && hasContextSelections) {
      setOnboardingData(onboarding);
    }
  }, [onboarding, onboardingData, setOnboardingData]);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  async function handleSubmit() {
    if (!tempToken) {
      setStatus({ type: "error", message: "Please verify OTP first." });
      return;
    }

    if (normalizeMobile(values.mobile).length !== 10) {
      setStatus({ type: "error", message: "Enter a valid 10 digit mobile number." });
      return;
    }

    if (!isValidDateInput(values.dob)) {
      setStatus({ type: "error", message: "Date of birth must be in YYYY-MM-DD format." });
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
      mobile: normalizeMobile(values.mobile),
      status: "Active",
      landingData: buildLandingData(mergedOnboarding),
    };

    try {
      setIsSubmitting(true);
      setStatus(null);
      const response = await signupUser(payload, tempToken);
      setAuthSession({
        accessToken: response.accessToken || "",
        refreshToken: response.refreshToken || "",
        user: response.user || null,
      });
      clearAuthFlow();
      saveOnboarding({ ...mergedOnboarding, name: values.name });
      saveUserProfile({
        ...userProfile,
        ...values,
        mobile: normalizeMobile(values.mobile),
        childName: mergedOnboarding.childName,
      });
      showPromoMessage(response.message || "Profile created successfully.");
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
      <Form layout="vertical" className="cm-form-label">
        <Row gutter={12}>
          {[
            ["name", mergedOnboarding.userType === "parent" ? "Parent Name" : "Full Name"],
            ["username", "Username"],
            ["email", "Email Address"],
            ["mobile", "Mobile Number"],
            ["password", "Password"],
            ["address", "Address"],
            ["district", "District"],
            ["city", "City"],
            ["stateName", "State"],
            ["country", "Country"],
            ["dob", "Date of Birth (YYYY-MM-DD)"],
          ].map(([key, label]) => (
            <Col xs={24} md={12} key={key}>
              <Form.Item label={label}>
                {key === "password" ? (
                  <Input.Password
                    className="cm-input-field"
                    value={values[key]}
                    onChange={(event) => update(key, event.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                ) : (
                  <Input
                    className="cm-input-field"
                    value={values[key]}
                    onChange={(event) => update(key, key === "mobile" ? normalizeMobile(event.target.value) : event.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                )}
              </Form.Item>
            </Col>
          ))}
          <Col xs={24}>
            <Form.Item label="Gender">
              <div style={{ display: "flex", gap: "8px" }}>
                {["Male", "Female", "Other"].map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => update("gender", gender)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "2px solid",
                      borderColor: values.gender === gender ? "#9a2119" : "#e2d5d4",
                      borderRadius: "10px",
                      background: values.gender === gender ? "#fdf5f4" : "#fff",
                      fontWeight: "700",
                      fontSize: "13px",
                      color: values.gender === gender ? "#9a2119" : "#5a2a27",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" size="large" style={{ ...authPrimaryButtonStyle, width: "100%" }} onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Creating Profile..." : "Complete Profile"}
        </Button>
        {status ? <Alert type={status.type} title={status.message} style={{ borderRadius: "10px", marginTop: 16 }} /> : null}
      </Form>
    </AuthShell>
  );
}
