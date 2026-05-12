import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  MobileOutlined,
  
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Result,
  Row,
  Space,
  Typography,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { existingUsers, onboardingOptions } from "../../data/careermapData";
import { useAppState } from "../../state/AppStateContext";
import { AuthFrame, BrandMark } from "../../components/ui";
import Logo from "../../asset/logo_white.png";
import Bee from "../../asset/bee.png";

const { Paragraph, Title, Text } = Typography;

/* ─── Shared layout shell ─────────────────────────────────────────────────── */
function AuthShell({ children, title, subtitle, backTo }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#faf8f7" }}>
      {/* Left decorative panel — hidden on mobile, shown on md+ via CSS */}
      <div
        className="auth-left-panel"
        style={{
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "42%",
          background: "linear-gradient(160deg, #9a2119 0%, #c0392b 55%, #7b1a13 100%)",
          padding: "48px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative rings */}
        {[[320, -80, null, -80, null], [220, -40, null, -40, null], [360, null, -100, null, -60], [200, null, 60, null, -20]].map(([size, top, bottom, right, left], i) => (
          <div key={i} style={{
            position: "absolute",
            top: top !== null ? top : undefined,
            bottom: bottom !== null ? bottom : undefined,
            right: right !== null ? right : undefined,
            left: left !== null ? left : undefined,
            width: size, height: size, borderRadius: "50%",
            border: `2px solid rgba(255,255,255,${0.06 + (i % 2) * 0.06})`,
          }} />
        ))}

        <div style={{
          width: "100px", height: "100px", borderRadius: "28px",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}>
          <img src={Bee} alt="Career Map" style={{ width: "64px", height: "64px", objectFit: "contain" }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: "26px", fontWeight: "700", color: "#fff", marginBottom: "10px", letterSpacing: "-0.5px" }}>
            Career Map
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", lineHeight: "1.6", maxWidth: "220px" }}>
            Discover your future with personalised guidance tailored just for you.
          </div>
        </div>

        {[["✦", "500+ Career Options"], ["✦", "Expert Mentors"], ["✦", "Scholarships & Exams"]].map(([icon, label]) => (
          <div key={label} style={{
            width: "100%", background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.16)",
            borderRadius: "10px", padding: "10px 16px",
            fontSize: "13px", color: "rgba(255,255,255,0.88)",
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "8px",
          }}>
            <span style={{ color: "#ffb3ae" }}>{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Right content panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <div style={{ width: "100%", maxWidth: "460px" }}>
          {backTo && (
            <Link to={backTo} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              color: "#9a2119", fontSize: "13px", fontWeight: "600",
              marginBottom: "20px", textDecoration: "none",
            }}>
              ← Back
            </Link>
          )}

          <div style={{
            background: "#fff",
            borderRadius: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 12px 40px rgba(154,33,25,0.08)",
            padding: "36px 32px",
            border: "1px solid rgba(154,33,25,0.08)",
          }}>
            {/* Brand row */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #9a2119, #c0392b)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img src={Bee} alt="" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
              </div>
              <span style={{ fontFamily: "'Georgia', serif", fontWeight: "700", color: "#1a0a09", fontSize: "15px" }}>Career Map</span>
            </div>

            {title && (
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a0a09", letterSpacing: "-0.4px", marginBottom: "4px", fontFamily: "'Georgia', serif" }}>
                  {title}
                </div>
                {subtitle && <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.5" }}>{subtitle}</div>}
              </div>
            )}

            {children}
          </div>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#bbb" }}>
            © {new Date().getFullYear()} Career Map · All rights reserved
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .auth-left-panel { display: flex !important; } }
        .cm-primary-btn {
          border-radius: 10px !important; font-weight: 700 !important; height: 46px !important;
          background: linear-gradient(135deg, #9a2119 0%, #c0392b 100%) !important;
          border-color: #9a2119 !important;
          box-shadow: 0 4px 14px rgba(154,33,25,0.28) !important;
          font-size: 14px !important; letter-spacing: 0.2px !important;
          transition: opacity 0.2s, transform 0.15s !important;
        }
        .cm-primary-btn:hover:not(:disabled) { opacity: 0.9 !important; transform: translateY(-1px) !important; }
        .cm-primary-btn:disabled { background: #e5ccc9 !important; border-color: #e5ccc9 !important; box-shadow: none !important; color: #fff !important; }
        .cm-input-field { border-radius: 10px !important; border-color: #e2d5d4 !important; }
        .cm-input-field:hover { border-color: #c0392b !important; }
        .cm-input-field:focus, .cm-input-field-focused { border-color: #9a2119 !important; box-shadow: 0 0 0 3px rgba(154,33,25,0.10) !important; }
        .cm-form-label .ant-form-item-label > label { font-size: 13px !important; font-weight: 700 !important; color: #4a2020 !important; }
        .cm-otp .ant-otp-input { border-radius: 12px !important; border-color: #e2d5d4 !important; font-size: 20px !important; font-weight: 800 !important; width: 56px !important; height: 56px !important; color: #9a2119 !important; }
        .cm-otp .ant-otp-input:focus { border-color: #9a2119 !important; box-shadow: 0 0 0 3px rgba(154,33,25,0.12) !important; }
        .cm-grid-btn .ant-btn-primary { background: linear-gradient(135deg, #9a2119, #c0392b) !important; border-color: #9a2119 !important; }
        .cm-grid-btn .ant-btn-default { border-color: #e2d5d4 !important; color: #4a2020 !important; }
        .cm-grid-btn .ant-btn-default:hover { border-color: #9a2119 !important; color: #9a2119 !important; background: #fdf5f5 !important; }
        .cm-step-active { background: linear-gradient(135deg, #9a2119, #c0392b) !important; border-color: #9a2119 !important; color: #fff !important; }
        .cm-step-done { background: #f7ece8 !important; border-color: #e2ccc9 !important; color: #9a2119 !important; }
        .cm-step-pending { background: #fff !important; border-color: #e5e7eb !important; color: #bbb !important; }
        .cm-promo-item { border-radius: 14px !important; border: 1.5px solid #ede8e7 !important; padding: 14px 16px !important; background: #fff !important; transition: border-color 0.2s, box-shadow 0.2s !important; display: flex; align-items: center; gap: 14px; }
        .cm-promo-item:hover { border-color: #9a2119 !important; box-shadow: 0 2px 10px rgba(154,33,25,0.08) !important; }
        .cm-entry-card { border-radius: 16px; border: 1.5px solid #ede8e7; padding: 16px 18px; cursor: pointer; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; background: #fff; display: block; text-decoration: none; }
        .cm-entry-card:hover { border-color: #9a2119; background: #fdf5f5; box-shadow: 0 4px 16px rgba(154,33,25,0.10); }
      `}</style>
    </div>
  );
}

/* ─── SplashPage ─────────────────────────────────────────────────────────── */
export function SplashPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate("/auth-entry", { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg, #9a2119 0%, #c0392b 55%, #7b1a13 100%)",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      {[400, 280, 180].map((size, i) => (
        <div key={i} style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: size, height: size, borderRadius: "50%",
          border: `1px solid rgba(255,255,255,${0.06 + i * 0.03})`,
          pointerEvents: "none",
        }} />
      ))}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          width: "96px", height: "96px", borderRadius: "28px",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px", boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}>
          <img src={Bee} alt="Career Map" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
        </div>
        <Title className="!mb-2 !text-white" style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.5px" }}>Career Map</Title>
        <Paragraph className="!mb-8 !text-white/75" style={{ fontSize: "15px" }}>Discover Your Future</Paragraph>
        <div style={{ margin: "0 auto", height: "4px", width: "180px", borderRadius: "100px", background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: "60%", borderRadius: "100px",
            background: "rgba(255,255,255,0.85)",
            animation: "splash-bar 1.6s ease-in-out infinite",
          }} />
        </div>
        <style>{`@keyframes splash-bar { 0% { transform: translateX(-150%); } 100% { transform: translateX(300%); } }`}</style>
      </div>
    </div>
  );
}

/* ─── AuthEntryPage ──────────────────────────────────────────────────────── */
export function AuthEntryPage() {
  return (
    <AuthShell title="Welcome to Career Map" subtitle="Choose how you want to continue into the user portal.">
      <div style={{ display: "grid", gap: "12px" }}>
        <Link to="/onboarding" className="cm-entry-card">
          <Space size={16} align="start">
            <div style={{
              background: "linear-gradient(135deg, #9a2119, #c0392b)", color: "#fff",
              borderRadius: "14px", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>
              <UserOutlined />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a0a09", marginBottom: "3px" }}>New User</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Start onboarding and create your profile.</div>
            </div>
          </Space>
        </Link>
        <Link to="/login?userType=existing" className="cm-entry-card">
          <Space size={16} align="start">
            <div style={{
              background: "#f7ece8", color: "#9a2119",
              borderRadius: "14px", width: "48px", height: "48px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", flexShrink: 0,
            }}>
              <LockOutlined />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#1a0a09", marginBottom: "3px" }}>Existing User</div>
              <div style={{ fontSize: "13px", color: "#888" }}>Login with OTP, coupon, or email and password.</div>
            </div>
          </Space>
        </Link>
      </div>
    </AuthShell>
  );
}

/* ─── OnboardingPage ─────────────────────────────────────────────────────── */
export function OnboardingPage() {
  const navigate = useNavigate();
  const { saveOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    userType: "", name: "", childName: "", selectedClass: "", selectedStream: "",
    otherClass: "", otherStream: "", selectedInterests: [], selectedClarity: "",
    selectedStrengths: [], selectedPriorities: [],
  });

  function update(key, value) { setForm((c) => ({ ...c, [key]: value })); }
  function toggleArray(key, value) {
    setForm((c) => ({ ...c, [key]: c[key].includes(value) ? c[key].filter((i) => i !== value) : [...c[key], value] }));
  }

  function canContinue() {
    if (step === 0) return Boolean(form.userType);
    if (step === 2) return Boolean(form.name.trim());
    if (step === 3 && form.userType === "student") return Boolean(form.selectedClass) && (form.selectedClass !== "Other" || Boolean(form.otherClass.trim()));
    if (step === 3 && form.userType === "parent") return Boolean(form.childName.trim());
    if (step === 4 && form.userType === "student") return Boolean(form.selectedStream) && (form.selectedStream !== "Other" || Boolean(form.otherStream.trim()));
    if (step === 4 && form.userType === "parent") return Boolean(form.selectedClass) && (form.selectedClass !== "Other" || Boolean(form.otherClass.trim()));
    if (step === 5 && form.userType === "student") return form.selectedInterests.length > 0;
    if (step === 5 && form.userType === "parent") return Boolean(form.selectedStream) && (form.selectedStream !== "Other" || Boolean(form.otherStream.trim()));
    if (step === 6) return Boolean(form.selectedClarity);
    if (step === 7) return form.selectedStrengths.length > 0;
    if (step === 8) return form.selectedPriorities.length > 0;
    return true;
  }

  function next() {
    if (step === 8) { saveOnboarding({ ...form, selectedGuidance: "" }); setStep(9); return; }
    if (step === 9) { navigate("/login"); return; }
    setStep((c) => c + 1);
  }

  const multiGrid = (items, key) => (
    <div className="cm-grid-btn" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {items.map((item) => (
        <Button key={item} block size="large"
          type={form[key].includes(item) ? "primary" : "default"}
          style={{ height: "auto", borderRadius: "12px", padding: "12px 10px", textAlign: "left", whiteSpace: "normal", lineHeight: "1.4", fontWeight: "600", fontSize: "13px" }}
          onClick={() => toggleArray(key, item)}
        >{item}</Button>
      ))}
    </div>
  );

  const singleGrid = (items, key) => (
    <div className="cm-grid-btn" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {items.map((item) => (
        <Button key={item} block size="large"
          type={form[key] === item ? "primary" : "default"}
          style={{ height: "auto", borderRadius: "12px", padding: "12px 10px", textAlign: "left", whiteSpace: "normal", lineHeight: "1.4", fontWeight: "600", fontSize: "13px" }}
          onClick={() => update(key, item)}
        >{item}</Button>
      ))}
    </div>
  );

  const stepLabels = ["Role", "Name", "Class", "Stream", "Interests", "Clarity", "Strengths", "Priorities"];

  return (
    <AuthShell title="Choose Your Roadmap" subtitle="Tell us a little about yourself so we can personalize the full portal experience." backTo="/auth-entry">
      {/* Step indicator */}
      <div style={{ overflowX: "auto", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: "max-content" }}>
          {stepLabels.map((label, index) => {
            const vis = Math.max(0, Math.min(step === 1 ? 1 : step === 9 ? 7 : step - 1, 7));
            const status = index < vis ? "done" : index === vis ? "active" : "pending";
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div className={`cm-step-${status}`} style={{
                    width: "28px", height: "28px", borderRadius: "50%", border: "2px solid",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: "800", flexShrink: 0,
                  }}>{index + 1}</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: status !== "pending" ? "#9a2119" : "#bbb", whiteSpace: "nowrap" }}>{label}</div>
                </div>
                {index < 7 && <div style={{ width: "14px", height: "2px", borderRadius: "2px", background: "#f0e8e6", flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Step 0 — Role */}
        {step === 0 && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Title level={4} style={{ color: "#1a0a09", marginBottom: 0, fontFamily: "'Georgia', serif" }}>Who are you exploring for?</Title>
            <div style={{ display: "grid", gap: "10px" }}>
              {[["student", "🎓", "I'm a Student"], ["parent", "👨‍👩‍👧", "I'm a Parent"]].map(([val, icon, label]) => (
                <div key={val} onClick={() => update("userType", val)} style={{
                  borderRadius: "14px", padding: "14px 18px", cursor: "pointer",
                  border: `2px solid ${form.userType === val ? "#9a2119" : "#ede8e7"}`,
                  background: form.userType === val ? "#fdf5f4" : "#fff",
                  display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: form.userType === val ? "linear-gradient(135deg, #9a2119, #c0392b)" : "#f7ece8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: form.userType === val ? "#fff" : "#9a2119", fontSize: "16px",
                  }}>{icon}</div>
                  <div style={{ fontWeight: "700", color: "#1a0a09", fontSize: "15px" }}>{label}</div>
                  {form.userType === val && <div style={{ marginLeft: "auto", color: "#9a2119", fontWeight: "900" }}>✓</div>}
                </div>
              ))}
            </div>
          </Space>
        )}

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px",
              background: "linear-gradient(135deg, #9a2119, #c0392b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(154,33,25,0.25)",
            }}>
              <img src={Bee} alt="Bee" style={{ width: "52px", height: "52px", objectFit: "contain" }} />
            </div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#1a0a09", marginBottom: "8px", fontFamily: "'Georgia', serif" }}>
              {form.userType === "parent" ? "Welcome, Parent!" : form.userType === "student" ? "Hi! I'm your Career Guide" : "Hello! Let's personalize your experience"}
            </div>
            <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
              {form.userType === "parent"
                ? "We'll help you explore career options for your child's future."
                : form.userType === "student"
                  ? "We'll help you discover the best career path and portal modules for your goals."
                  : "Tell us a little about yourself so we can personalize your portal experience."}
            </div>
          </div>
        )}

        {/* Step 2 — Name */}
        {step === 2 && (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label={form.userType === "parent" ? "Parent Name" : "Full Name"}>
              <Input className="cm-input-field" prefix={<UserOutlined style={{ color: "#9a2119" }} />} value={form.name} onChange={(e) => update("name", e.target.value)} size="large" style={{ borderRadius: "10px" }} />
            </Form.Item>
          </Form>
        )}

        {step === 3 && form.userType === "student" && (
          <div>
            {singleGrid(onboardingOptions.studentClassOptions, "selectedClass")}
            {form.selectedClass === "Other" && (
              <Form layout="vertical" className="cm-form-label" style={{ marginTop: "14px" }}>
                <Form.Item label="Please specify your class">
                  <Input className="cm-input-field" value={form.otherClass} onChange={(e) => update("otherClass", e.target.value)} style={{ borderRadius: "10px" }} />
                </Form.Item>
              </Form>
            )}
          </div>
        )}

        {step === 3 && form.userType === "parent" && (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Child's Name">
              <Input className="cm-input-field" prefix={<UserOutlined style={{ color: "#9a2119" }} />} value={form.childName} onChange={(e) => update("childName", e.target.value)} size="large" style={{ borderRadius: "10px" }} />
            </Form.Item>
          </Form>
        )}

        {step === 4 && form.userType === "student" && (
          <div>
            {singleGrid(onboardingOptions.streamOptions, "selectedStream")}
            {form.selectedStream === "Other" && (
              <Form layout="vertical" className="cm-form-label" style={{ marginTop: "14px" }}>
                <Form.Item label="Please specify your stream">
                  <Input className="cm-input-field" value={form.otherStream} onChange={(e) => update("otherStream", e.target.value)} style={{ borderRadius: "10px" }} />
                </Form.Item>
              </Form>
            )}
          </div>
        )}

        {step === 4 && form.userType === "parent" && (
          <div>
            {singleGrid(onboardingOptions.studentClassOptions, "selectedClass")}
            {form.selectedClass === "Other" && (
              <Form layout="vertical" className="cm-form-label" style={{ marginTop: "14px" }}>
                <Form.Item label="Please specify your child's class">
                  <Input className="cm-input-field" value={form.otherClass} onChange={(e) => update("otherClass", e.target.value)} style={{ borderRadius: "10px" }} />
                </Form.Item>
              </Form>
            )}
          </div>
        )}

        {step === 5 && form.userType === "student" && multiGrid(onboardingOptions.interestOptions, "selectedInterests")}

        {step === 5 && form.userType === "parent" && (
          <div>
            {singleGrid(onboardingOptions.streamOptions, "selectedStream")}
            {form.selectedStream === "Other" && (
              <Form layout="vertical" className="cm-form-label" style={{ marginTop: "14px" }}>
                <Form.Item label="Please specify your stream">
                  <Input className="cm-input-field" value={form.otherStream} onChange={(e) => update("otherStream", e.target.value)} style={{ borderRadius: "10px" }} />
                </Form.Item>
              </Form>
            )}
          </div>
        )}

        {step === 6 && singleGrid(onboardingOptions.clarityOptions, "selectedClarity")}
        {step === 7 && multiGrid(onboardingOptions.strengthOptions, "selectedStrengths")}
        {step === 8 && multiGrid(onboardingOptions.priorityOptions, "selectedPriorities")}

        {step === 9 && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #9a2119, #c0392b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(154,33,25,0.25)",
              fontSize: "32px", color: "#fff",
            }}>✓</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#1a0a09", marginBottom: "8px", fontFamily: "'Georgia', serif" }}>
              Great! We've personalized your experience
            </div>
            <div style={{ fontSize: "14px", color: "#888", lineHeight: "1.6" }}>
              Your career journey is ready. Let's sign you in to get started.
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid #f0e8e6" }}>
          <Button disabled={step === 0} onClick={() => setStep((c) => Math.max(0, c - 1))}
            style={{ borderRadius: "10px", fontWeight: "700", borderColor: "#e2d5d4", color: "#4a2020" }}>
            Previous
          </Button>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={next} disabled={!canContinue()}
            className="cm-primary-btn"
            style={{ borderRadius: "10px", fontWeight: "700", minWidth: "100px", background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119" }}>
            {step === 9 ? "Continue" : step === 8 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

/* ─── LoginPage ──────────────────────────────────────────────────────────── */
export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authenticate } = useAppState();
  const [mode, setMode] = useState("mobile");
  const [status, setStatus] = useState(null);
  const [values, setValues] = useState({ mobile: "", coupon: "", email: "", password: "" });
  const isExistingUser = params.get("userType") === "existing";

  const knownMobileUser = useMemo(() => existingUsers.find((i) => i.mobile === values.mobile), [values.mobile]);
  const knownCouponUser = useMemo(() => existingUsers.find((i) => i.coupon === values.coupon.trim().toUpperCase()), [values.coupon]);
  const knownEmailUser = useMemo(() => existingUsers.find((i) => i.email.toLowerCase() === values.email.trim().toLowerCase()), [values.email]);

  function update(key, value) { setValues((c) => ({ ...c, [key]: value })); setStatus(null); }
  function goAfterAuth() { if (isExistingUser) { authenticate(); navigate("/app/dashboard"); return; } navigate("/profile-setup"); }

  function sendOtp() {
    if (isExistingUser && !knownMobileUser) { setStatus({ type: "error", message: "User not exist with this mobile number." }); return; }
    navigate(`/otp-verify?next=${encodeURIComponent(isExistingUser ? "/app/dashboard" : "/profile-setup")}&identifier=${values.mobile}`);
  }
  function loginCoupon() {
    if (isExistingUser && !knownCouponUser) { setStatus({ type: "error", message: "User not exist with this coupon code." }); return; }
    goAfterAuth();
  }
  function loginEmail() {
    if (!knownEmailUser) { setStatus({ type: "error", message: "User not exist with this email." }); return; }
    if (knownEmailUser.password !== values.password) { setStatus({ type: "error", message: "Incorrect password." }); return; }
    authenticate(); navigate("/app/dashboard");
  }

  const primaryStyle = {
    borderRadius: "10px", fontWeight: "700", height: "46px", width: "100%",
    background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
    boxShadow: "0 4px 14px rgba(154,33,25,0.28)", fontSize: "14px",
  };

  return (
    <AuthShell
      title={isExistingUser ? "Welcome Back" : "Continue Your Journey"}
      subtitle={isExistingUser ? "Choose how you'd like to log in." : "Use OTP or coupon to continue."}
      backTo="/auth-entry"
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {isExistingUser && (
          <div style={{
            borderRadius: "12px", padding: "12px 16px",
            background: "#fdf5f4", border: "1px solid rgba(154,33,25,0.2)",
            fontSize: "12px", color: "#5a2a27", lineHeight: "1.7",
          }}>
            <strong style={{ color: "#9a2119" }}>Example existing user</strong><br />
            Mobile: 9876543210 · Email: jaya@email.com · Password: Jaya@123 · Coupon: CAREER2026
          </div>
        )}

        {/* Segmented mode selector */}
        <div style={{ display: "flex", gap: "6px", background: "#f7ece8", borderRadius: "12px", padding: "4px" }}>
          {(isExistingUser ? ["mobile", "coupon", "email"] : ["mobile", "coupon"]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} style={{
              flex: 1, padding: "8px 4px", border: "none", cursor: "pointer",
              borderRadius: "9px", fontSize: "13px", fontWeight: "700",
              background: mode === m ? "#9a2119" : "transparent",
              color: mode === m ? "#fff" : "#9a2119",
              transition: "all 0.2s",
              boxShadow: mode === m ? "0 2px 8px rgba(154,33,25,0.25)" : "none",
            }}>
              {m === "mobile" ? "Mobile OTP" : m === "coupon" ? "Coupon" : "Email"}
            </button>
          ))}
        </div>

        {mode === "mobile" && (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Mobile Number">
              <Input className="cm-input-field" prefix={<PhoneOutlined style={{ color: "#9a2119" }} />}
                value={values.mobile} onChange={(e) => update("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                size="large" style={{ borderRadius: "10px" }} />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.mobile.length !== 10} onClick={sendOtp} style={primaryStyle}>
              Send OTP
            </Button>
          </Form>
        )}

        {mode === "coupon" && (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Institution Coupon Code">
              <Input className="cm-input-field" value={values.coupon} onChange={(e) => update("coupon", e.target.value.toUpperCase())}
                size="large" style={{ borderRadius: "10px", fontWeight: "700", letterSpacing: "2px" }} />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.coupon.length < 3} onClick={loginCoupon} style={primaryStyle}>
              {isExistingUser ? "Login with Coupon" : "Continue with Coupon"}
            </Button>
          </Form>
        )}

        {mode === "email" && isExistingUser && (
          <Form layout="vertical" className="cm-form-label">
            <Form.Item label="Email Address">
              <Input className="cm-input-field" prefix={<MailOutlined style={{ color: "#9a2119" }} />}
                value={values.email} onChange={(e) => update("email", e.target.value)} size="large" style={{ borderRadius: "10px" }} />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password className="cm-input-field" prefix={<LockOutlined style={{ color: "#9a2119" }} />}
                value={values.password} onChange={(e) => update("password", e.target.value)}
                iconRender={(v) => (v ? <EyeTwoTone twoToneColor="#9a2119" /> : <EyeInvisibleOutlined />)}
                size="large" style={{ borderRadius: "10px" }} />
            </Form.Item>
            <Button type="primary" block size="large" onClick={loginEmail} style={primaryStyle}>Login with Email</Button>
            <div style={{ marginTop: "10px" }}>
              <Link to="/forgot-password" style={{ fontSize: "13px", fontWeight: "700", color: "#9a2119" }}>Forgot Password?</Link>
            </div>
          </Form>
        )}

        {status && <Alert type={status.type} message={status.message} style={{ borderRadius: "10px" }} />}

        <div style={{ textAlign: "center", fontSize: "13px", paddingTop: "4px" }}>
          <div style={{ marginBottom: "6px" }}>
            {isExistingUser
              ? <Link to="/onboarding" style={{ color: "#9a2119", fontWeight: "600" }}>New user? Start onboarding</Link>
              : <Link to="/auth-entry" style={{ color: "#9a2119", fontWeight: "600" }}>Existing user? Go to login options</Link>}
          </div>
          <Text style={{ fontSize: "11px", color: "#bbb" }}>By continuing, you agree to Career Map's Terms of Service and Privacy Policy.</Text>
        </div>
      </Space>
    </AuthShell>
  );
}

/* ─── SignupPage ─────────────────────────────────────────────────────────── */
export function SignupPage() {
  return (
    <AuthShell title="Create Account" subtitle="Join Career Map today." backTo="/auth-entry">
      <Form layout="vertical" className="cm-form-label" style={{ display: "grid", gap: "2px" }}>
        {["Full Name", "Email Address", "Mobile Number", "Password", "Confirm Password", "City", "State"].map((label) => (
          <Form.Item key={label} label={label}>
            {label.toLowerCase().includes("password")
              ? <Input.Password className="cm-input-field" size="large" style={{ borderRadius: "10px" }} />
              : <Input className="cm-input-field" size="large" style={{ borderRadius: "10px" }} />}
          </Form.Item>
        ))}
        <Link to="/otp-verify">
          <Button type="primary" block size="large" style={{
            borderRadius: "10px", fontWeight: "700", height: "46px",
            background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
            boxShadow: "0 4px 14px rgba(154,33,25,0.28)",
          }}>Register</Button>
        </Link>
      </Form>
    </AuthShell>
  );
}

/* ─── OtpVerifyPage ──────────────────────────────────────────────────────── */
export function OtpVerifyPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [params] = useSearchParams();
  const [otp, setOtp] = useState("");
  const next = params.get("next") || "/profile-setup";
  const identifier = params.get("identifier") || "your phone";

  return (
    <AuthShell title="Verify OTP" subtitle={`Enter the 4-digit code sent to ${identifier}.`} backTo="/login">
      <Space direction="vertical" size="large" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          borderRadius: "16px", padding: "16px 24px",
          background: "#fdf5f4", border: "1px solid rgba(154,33,25,0.15)",
          textAlign: "center", width: "100%",
        }}>
          <div style={{ fontSize: "28px", marginBottom: "6px", color: "#9a2119" }}><PhoneOutlined /></div>
          <div style={{ fontSize: "13px", color: "#888" }}>OTP sent to</div>
          <div style={{ fontSize: "15px", fontWeight: "800", color: "#9a2119" }}>{identifier}</div>
        </div>
        <div className="cm-otp" style={{ display: "flex", justifyContent: "center" }}>
          <Input.OTP length={4} value={otp} onChange={setOtp} />
        </div>
        <Button type="primary" block size="large" disabled={otp.length !== 4}
          onClick={() => { if (next.startsWith("/app")) authenticate(); navigate(next); }}
          style={{
            borderRadius: "10px", fontWeight: "700", height: "46px",
            background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
            boxShadow: "0 4px 14px rgba(154,33,25,0.28)",
          }}>
          Verify and Continue
        </Button>
      </Space>
    </AuthShell>
  );
}

/* ─── ProfileSetupPage ───────────────────────────────────────────────────── */
export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { authenticate, onboarding, saveOnboarding, saveUserProfile, showPromoMessage, userProfile } = useAppState();
  const [values, setValues] = useState({
    name: onboarding.name || userProfile.name, email: userProfile.email,
    mobile: userProfile.mobile, password: userProfile.password,
    address: userProfile.address, city: userProfile.city,
    stateName: userProfile.stateName, gender: userProfile.gender, dob: userProfile.dob,
  });
  function update(key, value) { setValues((c) => ({ ...c, [key]: value })); }

  return (
    <AuthShell title="Complete Your Profile" subtitle="Help us serve you better." backTo="/login">
      <Form layout="vertical" className="cm-form-label">
        <Row gutter={12}>
          {[
            ["name", onboarding.userType === "parent" ? "Parent Name" : "Full Name"],
            ["email", "Email Address"], ["mobile", "Mobile Number"], ["password", "Password"],
            ["address", "Address"], ["city", "City"], ["stateName", "State"], ["dob", "Date of Birth"],
          ].map(([key, label]) => (
            <Col xs={24} md={12} key={key}>
              <Form.Item label={label}>
                {key === "password"
                  ? <Input.Password className="cm-input-field" value={values[key]} onChange={(e) => update(key, e.target.value)} style={{ borderRadius: "10px" }} />
                  : <Input className="cm-input-field" value={values[key]} onChange={(e) => update(key, e.target.value)} style={{ borderRadius: "10px" }} />}
              </Form.Item>
            </Col>
          ))}
          <Col xs={24}>
            <Form.Item label="Gender">
              <div style={{ display: "flex", gap: "8px" }}>
                {["Male", "Female", "Other"].map((g) => (
                  <button key={g} type="button" onClick={() => update("gender", g)} style={{
                    flex: 1, padding: "8px 12px", border: "2px solid",
                    borderColor: values.gender === g ? "#9a2119" : "#e2d5d4",
                    borderRadius: "10px", background: values.gender === g ? "#fdf5f4" : "#fff",
                    fontWeight: "700", fontSize: "13px",
                    color: values.gender === g ? "#9a2119" : "#5a2a27",
                    cursor: "pointer", transition: "all 0.2s",
                  }}>{g}</button>
                ))}
              </div>
            </Form.Item>
          </Col>
        </Row>
        <Button type="primary" size="large" style={{
          borderRadius: "10px", fontWeight: "700", height: "46px", width: "100%",
          background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
          boxShadow: "0 4px 14px rgba(154,33,25,0.28)",
        }} onClick={() => {
          saveOnboarding({ ...onboarding, name: values.name });
          saveUserProfile({ ...userProfile, ...values, childName: onboarding.childName });
          showPromoMessage("Profile created successfully.");
          authenticate();
          navigate("/promo");
        }}>
          Complete Profile
        </Button>
      </Form>
    </AuthShell>
  );
}

/* ─── PromoPage ──────────────────────────────────────────────────────────── */
export function PromoPage() {
  const navigate = useNavigate();
  const { clearPromoMessage, promoMessage } = useAppState();

  return (
    <AuthShell title="What You Can Explore" subtitle="Everything you need for career guidance." backTo="/profile-setup">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {promoMessage && <Alert type="success" message={promoMessage} afterClose={clearPromoMessage} closable style={{ borderRadius: "12px" }} />}
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            ["Psychometric Tests", "Discover strengths and ideal fit.", "🧠"],
            ["Career Library", "500+ career options across streams.", "📚"],
            ["Expert Mentors", "Guidance from counsellors and experts.", "🎯"],
            ["Scholarships & Exams", "Stay updated on opportunities.", "🏆"],
            ["Study Abroad", "Explore international education paths.", "✈️"],
          ].map(([title, desc, icon]) => (
            <div key={title} className="cm-promo-item">
              <div style={{
                width: "42px", height: "42px", borderRadius: "12px",
                background: "#fdf5f4", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", flexShrink: 0,
              }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#1a0a09" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{desc}</div>
              </div>
              <div style={{ color: "#9a2119", fontSize: "16px", flexShrink: 0 }}>→</div>
            </div>
          ))}
        </div>
        <Button type="primary" block size="large" onClick={() => navigate("/app/dashboard")} style={{
          borderRadius: "10px", fontWeight: "700", height: "46px",
          background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
          boxShadow: "0 4px 14px rgba(154,33,25,0.28)",
        }}>Next</Button>
      </Space>
    </AuthShell>
  );
}

/* ─── ForgotPasswordPage ─────────────────────────────────────────────────── */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function sendReset() {
    const user = existingUsers.find((i) => i.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) { setMessage("User not exist with this email."); return; }
    setMessage("Reset code sent. Use 1234.");
    setStep("code");
  }
  function verifyCode() {
    if (code !== "1234") { setMessage("Invalid reset code."); return; }
    authenticate(); navigate("/app/dashboard");
  }

  const primaryStyle = {
    borderRadius: "10px", fontWeight: "700", height: "46px", width: "100%",
    background: "linear-gradient(135deg, #9a2119, #c0392b)", borderColor: "#9a2119",
    boxShadow: "0 4px 14px rgba(154,33,25,0.28)",
  };

  return (
    <AuthShell
      title={step === "email" ? "Forgot Password" : "Enter Reset Code"}
      subtitle={step === "email" ? "Enter your email to receive a reset code." : "Enter the 4-digit code to continue."}
      backTo="/login"
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {step === "email" ? (
          <>
            <Form layout="vertical" className="cm-form-label">
              <Form.Item label="Email Address">
                <Input className="cm-input-field" prefix={<MailOutlined style={{ color: "#9a2119" }} />}
                  value={email} onChange={(e) => setEmail(e.target.value)} size="large" style={{ borderRadius: "10px" }} />
              </Form.Item>
            </Form>
            <Button type="primary" size="large" block onClick={sendReset} style={primaryStyle}>Send Reset Link</Button>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>Enter the 4-digit code sent to your email</div>
              <div className="cm-otp" style={{ display: "flex", justifyContent: "center" }}>
                <Input.OTP length={4} value={code} onChange={setCode} />
              </div>
            </div>
            <Button type="primary" size="large" block onClick={verifyCode} style={primaryStyle}>Verify Code</Button>
          </>
        )}
        {message && (
          <Alert type={message.includes("not exist") || message.includes("Invalid") ? "error" : "success"}
            message={message} style={{ borderRadius: "10px" }} />
        )}
      </Space>
    </AuthShell>
  );
}