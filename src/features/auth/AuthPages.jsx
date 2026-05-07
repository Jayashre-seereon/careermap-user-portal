import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
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

export function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/auth-entry", { replace: true }), 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="brand-gradient flex min-h-screen items-center justify-center p-6 text-white">
      <div className="text-center">
        <img src={Bee} alt="Career Map" className="mx-auto mb-6 h-24 w-auto object-contain" />
        <Title className="!mb-2 !text-white">Career Map</Title>
        <Paragraph className="!mb-6 !text-white/75">Discover Your Future</Paragraph>
        <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

export function AuthEntryPage() {
  return (
    <AuthFrame title="Welcome to Career Map" subtitle="Choose how you want to continue into the user portal." compact>
      <div className="grid gap-3">
        <Link to="/onboarding">
          <div className="rounded-[20px] border border-slate-200 px-4 py-4 transition hover:border-brand hover:bg-slate-50">
            <Space size={18} align="start">
              <div className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                <UserOutlined />
              </div>
              <div>
                <div className="display-font text-xl font-bold text-ink">New User</div>
                <div className="mt-1 text-sm text-muted">Start onboarding and create your profile.</div>
              </div>
            </Space>
          </div>
        </Link>
        <Link to="/login?userType=existing">
          <div className="rounded-[20px] border border-slate-200 px-4 py-4 transition hover:border-brand hover:bg-slate-50">
            <Space size={18} align="start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f7ece8] text-brand">
                <LockOutlined />
              </div>
              <div>
                <div className="display-font text-xl font-bold text-ink">Existing User</div>
                <div className="mt-1 text-sm text-muted">Login with OTP, coupon, or email and password.</div>
              </div>
            </Space>
          </div>
        </Link>
      </div>
    </AuthFrame>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { saveOnboarding } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    userType: "",
    name: "",
    childName: "",
    selectedClass: "",
    selectedStream: "",
    otherClass: "",
    otherStream: "",
    selectedInterests: [],
    selectedClarity: "",
    selectedStrengths: [],
    selectedPriorities: [],
  });

  const steps = [
    "Role",
    "Welcome",
    "Name",
    form.userType === "parent" ? "Child" : "Class",
    form.userType === "parent" ? "Class" : "Stream",
    form.userType === "parent" ? "Stream" : "Interests",
    "Clarity",
    "Strengths",
    "Priorities",
    "Done",
  ];

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(key, value) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
    }));
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
    if (step === 8) {
      saveOnboarding({ ...form, selectedGuidance: "" });
      setStep(9);
      return;
    }
    if (step === 9) {
      navigate("/login");
      return;
    }
    setStep((current) => current + 1);
  }

  const multiGrid = (items, key) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Button
          key={item}
          block
          size="large"
          type={form[key].includes(item) ? "primary" : "default"}
          className="!h-auto !rounded-2xl !py-4 !text-left"
          onClick={() => toggleArray(key, item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );

  const singleGrid = (items, key) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Button
          key={item}
          block
          size="large"
          type={form[key] === item ? "primary" : "default"}
          className="!h-auto !rounded-2xl !py-4 !text-left"
          onClick={() => update(key, item)}
        >
          {item}
        </Button>
      ))}
    </div>
  );

  return (
    <AuthFrame title="Choose Your Roadmap" subtitle="Tell us a little about yourself so we can personalize the full portal experience." backTo="/auth-entry" compact>
      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-full items-center gap-2">
          {[
            "Role",
            "Name",
            "Class",
            "Stream",
            "Interests",
            "Clarity",
            "Strengths",
            "Priorities",
          ].map((label, index) => {
            const visibleStepIndex = Math.max(0, Math.min(step === 1 ? 1 : step === 9 ? 7 : step - 1, 7));
            const status = index < visibleStepIndex ? "done" : index === visibleStepIndex ? "active" : "pending";
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${status === "active"
                      ? "border-brand bg-brand text-white"
                      : status === "done"
                        ? "border-slate-300 bg-slate-100 text-slate-600"
                        : "border-[#e5e7eb] bg-white text-slate-400"
                      }`}
                  >
                    {index + 1}
                  </div>
                  <div className="text-sm font-semibold text-slate-600">{label}</div>
                </div>
                {index < 7 ? <div className="h-px flex-1 bg-slate-200" /> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="space-y-6">
        {step === 0 ? (
          <Space direction="vertical" size="large" className="!w-full">
            <Title level={3}>Who are you exploring for?</Title>
            <Radio.Group
              value={form.userType}
              onChange={(event) => update("userType", event.target.value)}
              className="!grid !gap-4"
            >
              <Radio.Button value="student" className="!h-auto !rounded-2xl !px-5 !py-4">
                I'm a Student
              </Radio.Button>
              <Radio.Button value="parent" className="!h-auto !rounded-2xl !px-5 !py-4">
                I'm a Parent
              </Radio.Button>
            </Radio.Group>
          </Space>
        ) : null}
        {step === 1 ? (
          <Result
            icon={
              <div className="flex justify-center w-full">
                <img src={Bee} alt="Bee" className="h-24 w-24 object-contain" />
              </div>
            }
            title={
              form.userType === "parent"
                ? "Welcome, Parent!"
                : form.userType === "student"
                  ? "Hi! I'm your Career Guide"
                  : "Hello! Let's personalize your experience"
            }
            subTitle={
              form.userType === "parent"
                ? "We'll help you explore career options for your child's future."
                : form.userType === "student"
                  ? "We'll help you discover the best career path and portal modules for your goals."
                  : "Tell us a little about yourself so we can personalize your portal experience."
            }
          />
        ) : null}
        {step === 2 ? (
          <Form layout="vertical">
            <Form.Item label={form.userType === "parent" ? "Parent Name" : "Full Name"}>
              <Input prefix={<UserOutlined />} value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Form.Item>
          </Form>
        ) : null}
        {step === 3 && form.userType === "student" ? (
          <div>
            <div>{singleGrid(onboardingOptions.studentClassOptions, "selectedClass")}</div>
            {form.selectedClass === "Other" ? (
              <Form layout="vertical" className="mt-4">
                <Form.Item label="Please specify your class">
                  <Input value={form.otherClass} onChange={(event) => update("otherClass", event.target.value)} />
                </Form.Item>
              </Form>
            ) : null}
          </div>
        ) : null}
        {step === 3 && form.userType === "parent" ? (
          <Form layout="vertical">
            <Form.Item label="Child's Name">
              <Input prefix={<UserOutlined />} value={form.childName} onChange={(event) => update("childName", event.target.value)} />
            </Form.Item>
          </Form>
        ) : null}
        {step === 4 && form.userType === "student" ? (
          <div>
            <div>{singleGrid(onboardingOptions.streamOptions, "selectedStream")}</div>
            {form.selectedStream === "Other" ? (
              <Form layout="vertical" className="mt-4">
                <Form.Item label="Please specify your stream">
                  <Input value={form.otherStream} onChange={(event) => update("otherStream", event.target.value)} />
                </Form.Item>
              </Form>
            ) : null}
          </div>
        ) : null}
        {step === 4 && form.userType === "parent" ? (
          <div>
            <div>{singleGrid(onboardingOptions.studentClassOptions, "selectedClass")}</div>
            {form.selectedClass === "Other" ? (
              <Form layout="vertical" className="mt-4">
                <Form.Item label="Please specify your child's class">
                  <Input value={form.otherClass} onChange={(event) => update("otherClass", event.target.value)} />
                </Form.Item>
              </Form>
            ) : null}
          </div>
        ) : null}
        {step === 5 && form.userType === "student" ? <div>{multiGrid(onboardingOptions.interestOptions, "selectedInterests")}</div> : null}
        {step === 5 && form.userType === "parent" ? (
          <div>
            <div>{singleGrid(onboardingOptions.streamOptions, "selectedStream")}</div>
            {form.selectedStream === "Other" ? (
              <Form layout="vertical" className="mt-4">
                <Form.Item label="Please specify your stream">
                  <Input value={form.otherStream} onChange={(event) => update("otherStream", event.target.value)} />
                </Form.Item>
              </Form>
            ) : null}
          </div>
        ) : null}
        {step === 6 ? <div>{singleGrid(onboardingOptions.clarityOptions, "selectedClarity")}</div> : null}
        {step === 7 ? <div>{multiGrid(onboardingOptions.strengthOptions, "selectedStrengths")}</div> : null}
        {step === 8 ? <div>{multiGrid(onboardingOptions.priorityOptions, "selectedPriorities")}</div> : null}
        {step === 9 ? (
          <Result
            status="success"
            icon={
              <div className="flex justify-center w-full">
                <img src={Bee} alt="Bee" className="h-24 w-24 object-contain" />
              </div>
            }
            title="Great! We've personalized your experience"
            subTitle="Your career journey is ready. Let's sign you in to get started."
          />
        ) : null}
        <div className="mt-6 flex justify-between">
          <Button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Previous
          </Button>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={next} disabled={!canContinue()}>
            {step === 9 ? "Continue" : step === 8 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </AuthFrame>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authenticate } = useAppState();
  const [mode, setMode] = useState("mobile");
  const [status, setStatus] = useState(null);
  const [values, setValues] = useState({ mobile: "", coupon: "", email: "", password: "" });
  const isExistingUser = params.get("userType") === "existing";

  const knownMobileUser = useMemo(() => existingUsers.find((item) => item.mobile === values.mobile), [values.mobile]);
  const knownCouponUser = useMemo(() => existingUsers.find((item) => item.coupon === values.coupon.trim().toUpperCase()), [values.coupon]);
  const knownEmailUser = useMemo(
    () => existingUsers.find((item) => item.email.toLowerCase() === values.email.trim().toLowerCase()),
    [values.email]
  );

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setStatus(null);
  }

  function goAfterAuth() {
    if (isExistingUser) {
      authenticate();
      navigate("/app/dashboard");
      return;
    }
    navigate("/profile-setup");
  }

  function sendOtp() {
    if (isExistingUser && !knownMobileUser) {
      setStatus({ type: "error", message: "User not exist with this mobile number." });
      return;
    }
    navigate(`/otp-verify?next=${encodeURIComponent(isExistingUser ? "/app/dashboard" : "/profile-setup")}&identifier=${values.mobile}`);
  }

  function loginCoupon() {
    if (isExistingUser && !knownCouponUser) {
      setStatus({ type: "error", message: "User not exist with this coupon code." });
      return;
    }
    goAfterAuth();
  }

  function loginEmail() {
    if (!knownEmailUser) {
      setStatus({ type: "error", message: "User not exist with this email." });
      return;
    }
    if (knownEmailUser.password !== values.password) {
      setStatus({ type: "error", message: "Incorrect password." });
      return;
    }
    authenticate();
    navigate("/app/dashboard");
  }

  return (
    <AuthFrame title={isExistingUser ? "Welcome Back" : "Continue Your Journey"} subtitle={isExistingUser ? "Choose how you'd like to log in." : "Use OTP or coupon to continue."} backTo="/auth-entry" compact>
      <Space direction="vertical" size="large" className="!w-full">
        {isExistingUser ? (
          <Alert
            type="info"
            message="Example existing user"
            description="Mobile: 9876543210 | Email: jaya@email.com | Password: Jaya@123 | Coupon: CAREER2026"
          />
        ) : null}
        <Radio.Group value={mode} onChange={(event) => setMode(event.target.value)} buttonStyle="solid">
          <Radio.Button value="mobile">Mobile OTP</Radio.Button>
          <Radio.Button value="coupon">Coupon</Radio.Button>
          {isExistingUser ? <Radio.Button value="email">Email</Radio.Button> : null}
        </Radio.Group>
        {mode === "mobile" ? (
          <Form layout="vertical">
            <Form.Item label="Mobile Number">
              <Input prefix={<PhoneOutlined />} value={values.mobile} onChange={(event) => update("mobile", event.target.value.replace(/\D/g, "").slice(0, 10))} />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.mobile.length !== 10} onClick={sendOtp}>
              Send OTP
            </Button>
          </Form>
        ) : null}
        {mode === "coupon" ? (
          <Form layout="vertical">
            <Form.Item label="Institution Coupon Code">
              <Input value={values.coupon} onChange={(event) => update("coupon", event.target.value.toUpperCase())} />
            </Form.Item>
            <Button type="primary" block size="large" disabled={values.coupon.length < 3} onClick={loginCoupon}>
              {isExistingUser ? "Login with Coupon" : "Continue with Coupon"}
            </Button>
          </Form>
        ) : null}
        {mode === "email" && isExistingUser ? (
          <Form layout="vertical">
            <Form.Item label="Email Address">
              <Input prefix={<MailOutlined />} value={values.email} onChange={(event) => update("email", event.target.value)} />
            </Form.Item>
            <Form.Item label="Password">
              <Input.Password
                prefix={<LockOutlined />}
                value={values.password}
                onChange={(event) => update("password", event.target.value)}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            <Button type="primary" block size="large" onClick={loginEmail}>
              Login with Email
            </Button>
            <Link to="/forgot-password" className="text-sm font-semibold text-brand">
              Forgot Password?
            </Link>
          </Form>
        ) : null}
        {status ? <Alert type={status.type} message={status.message} /> : null}
        <div className="space-y-2 text-center text-sm">
          <div>
            {isExistingUser ? <Link to="/onboarding">New user? Start onboarding</Link> : <Link to="/auth-entry">Existing user? Go to login options</Link>}
          </div>
          <Text className="!text-xs !text-muted">By continuing, you agree to Career Map's Terms of Service and Privacy Policy.</Text>
        </div>
      </Space>
    </AuthFrame>
  );
}

export function SignupPage() {
  return (
    <AuthFrame title="Create Account" subtitle="Join Career Map today." backTo="/auth-entry" compact>
      <Form layout="vertical" className="grid gap-2">
        {["Full Name", "Email Address", "Mobile Number", "Password", "Confirm Password", "City", "State"].map((label) => (
          <Form.Item key={label} label={label}>
            {label.toLowerCase().includes("password") ? <Input.Password /> : <Input />}
          </Form.Item>
        ))}
        <Link to="/otp-verify">
          <Button type="primary" block size="large">
            Register
          </Button>
        </Link>
      </Form>
    </AuthFrame>
  );
}

export function OtpVerifyPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [params] = useSearchParams();
  const [otp, setOtp] = useState("");
  const next = params.get("next") || "/profile-setup";
  const identifier = params.get("identifier") || "your phone";

  return (
    <AuthFrame title="Verify OTP" subtitle={`Enter the 4-digit code sent to ${identifier}.`} backTo="/login" compact>
      <div className="text-center mb-6">
        <Title level={3} className="display-font !mb-2">
          Continue Your Journey
        </Title>
        <Paragraph className="!mb-0 !text-muted">
          Use OTP or coupon to continue.
        </Paragraph>
      </div>
      <Space direction="vertical" size="large" className="!w-full flex flex-col items-center justify-center">
        <Input.OTP length={4} value={otp} onChange={setOtp} />
        <Button
          type="primary"
          block
          size="large"
          disabled={otp.length !== 4}
          onClick={() => {
            if (next.startsWith("/app")) {
              authenticate();
            }
            navigate(next);
          }}
        >
          Verify and Continue
        </Button>
      </Space>
    </AuthFrame>
  );
}

export function ProfileSetupPage() {
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
    <AuthFrame title="Complete Your Profile" subtitle="Help us serve you better." backTo="/login" compact>
      <Form layout="vertical">
        <Row gutter={16}>
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
                  <Input.Password value={values[key]} onChange={(event) => update(key, event.target.value)} />
                ) : (
                  <Input value={values[key]} onChange={(event) => update(key, event.target.value)} />
                )}
              </Form.Item>
            </Col>
          ))}
          <Col xs={24}>
            <Form.Item label="Gender">
              <Radio.Group value={values.gender} onChange={(event) => update("gender", event.target.value)}>
                <Radio.Button value="Male">Male</Radio.Button>
                <Radio.Button value="Female">Female</Radio.Button>
                <Radio.Button value="Other">Other</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          size="large"
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
    </AuthFrame>
  );
}

export function PromoPage() {
  const navigate = useNavigate();
  const { clearPromoMessage, promoMessage } = useAppState();

  return (
    <AuthFrame title="What You Can Explore" subtitle="Everything you need for career guidance." backTo="/profile-setup" compact>
      <Space direction="vertical" size="large" className="!w-full">
        {promoMessage ? <Alert type="success" message={promoMessage} afterClose={clearPromoMessage} closable /> : null}
        <div className="grid gap-4">
          {[
            ["Psychometric Tests", "Discover strengths and ideal fit."],
            ["Career Library", "500+ career options across streams."],
            ["Expert Mentors", "Guidance from counsellors and experts."],
            ["Scholarships & Exams", "Stay updated on opportunities."],
            ["Study Abroad", "Explore international education paths."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-[18px] border border-slate-200 px-4 py-4">
              <div className="text-lg font-black text-ink">{title}</div>
              <div className="mt-1 text-sm text-muted">{desc}</div>
            </div>
          ))}
        </div>
        <Button type="primary" block size="large" onClick={() => navigate("/app/dashboard")}>
          Next
        </Button>
      </Space>
    </AuthFrame>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { authenticate } = useAppState();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  function sendReset() {
    const user = existingUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      setMessage("User not exist with this email.");
      return;
    }
    setMessage("Reset code sent. Use 1234.");
    setStep("code");
  }

  function verifyCode() {
    if (code !== "1234") {
      setMessage("Invalid reset code.");
      return;
    }
    authenticate();
    navigate("/app/dashboard");
  }

  return (
    <AuthFrame title={step === "email" ? "Forgot Password" : "Enter Reset Code"} subtitle={step === "email" ? "Enter your email to receive a reset code." : "Enter the 4-digit code to continue."} backTo="/login" compact>
      <Space direction="vertical" size="large" className="!w-full">
        {step === "email" ? (
          <>
            <Input prefix={<MailOutlined />} value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="primary" size="large" block onClick={sendReset}>
              Send Reset Link
            </Button>
          </>
        ) : (
          <>
            <Input.OTP length={4} value={code} onChange={setCode} />
            <Button type="primary" size="large" block onClick={verifyCode}>
              Verify Code
            </Button>
          </>
        )}
        {message ? <Alert type={message.includes("not exist") || message.includes("Invalid") ? "error" : "success"} message={message} /> : null}
      </Space>
    </AuthFrame>
  );
}
