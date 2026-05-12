import { Button, Col, Form, Input, Row } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../../state/AppStateContext";
import { AuthShell } from "../components/AuthShell";
import { authPrimaryButtonStyle } from "../components/authShared";

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { authenticate, onboarding, saveOnboarding, saveUserProfile, showPromoMessage, userProfile } = useAppState();
  const [values, setValues] = useState({
    name: onboarding.name || userProfile.name,
    email: userProfile.email,
    mobile: userProfile.mobile,
    password: userProfile.password,
    address: userProfile.address,
    city: userProfile.city,
    stateName: userProfile.stateName,
    gender: userProfile.gender,
    dob: userProfile.dob,
  });

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <AuthShell title="Complete Your Profile" subtitle="Help us serve you better." backTo="/login">
      <Form layout="vertical" className="cm-form-label">
        <Row gutter={12}>
          {[
            ["name", onboarding.userType === "parent" ? "Parent Name" : "Full Name"],
            ["email", "Email Address"],
            ["mobile", "Mobile Number"],
            ["password", "Password"],
            ["address", "Address"],
            ["city", "City"],
            ["stateName", "State"],
            ["dob", "Date of Birth"],
          ].map(([key, label]) => (
            <Col xs={24} md={12} key={key}>
              <Form.Item label={label}>
                {key === "password" ? (
                  <Input.Password className="cm-input-field" value={values[key]} onChange={(event) => update(key, event.target.value)} style={{ borderRadius: "10px" }} />
                ) : (
                  <Input className="cm-input-field" value={values[key]} onChange={(event) => update(key, event.target.value)} style={{ borderRadius: "10px" }} />
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
        <Button
          type="primary"
          size="large"
          style={{ ...authPrimaryButtonStyle, width: "100%" }}
          onClick={() => {
            saveOnboarding({ ...onboarding, name: values.name });
            saveUserProfile({ ...userProfile, ...values, childName: onboarding.childName });
            showPromoMessage("Profile created successfully.");
            authenticate();
            navigate("/promo");
          }}
        >
          Complete Profile
        </Button>
      </Form>
    </AuthShell>
  );
}
