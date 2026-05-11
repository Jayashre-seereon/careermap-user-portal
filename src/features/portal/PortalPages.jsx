import {
  BellOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CreditCardOutlined,
  LockOutlined,
  PlayCircleOutlined,
  ArrowRightOutlined,
  SearchOutlined,
  StarFilled,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Result,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  assessmentFeatures,
  assessmentPolicies,
  careerLibrary,
  entranceExams,
  featuredInstitutes,
  featuredMentors,
  featuredScholarships,
  heroStats,
  institutes,
  masterClasses,
  mentors,
  moduleCards,
  moduleArtPresets,
  notifications,
  palette,
  personalityQuestions,
  personalityTypes,
  quickPsychometricQuestions,
  quizCatalog,
  sampleQuizQuestions,
  scholarships,
  studyAbroadCountries,
  subscriptions,
} from "../../data/careermapData";
import { PageHero, SectionCard, SoftTag, StatTile, Text, Title } from "../../components/ui";
import { useAppState } from "../../state/AppStateContext";
import { DashboardHeroSection } from "./components/DashboardHeroSection";
import { ExploreModulesSection } from "./components/ExploreModulesSection";
import { PersonalityQuizQuestion, PersonalityQuizResults } from "./components/PersonalityQuizSections";

const { Paragraph } = Typography;



function usePortalNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  return { navigate, location };
}

function PremiumGate({ title, description, returnTo }) {
  const navigate = useNavigate();
  return (
    <Alert
      type="warning"
      showIcon
      message={title}
      description={
        <Space direction="vertical" size="middle">
          <span>{description}</span>
          <Button type="primary" onClick={() => navigate(`/app/subscription?returnTo=${encodeURIComponent(returnTo)}`)}>
            View Plans
          </Button>
        </Space>
      }
    />
  );
}

export function DashboardPage() {
  const { isUnlocked, unreadNotificationsCount } = useAppState();
  const { navigate } = usePortalNavigation();
  const [showPersonality, setShowPersonality] = useState(false);
  const [personalityStep, setPersonalityStep] = useState(0);
  const [answers, setAnswers] = useState(Array(personalityQuestions.length).fill(null));
  const [complete, setComplete] = useState(false);

  const personalityResult = useMemo(() => {
    const counts = [0, 0, 0, 0];
    answers.forEach((answer) => {
      if (answer !== null) counts[answer] += 1;
    });
    return personalityTypes[counts.indexOf(Math.max(...counts))];
  }, [answers]);

  if (showPersonality && !complete) {
    return (
      <PersonalityQuizQuestion
        personalityStep={personalityStep}
        answers={answers}
        setAnswers={setAnswers}
        setShowPersonality={setShowPersonality}
        setPersonalityStep={setPersonalityStep}
        setComplete={setComplete}
      />
    );
  }

  if (showPersonality && complete) {
    return (
      <PersonalityQuizResults
        personalityResult={personalityResult}
        setShowPersonality={setShowPersonality}
        navigate={navigate}
      />
    );
  }

  const handleTestClick = () => {
    if (isUnlocked("psychometric-test")) {
      navigate("/app/psychometric-test");
    } else {
      setShowPersonality(true);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeroSection onTestClick={handleTestClick} />
      <ExploreModulesSection unreadNotificationsCount={unreadNotificationsCount} />
    </div>
  );
}

export function AssessmentPage() {
  const { activePlanId, isUnlocked } = useAppState();
  const { navigate, location } = usePortalNavigation();
  const testUnlocked = isUnlocked("psychometric-test");

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <SectionCard title="Test Features">
            <List dataSource={assessmentFeatures} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </SectionCard>
        </Col>
        <Col xs={24} lg={12}>
          <SectionCard title="Test Policy">
            <List dataSource={assessmentPolicies} renderItem={(item) => <List.Item>{item}</List.Item>} />
          </SectionCard>
        </Col>
      </Row>
      {!testUnlocked ? (
        <PremiumGate
          title="Unlock Test"
          description="Subscribe to the Psychometric Test plan to take the full assessment and unlock the report flow."
          returnTo={location.pathname}
        />
      ) : null}
      <SectionCard title="Status">
        <Paragraph>{activePlanId ? "Your subscription is active. You can proceed with the psychometric flow and view updated results in your profile history." : "No active test plan yet. Choose a plan to unlock one full psychometric attempt and the related career report."}</Paragraph>
      </SectionCard>
    </div>
  );
}

export function PsychometricTestPage() {
  const { addTestHistory, isUnlocked } = useAppState();
  const { navigate } = usePortalNavigation();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(quickPsychometricQuestions.length).fill(null));
  const [stage, setStage] = useState("questions");

  const answerWeights = {
    "Strongly Agree": 4,
    Agree: 3,
    Neutral: 2,
    Disagree: 1,
  };

  const domainScores = {
    analytical: 0,
    creative: 0,
    people: 0,
    business: 0,
    technology: 0,
  };

  answers.forEach((answer, index) => {
    const weight = answerWeights[answer] || 0;
    if (index === 0) domainScores.analytical += weight;
    if (index === 1) {
      domainScores.creative += weight;
      domainScores.analytical += 5 - weight;
    }
    if (index === 2) domainScores.people += weight;
    if (index === 3) domainScores.business += weight;
    if (index === 4) domainScores.technology += weight;
  });

  const reportHighlights = {
    analytical: {
      title: "Analytical Explorer",
      summary: "You are strongest in structured thinking, pattern recognition, and data-driven decision making.",
      careers: ["Engineering", "Data Science", "Finance Analysis"],
    },
    creative: {
      title: "Creative Visionary",
      summary: "You show a strong preference for imagination, originality, and creative problem solving.",
      careers: ["Design", "Media", "Architecture"],
    },
    people: {
      title: "People-Centred Guide",
      summary: "You naturally lean toward mentoring, supporting, and understanding the needs of others.",
      careers: ["Psychology", "Teaching", "Human Resources"],
    },
    business: {
      title: "Business Strategist",
      summary: "You are drawn toward planning, decision making, and understanding how organisations grow.",
      careers: ["Management", "Marketing", "Entrepreneurship"],
    },
    technology: {
      title: "Technology Builder",
      summary: "You are highly motivated by innovation, tools, systems, and emerging technology.",
      careers: ["Software Development", "AI", "Cybersecurity"],
    },
  };

  const rankedDomains = Object.entries(domainScores).sort((left, right) => right[1] - left[1]);
  const topDomain = rankedDomains[0]?.[0] || "analytical";
  const secondaryDomain = rankedDomains[1]?.[0] || "technology";
  const profile = reportHighlights[topDomain];
  const totalScore = answers.reduce((sum, answer) => sum + (answerWeights[answer] || 0), 0);
  const maxScore = quickPsychometricQuestions.length * 4;
  const scorePercent = Math.round((totalScore / maxScore) * 100);
  const answeredCount = answers.filter(Boolean).length;
  const isLastQuestion = current === quickPsychometricQuestions.length - 1;
  const currentQuestion = quickPsychometricQuestions[current];

  function handleBack() {
    if (stage === "result") {
      navigate("/app/assessment");
      return;
    }

    if (current > 0) {
      setCurrent((value) => value - 1);
      return;
    }

    navigate("/app/assessment");
  }

  function handleAnswerSelect(option) {
    const next = [...answers];
    next[current] = option;
    setAnswers(next);
  }

  function handleRetake() {
    setAnswers(Array(quickPsychometricQuestions.length).fill(null));
    setCurrent(0);
    setStage("questions");
  }

  function handleNext() {
    if (isLastQuestion) {
      addTestHistory({
        id: `psychometric-${Date.now()}`,
        title: "Psychometric Test",
        subtitle: `Score ${scorePercent}% • Completed on ${new Date().toLocaleDateString("en-IN")}`,
        status: "Report Ready",
      });
      setStage("result");
      return;
    }

    setCurrent((value) => value + 1);
  }

  if (!isUnlocked("psychometric-test")) {
    return <PremiumGate title="Psychometric Test Locked" description="Subscribe to continue with the full psychometric test." returnTo="/app/psychometric-test" />;
  }

  if (stage === "result") {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={handleBack} />
        <Result
          status="success"
          title={`Psychometric Score: ${scorePercent}%`}
          subTitle={`${profile.title} is your strongest career-fit pattern.`}
          extra={[
            <Button key="dashboard" type="primary" onClick={() => navigate("/app/dashboard")}>
              Back to Dashboard
            </Button>,
            <Button key="retake" onClick={handleRetake}>
              Retake Test
            </Button>,
          ]}
        />
      
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={handleBack} />
      <SectionCard
        title={`Question ${current + 1} of ${quickPsychometricQuestions.length}`}
        extra={<Text className="!font-bold !text-brand">{scorePercent}% progress potential</Text>}
      >
        <Space direction="vertical" size="middle" className="!w-full">
          <div className="h-2 overflow-hidden rounded-full bg-[#f0e5e0]">
            <div
              className="h-full rounded-full bg-[#9a2119] transition-all duration-300"
              style={{ width: `${((current + 1) / quickPsychometricQuestions.length) * 100}%` }}
            />
          </div>
          <Text className="!text-muted">Choose one answer and move through the test step by step. Your previous answers stay saved when you go back.</Text>
        </Space>
      </SectionCard>
      <SectionCard title={currentQuestion.q}>
        <div className="grid gap-3">
          {currentQuestion.options.map((option) => (
            <Button
              key={option}
              block
              size="large"
              type={answers[current] === option ? "primary" : "default"}
              className="!h-auto !rounded-2xl !py-4 !text-left"
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </SectionCard>
      <div className="flex justify-between">
        <Button onClick={handleBack}>
          {current === 0 ? "Back to Assessment" : "Previous"}
        </Button>
        <Button
          type="primary"
          disabled={!answers[current]}
          onClick={handleNext}
        >
          {isLastQuestion ? "Finish Test" : "Next"}
        </Button>
      </div>
    </div>
  );
}

export function SubscriptionPage() {
  const { activePlanId } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const returnTo = params.get("returnTo");

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        {subscriptions.map((plan) => (
          <Col xs={24} lg={12} key={plan.id}>
            <Card className="!h-full !border-[#eedad4] !shadow-soft">
              <Space direction="vertical" size="middle" className="!w-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-2xl font-black text-ink">{plan.name}</div>
                    <div className="mt-2 text-sm text-muted">{plan.description}</div>
                  </div>
                  <div className="flex gap-2">
                    {plan.recommended ? <SoftTag color="red">Recommended</SoftTag> : null}
                    {plan.highestseller ? <SoftTag color="gold">Highest Seller</SoftTag> : null}
                  </div>
                </div>
                <div className="text-4xl font-black text-brand">{plan.price}</div>
                <List size="small" dataSource={plan.features} renderItem={(item) => <List.Item>{item}</List.Item>} />
                <Button
                  type={activePlanId === plan.id ? "default" : "primary"}
                  size="large"
                  onClick={() => navigate(`/checkout?planId=${plan.id}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
                >
                  {activePlanId === plan.id ? "Current Plan" : "Choose Plan"}
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export function CheckoutPage() {
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const planId = params.get("planId");
  const returnTo = params.get("returnTo");
  const plan = subscriptions.find((item) => item.id === planId) || subscriptions[0];
  const [method, setMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [values, setValues] = useState({ upiId: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", bank: "" });

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  const canPay =
    method === "upi"
      ? values.upiId.includes("@")
      : method === "card"
        ? values.cardName && values.cardNumber.length === 16 && values.cardExpiry && values.cardCvv.length >= 3
        : Boolean(values.bank);

  useEffect(() => {
    if (!processing) return;
    const timer = setTimeout(() => navigate(`/payment-success?planId=${plan.id}&transactionId=TXN${Date.now().toString().slice(-8)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`), 1600);
    return () => clearTimeout(timer);
  }, [navigate, plan.id, processing, returnTo]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHero backOnly onBack={() => navigate(-1)} />
      {processing ? (
        <Result status="info" title="Processing payment" subTitle={`Please wait while we verify your ${method} payment.`} />
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <SectionCard title="Order Summary">
              <Space direction="vertical" size="middle" className="!w-full">
                <Statistic title="Plan" value={plan.name} />
                <Statistic title="Total Payable" value={plan.price} />
                <Statistic title="Validity" value="1 Year" />
              </Space>
            </SectionCard>
          </Col>
          <Col xs={24} lg={14}>
            <SectionCard title="Choose Payment Method">
              <Space direction="vertical" size="large" className="!w-full">
                <Radio.Group value={method} onChange={(event) => setMethod(event.target.value)}>
                  <Space direction="vertical">
                    <Radio value="upi">UPI</Radio>
                    <Radio value="card">Card</Radio>
                    <Radio value="netbanking">Net Banking</Radio>
                  </Space>
                </Radio.Group>
                {method === "upi" ? <Input placeholder="yourname@upi" value={values.upiId} onChange={(event) => update("upiId", event.target.value)} /> : null}
                {method === "card" ? (
                  <Row gutter={[12, 12]}>
                    <Col xs={24}><Input placeholder="Name on card" value={values.cardName} onChange={(event) => update("cardName", event.target.value)} /></Col>
                    <Col xs={24}><Input placeholder="1234567890123456" value={values.cardNumber} onChange={(event) => update("cardNumber", event.target.value.replace(/\D/g, "").slice(0, 16))} /></Col>
                    <Col xs={12}><Input placeholder="MM/YY" value={values.cardExpiry} onChange={(event) => update("cardExpiry", event.target.value)} /></Col>
                    <Col xs={12}><Input placeholder="CVV" value={values.cardCvv} onChange={(event) => update("cardCvv", event.target.value.replace(/\D/g, "").slice(0, 4))} /></Col>
                  </Row>
                ) : null}
                {method === "netbanking" ? (
                  <Select placeholder="Select Bank" options={["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak"].map((bank) => ({ label: bank, value: bank }))} value={values.bank || undefined} onChange={(value) => update("bank", value)} />
                ) : null}
                <Alert type="success" showIcon message="Secure Payment" description="Your checkout is protected with encrypted verification." />
                <Button type="primary" size="large" disabled={!canPay} onClick={() => setProcessing(true)}>
                  Pay {plan.price}
                </Button>
              </Space>
            </SectionCard>
          </Col>
        </Row>
      )}
    </div>
  );
}

export function PaymentSuccessPage() {
  const { activatePlan } = useAppState();
  const { navigate } = usePortalNavigation();
  const [params] = useSearchParams();
  const planId = params.get("planId");
  const returnTo = params.get("returnTo");
  const transactionId = params.get("transactionId");
  const plan = subscriptions.find((item) => item.id === planId) || subscriptions[0];

  useEffect(() => {
    activatePlan(plan.id);
  }, [activatePlan, plan.id]);

  return (
    <div className="p-4 md:p-8">
      <Result
        status="success"
        title="Payment Successful!"
        subTitle={`Your subscription is now active and ready to use. Transaction ID: ${transactionId || "TXN00000000"}`}
        extra={[
          <Button key="continue" type="primary" onClick={() => navigate(returnTo || "/app/dashboard")}>
            Continue
          </Button>,
        ]}
      />
      <div className="mx-auto max-w-xl">
        <SectionCard title="Subscription Details">
          <List
            dataSource={[
              ["Plan", plan.name],
              ["Amount", plan.price],
              ["Validity", "1 Year"],
            ]}
            renderItem={([label, value]) => (
              <List.Item>
                <span className="text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </List.Item>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const { navigate } = usePortalNavigation();

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <Card className={`!h-full !border-[#eedad4] ${item.unread ? "!bg-[#fff8f4]" : ""}`}>
              <Space direction="vertical" size="small">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-black text-ink">{item.title}</div>
                  {item.unread ? <BellOutlined className="text-brand" /> : null}
                </div>
                <Text>{item.message}</Text>
                <Text className="!text-brand">{item.time}</Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export function ScholarshipPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate } = usePortalNavigation();
  const [activeStatus, setActiveStatus] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const unlocked = isUnlocked("scholarship");
  const filtered = scholarships.filter((item) => activeStatus === "All" || item.status === activeStatus);

  if (selectedItem) {
    const detailUnlocked = unlocked || canAccessFreeDetail("scholarship", selectedItem.name);
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelectedItem(null)} />
        {!unlocked && !detailUnlocked ? <PremiumGate title="Unlock Scholarships" description="Subscribe to more scholarship details, requirements, and application links." returnTo="/app/scholarships" /> : null}
        <SectionCard title="Overview">
          <Space direction="vertical">
            <SoftTag color={selectedItem.status === "Active" ? "green" : "default"}>{selectedItem.status}</SoftTag>
            <Text>{selectedItem.description}</Text>
            <Text>Amount: {selectedItem.amount}</Text>
            <Text>Deadline: {selectedItem.deadline}</Text>
            <Text>Eligibility: {selectedItem.eligibility}</Text>
          </Space>
        </SectionCard>
        <SectionCard title="Requirements">
          <List dataSource={selectedItem.requirements} renderItem={(item) => <List.Item>{item}</List.Item>} />
        </SectionCard>
        <Button type="primary" href={selectedItem.link} target="_blank">
          Apply Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Tabs activeKey={activeStatus} onChange={setActiveStatus} items={["All", "Active", "Expired"].map((key) => ({ key, label: key }))} />
      <List
        grid={{ gutter: 16, xs: 1, lg: 2 }}
        dataSource={unlocked ? filtered : filtered.slice(0, 6)}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="!h-full !border-[#eedad4]"
              onClick={() => {
                if (!unlocked && !canAccessFreeDetail("scholarship", item.name)) {
                  return;
                }
                registerFreeDetailAccess("scholarship", item.name);
                setSelectedItem(item);
              }}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-ink">{item.name}</div>
                    <div className="text-sm text-muted">{item.provider}</div>
                  </div>
                  <SoftTag color={item.status === "Active" ? "green" : "default"}>{item.status}</SoftTag>
                </div>
                <Text>{item.eligibility}</Text>
                <div className="flex items-center justify-between">
                  <span className="font-black text-success">{item.amount}</span>
                  <span className="text-sm text-muted">{item.deadline}</span>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
      {!unlocked ? <PremiumGate title="Unlock Scholarships" description="Subscribe to more scholarship details, requirements, and application links." returnTo="/app/scholarships" /> : null}
    </div>
  );
}

export function InstitutePage() {
  const { navigate } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  if (selected) {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelected(null)} />
        <SectionCard title="About"><Text>{selected.about}</Text></SectionCard>
        <SectionCard title="Courses Offered"><Space wrap>{selected.courses.map((course) => <SoftTag key={course} color="blue">{course}</SoftTag>)}</Space></SectionCard>
        <Button type="primary" href={selected.website} target="_blank">Visit Official Website</Button>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={institutes}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable className="!h-full !border-[#eedad4]" onClick={() => setSelected(item)}>
              <div className="space-y-3">
                <div className="text-lg font-black text-ink">{item.name}</div>
                <Text>{item.location}</Text>
                <Space wrap>
                  <SoftTag color="blue">{item.type}</SoftTag>
                  <SoftTag color="red">{item.rank}</SoftTag>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export function EntranceExamPage() {
  const { navigate } = usePortalNavigation();
  const [selected, setSelected] = useState(null);
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const filtered = entranceExams.filter((item) => (typeFilter === "All" || item.type === typeFilter) && (catFilter === "All" || item.category === catFilter));

  if (selected) {
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setSelected(null)} />
        <SectionCard title="Exam Snapshot">
          <List
            dataSource={[
              ["Authority", selected.authority],
              ["Date", selected.date],
              ["Eligibility", selected.eligibility],
              ["Mode", selected.mode],
              ["Duration", selected.duration],
              ["Subjects", selected.subjects],
              ["Total Marks", selected.totalMarks],
            ]}
            renderItem={([label, value]) => (
              <List.Item>
                <span className="text-muted">{label}</span>
                <span className="font-bold text-ink">{value}</span>
              </List.Item>
            )}
          />
        </SectionCard>
        <SectionCard title="Exam Pattern"><List dataSource={selected.examPattern} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        <SectionCard title="Top Colleges"><List dataSource={selected.topColleges} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        <Button type="primary" href={selected.website} target="_blank">Official Website</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}><Select value={typeFilter} onChange={setTypeFilter} style={{ width: "100%" }} options={["All", "Central", "State", "Private"].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={12}><Select value={catFilter} onChange={setCatFilter} style={{ width: "100%" }} options={["All", "Engineering", "Medical", "Business", "Law", "Design", "General"].map((item) => ({ label: item, value: item }))} /></Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item>
            <Card hoverable className="!h-full !border-[#eedad4]" onClick={() => setSelected(item)}>
              <Space direction="vertical">
                <div className="text-lg font-black text-ink">{item.name}</div>
                <Text>{item.authority}</Text>
                <Text>{item.date}</Text>
                <Space wrap>
                  <SoftTag color="blue">{item.type}</SoftTag>
                  <SoftTag color="green">{item.category}</SoftTag>
                </Space>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export function LearnPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate } = usePortalNavigation();
  const unlocked = isUnlocked("master-class");
  const [videoType, setVideoType] = useState("All");
  const [career, setCareer] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const filtered = [...masterClasses]
    .filter((item) => videoType === "All" || item.videoType === videoType)
    .filter((item) => career === "All" || item.career === career)
    .sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      if (sortBy === "za") return b.title.localeCompare(a.title);
      return b.views - a.views;
    });

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}><Select value={videoType} onChange={setVideoType} style={{ width: "100%" }} options={["All", "Expert Videos", "Career Videos"].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={8}><Select value={career} onChange={setCareer} style={{ width: "100%" }} options={["All", ...Array.from(new Set(masterClasses.map((item) => item.career)))].map((item) => ({ label: item, value: item }))} /></Col>
        <Col xs={24} md={8}><Select value={sortBy} onChange={setSortBy} style={{ width: "100%" }} options={[{ label: "Most Popular", value: "popular" }, { label: "A-Z", value: "az" }, { label: "Z-A", value: "za" }]} /></Col>
      </Row>
      <List
        grid={{ gutter: 16, xs: 1, lg: 2 }}
        dataSource={filtered}
        renderItem={(item) => {
          const detailUnlocked = !item.locked || unlocked || canAccessFreeDetail("master-class", item.title);
          return (
            <List.Item>
              <Card className="!h-full !border-[#eedad4]">
                <Space direction="vertical" size="middle" className="!w-full">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-black text-ink">{item.title}</div>
                      <div className="mt-1 text-sm text-muted">{item.mentor}</div>
                    </div>
                    {item.locked && !unlocked ? <LockOutlined className="text-brand" /> : <PlayCircleOutlined className="text-brand" />}
                  </div>
                  <Space wrap>
                    <SoftTag color="red">{item.career}</SoftTag>
                    <SoftTag color="blue">{item.duration}</SoftTag>
                    <SoftTag color="gold">{(item.views / 1000).toFixed(1)}k views</SoftTag>
                  </Space>
                  {!unlocked && item.locked && !detailUnlocked ? <Text>Your free master class preview has already been used.</Text> : null}
                  <Button
                    type="primary"
                    ghost={item.locked && !unlocked}
                    onClick={() => {
                      if (item.locked && !unlocked && !detailUnlocked) return;
                      if (item.locked) registerFreeDetailAccess("master-class", item.title);
                      window.open(item.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {item.locked && !unlocked ? (detailUnlocked ? "Watch 1 Free Class" : "Unlock More Classes") : "Watch Video"}
                  </Button>
                </Space>
              </Card>
            </List.Item>
          );
        }}
      />
      {!unlocked ? <PremiumGate title="Unlock Master Class" description="Subscribe to more classes and keep learning without limits." returnTo="/app/learn" /> : null}
    </div>
  );
}

export function BookMentorPage() {
  const { addBooking, canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate } = usePortalNavigation();
  const unlocked = isUnlocked("book-mentor");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [booked, setBooked] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [paymentValues, setPaymentValues] = useState({ upiId: "", cardName: "", cardNumber: "", cardExpiry: "", cardCvv: "", bank: "" });

  const canPay =
    paymentMethod === "upi"
      ? paymentValues.upiId.includes("@")
      : paymentMethod === "card"
        ? paymentValues.cardName && paymentValues.cardNumber.length === 16 && paymentValues.cardCvv.length >= 3
        : Boolean(paymentValues.bank);

  if (booked && selectedMentor) {
    return (
      <Result
        status="success"
        title="Session booked successfully"
        subTitle={`Payment successful. Your session with ${selectedMentor.name} is confirmed for ${selectedDate?.format("YYYY-MM-DD")} at ${selectedSlot}.`}
        extra={<Button type="primary" onClick={() => { setBooked(false); setSelectedMentor(null); setSelectedDate(null); setSelectedSlot(""); }}>Back to Mentor List</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={mentors}
        renderItem={(mentor) => (
          <List.Item>
            <Card
              hoverable
              className="!h-full !border-[#eedad4]"
              onClick={() => {
                if (!unlocked && !canAccessFreeDetail("book-mentor", mentor.name)) return;
                registerFreeDetailAccess("book-mentor", mentor.name);
                setSelectedMentor(mentor);
              }}
            >
              <Space direction="vertical" size="middle" className="!w-full">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-black text-ink">{mentor.name}</div>
                    <div className="text-sm text-brand">{mentor.specialty}</div>
                  </div>
                  <div className="text-sm font-black text-brand">{mentor.price}</div>
                </div>
                <Text>{mentor.bio}</Text>
                <Space wrap>
                  {mentor.tags.map((tag) => <SoftTag key={tag} color="blue">{tag}</SoftTag>)}
                </Space>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      {!unlocked ? <PremiumGate title="Unlock Mentor Access" description="Subscribe to more mentor profiles and booking access." returnTo="/app/book-mentor" /> : null}

      <Modal open={Boolean(selectedMentor)} footer={null} onCancel={() => setSelectedMentor(null)} width={860}>
        {selectedMentor ? (
          <div className="space-y-6">
            <Title level={3}>{selectedMentor.name}</Title>
            <Paragraph>{selectedMentor.bio}</Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <DatePicker className="!w-full" value={selectedDate} onChange={setSelectedDate} />
              </Col>
              <Col xs={24} md={12}>
                <Select className="!w-full" placeholder="Select time" value={selectedSlot || undefined} onChange={setSelectedSlot} options={["9:00 AM", "10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM", "6:30 PM"].map((slot) => ({ label: slot, value: slot }))} />
              </Col>
            </Row>
            <Button type="primary" disabled={!selectedDate || !selectedSlot} onClick={() => setPaymentOpen(true)}>
              Book & Pay
            </Button>
            <Modal open={paymentOpen} footer={null} onCancel={() => setPaymentOpen(false)} title="Payment">
              <Space direction="vertical" size="large" className="!w-full">
                <Card>
                  <Text>Mentor: {selectedMentor.name}</Text>
                  <br />
                  <Text>Date: {selectedDate?.format("YYYY-MM-DD")}</Text>
                  <br />
                  <Text>Time: {selectedSlot}</Text>
                  <br />
                  <Text>Price: {selectedMentor.price}</Text>
                </Card>
                <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  <Space direction="vertical">
                    <Radio value="upi">UPI</Radio>
                    <Radio value="card">Credit / Debit Card</Radio>
                    <Radio value="netbanking">Net Banking</Radio>
                  </Space>
                </Radio.Group>
                {paymentMethod === "upi" ? <Input placeholder="yourname@upi" value={paymentValues.upiId} onChange={(event) => setPaymentValues((current) => ({ ...current, upiId: event.target.value }))} /> : null}
                {paymentMethod === "card" ? (
                  <Space direction="vertical" className="!w-full">
                    <Input placeholder="Name on card" value={paymentValues.cardName} onChange={(event) => setPaymentValues((current) => ({ ...current, cardName: event.target.value }))} />
                    <Input placeholder="1234567890123456" value={paymentValues.cardNumber} onChange={(event) => setPaymentValues((current) => ({ ...current, cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16) }))} />
                    <Input placeholder="MM/YY" value={paymentValues.cardExpiry} onChange={(event) => setPaymentValues((current) => ({ ...current, cardExpiry: event.target.value }))} />
                    <Input placeholder="CVV" value={paymentValues.cardCvv} onChange={(event) => setPaymentValues((current) => ({ ...current, cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                  </Space>
                ) : null}
                {paymentMethod === "netbanking" ? <Select placeholder="Select Bank" options={["SBI", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => ({ label: bank, value: bank }))} onChange={(value) => setPaymentValues((current) => ({ ...current, bank: value }))} /> : null}
                <Button
                  type="primary"
                  disabled={!canPay}
                  onClick={() => {
                    addBooking({
                      id: `booking-${selectedMentor.name}-${selectedDate?.format("YYYY-MM-DD")}-${selectedSlot}`,
                      mentorName: selectedMentor.name,
                      date: selectedDate?.format("YYYY-MM-DD"),
                      time: selectedSlot,
                      status: "Confirmed",
                    });
                    setPaymentOpen(false);
                    setBooked(true);
                  }}
                >
                  Pay {selectedMentor.price} & Confirm
                </Button>
              </Space>
            </Modal>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function AbroadPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess } = useAppState();
  const { navigate } = usePortalNavigation();
  const unlocked = isUnlocked("abroad-consultancy");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({ preferredCountry: "", courseInterest: "", budgetRange: "", preferredIntake: "" });

  if (submitted) {
    return <Result status="success" title="Our team will contact you shortly" subTitle="Your study abroad consultation request has been recorded." extra={<Button type="primary" onClick={() => { setSubmitted(false); setFormOpen(false); }}>Done</Button>} />;
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <List
        grid={{ gutter: 16, xs: 1, md: 2 }}
        dataSource={studyAbroadCountries}
        renderItem={(country) => (
          <List.Item>
            <Card
              hoverable
              className="!h-full !border-[#eedad4]"
              onClick={() => {
                if (!unlocked && !canAccessFreeDetail("abroad-consultancy", country.name)) return;
                registerFreeDetailAccess("abroad-consultancy", country.name);
                setSelectedCountry(country);
              }}
            >
              <Space direction="vertical">
                <div className="text-lg font-black text-ink">{country.name}</div>
                <Text>{country.description}</Text>
                <Text className="!text-brand">{country.tuition}</Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      {!unlocked ? <PremiumGate title="Unlock Study Abroad" description="Subscribe to more country details, scholarships, visa guidance, and counselling access." returnTo="/app/abroad" /> : null}
      <Modal open={Boolean(selectedCountry)} footer={null} onCancel={() => setSelectedCountry(null)} width={900}>
        {selectedCountry ? (
          <div className="space-y-6">
            <Title level={3}>{selectedCountry.name}</Title>
            <Paragraph>{selectedCountry.detail}</Paragraph>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}><Card><Statistic title="Tuition" value={selectedCountry.tuition} /></Card></Col>
              <Col xs={24} md={12}><Card><Statistic title="Living Cost" value={selectedCountry.living} /></Card></Col>
            </Row>
            <SectionCard title="Popular Courses"><Space wrap>{selectedCountry.popularCourses.map((course) => <SoftTag key={course} color="red">{course}</SoftTag>)}</Space></SectionCard>
            <SectionCard title="Top Universities"><List dataSource={selectedCountry.topUniversities} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <SectionCard title="Scholarships"><List dataSource={selectedCountry.scholarships} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <SectionCard title="Requirements"><List dataSource={selectedCountry.requirements} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
            <Button type="primary" onClick={() => { setValues((current) => ({ ...current, preferredCountry: selectedCountry.name })); setFormOpen(true); }}>
              Consult Now
            </Button>
          </div>
        ) : null}
      </Modal>
      <Modal open={formOpen} footer={null} onCancel={() => setFormOpen(false)} title="Consultation Form">
        <Form layout="vertical" onFinish={() => (unlocked ? setSubmitted(true) : null)}>
          <Form.Item label="Preferred Country"><Input value={values.preferredCountry} onChange={(event) => setValues((current) => ({ ...current, preferredCountry: event.target.value }))} /></Form.Item>
          <Form.Item label="Course Interest"><Input value={values.courseInterest} onChange={(event) => setValues((current) => ({ ...current, courseInterest: event.target.value }))} /></Form.Item>
          <Form.Item label="Budget Range"><Input value={values.budgetRange} onChange={(event) => setValues((current) => ({ ...current, budgetRange: event.target.value }))} /></Form.Item>
          <Form.Item label="Preferred Intake"><Input value={values.preferredIntake} onChange={(event) => setValues((current) => ({ ...current, preferredIntake: event.target.value }))} /></Form.Item>
          <Button type="primary" htmlType="submit">{unlocked ? "Submit Request" : "Subscribe to Submit"}</Button>
        </Form>
      </Modal>
    </div>
  );
}

export function LibraryPage() {
  const { canAccessFreeDetail, isUnlocked, registerFreeDetailAccess, savedCareers, toggleSavedCareer } = useAppState();
  const { navigate } = usePortalNavigation();
  const unlocked = isUnlocked("career-library");
  const [level, setLevel] = useState("streams");
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const detail = careerLibrary.details[selectedDetail] || {
    title: selectedDetail,
    overview: `${selectedDetail} is a specialized field offering excellent career prospects.`,
    path: ["Step 1", "Step 2", "Step 3", "Career Position"],
    education: "Relevant degrees required",
    exams: ["Relevant Entrance Exams"],
    jobs: ["Career Options"],
    salary: "Rs 3-20 LPA",
    institutes: ["Leading Institutes"],
  };

  const isSaved = detail.title && savedCareers.includes(detail.title);
  const detailUnlocked = !selectedDetail || unlocked || canAccessFreeDetail("career-library", selectedDetail);

  function back() {
    if (level === "details") {
      setLevel("programs");
      setSelectedDetail(null);
    } else if (level === "programs") {
      setLevel("categories");
      setSelectedProgram(null);
    } else if (level === "categories") {
      setLevel("streams");
      setSelectedCategory(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={level !== "streams" ? back : () => navigate(-1)} />
      {level === "streams" ? (
        <Row gutter={[16, 16]}>
          {careerLibrary.streams.map((stream) => (
            <Col xs={24} md={12} lg={8} key={stream.name}>
              <Card hoverable className="!border-[#eedad4]" onClick={() => { setSelectedStream(stream.name); setLevel("categories"); }}>
                <div className="space-y-2">
                  <div className="text-xl font-black text-ink">{stream.name}</div>
                  <Text>{stream.desc}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
      {level === "categories" ? (
        <Row gutter={[16, 16]}>
          {(careerLibrary.categories[selectedStream] || []).map((category) => (
            <Col xs={24} md={12} key={category}>
              <Card hoverable className="!border-[#eedad4]" onClick={() => { setSelectedCategory(category); setLevel("programs"); }}>
                <div className="text-lg font-black text-ink">{category}</div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : null}
      {level === "programs" ? (
        <List
          dataSource={careerLibrary.specializations[selectedProgram] || careerLibrary.programs[selectedCategory] || []}
          renderItem={(item) => {
            const unlockedItem = unlocked || canAccessFreeDetail("career-library", item);
            return (
              <List.Item>
                <Card
                  hoverable
                  className="!w-full !border-[#eedad4]"
                  onClick={() => {
                    if (!unlocked && !unlockedItem) return;
                    registerFreeDetailAccess("career-library", item);
                    setSelectedProgram(item);
                    setSelectedDetail(item);
                    setLevel("details");
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-lg font-black text-ink">{item}</div>
                    {!unlocked ? <SoftTag color={unlockedItem ? "green" : "default"}>{unlockedItem ? "FREE" : "LOCK"}</SoftTag> : null}
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      ) : null}
      {level === "details" ? (
        <div className="space-y-6">
          {!detailUnlocked ? <PremiumGate title="Unlock Career Library" description="Subscribe to more careers, salary insights, education paths, and institute details." returnTo="/app/library" /> : null}
          <SectionCard title={detail.title} extra={<Button onClick={() => toggleSavedCareer(detail.title)}>{isSaved ? "Saved to Wishlist" : "Save to Wishlist"}</Button>}>
            <Paragraph>{detail.overview}</Paragraph>
          </SectionCard>
          <SectionCard title="Career Path"><Timeline items={detail.path.map((item) => ({ children: item }))} /></SectionCard>
          <SectionCard title="Education"><Text>{detail.education}</Text></SectionCard>
          <SectionCard title="Entrance Exams"><List dataSource={detail.exams} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
          <SectionCard title="Job Opportunities"><List dataSource={detail.jobs} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
          <SectionCard title="Salary Range"><Statistic value={detail.salary} /></SectionCard>
          <SectionCard title="Top Institutes"><List dataSource={detail.institutes} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        </div>
      ) : null}
    </div>
  );
}

export function QuizPage() {
  const { navigate } = usePortalNavigation();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(sampleQuizQuestions.length).fill(null));
  const [completed, setCompleted] = useState(false);
  const score = answers.filter((answer, index) => answer === sampleQuizQuestions[index].correct).length;

  if (completed) {
    return <Result status="success" title="Quiz Complete" subTitle={`You scored ${score}/5`} extra={<Button type="primary" onClick={() => { setActiveQuiz(null); setCurrent(0); setAnswers(Array(sampleQuizQuestions.length).fill(null)); setCompleted(false); }}>Try Another Quiz</Button>} />;
  }

  if (activeQuiz !== null) {
    const question = sampleQuizQuestions[current];
    return (
      <div className="space-y-6">
        <PageHero backOnly onBack={() => setActiveQuiz(null)} />
        <SectionCard title={question.q}>
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <Button
                key={option}
                block
                type={answers[current] === index ? "primary" : "default"}
                className="!h-auto !rounded-2xl !py-4 !text-left"
                onClick={() => {
                  const next = [...answers];
                  next[current] = index;
                  setAnswers(next);
                }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </Button>
            ))}
          </div>
        </SectionCard>
        <Button type="primary" disabled={answers[current] === null} onClick={() => (current === sampleQuizQuestions.length - 1 ? setCompleted(true) : setCurrent((value) => value + 1))}>
          {current === sampleQuizQuestions.length - 1 ? "Finish Quiz" : "Next"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        {quizCatalog.map((quiz, index) => (
          <Col xs={24} md={12} key={quiz.title}>
            <Card hoverable className="!h-full !border-[#eedad4]" onClick={() => setActiveQuiz(index)}>
              <Space direction="vertical">
                <div className="text-lg font-black text-ink">{quiz.title}</div>
                <Text>{quiz.description}</Text>
                <Text className="!text-brand">{quiz.questions} questions</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export function ProfilePage() {
  const { activePlanId, bookings, hasActiveSubscription, onboarding, profileEditRequestKey, requestProfileEdit, savedCareers, saveUserProfile, subscriptionRecords, testHistory, toggleDarkMode, userProfile } = useAppState();
  const { navigate } = usePortalNavigation();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(userProfile);

  useEffect(() => setForm(userProfile), [userProfile]);
  useEffect(() => {
    if (profileEditRequestKey > 0) setEditOpen(true);
  }, [profileEditRequestKey]);

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <SectionCard title="Saved Careers"><List dataSource={savedCareers} renderItem={(item) => <List.Item>{item}</List.Item>} /></SectionCard>
        </Col>
        <Col xs={24} xl={8}>
          <SectionCard title="Test History"><List dataSource={testHistory} renderItem={(item) => <List.Item>{item.title} • {item.subtitle}</List.Item>} /></SectionCard>
        </Col>
        <Col xs={24} xl={8}>
          <SectionCard title="Mentor Bookings"><List dataSource={bookings} renderItem={(item) => <List.Item>{item.mentorName} • {item.date} • {item.time}</List.Item>} /></SectionCard>
        </Col>
      </Row>
      <SectionCard title="Subscription">
        {hasActiveSubscription ? <List dataSource={subscriptionRecords} renderItem={(item) => <List.Item>{item.planName} • {item.price} • {item.expiryDate}</List.Item>} /> : <Text>No active plan</Text>}
      </SectionCard>
      <div className="flex flex-wrap gap-3">
        <Button type="primary" onClick={() => setEditOpen(true)}>Edit Profile</Button>
        <Button onClick={() => navigate("/app/settings")}>Open Settings</Button>
      </div>
      <Modal open={editOpen} footer={null} onCancel={() => setEditOpen(false)} title="Edit Profile">
        <Form
          layout="vertical"
          onFinish={() => {
            saveUserProfile(form);
            setEditOpen(false);
          }}
        >
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
            <Form.Item label={label} key={key}>
              <Input value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} />
            </Form.Item>
          ))}
          <Button type="primary" htmlType="submit">Save Changes</Button>
        </Form>
      </Modal>
      <Text>Current plan: {hasActiveSubscription ? activePlanId : "No active plan"}</Text>
    </div>
  );
}

export function SettingsPage() {
  const { logout, preferences, requestProfileEdit, toggleDarkMode } = useAppState();
  const { navigate } = usePortalNavigation();
  const [view, setView] = useState("menu");
  const [feedback, setFeedback] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [helpForm, setHelpForm] = useState({ email: "", message: "" });

  if (view === "password") {
    return (
      <SectionCard title="Change Password" extra={<Button onClick={() => setView("menu")}>Back</Button>}>
        <Form layout="vertical">
          <Form.Item label="Current Password"><Input.Password value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} /></Form.Item>
          <Form.Item label="New Password"><Input.Password value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} /></Form.Item>
          <Form.Item label="Confirm Password"><Input.Password value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} /></Form.Item>
          <Button type="primary" onClick={() => setFeedback("Password changed successfully.")}>Save Password</Button>
          {feedback ? <Alert className="mt-4" type="success" message={feedback} /> : null}
        </Form>
      </SectionCard>
    );
  }

  if (view === "help") {
    return (
      <SectionCard title="Help Centre" extra={<Button onClick={() => setView("menu")}>Back</Button>}>
        <Form layout="vertical">
          <Form.Item label="Your Email"><Input value={helpForm.email} onChange={(event) => setHelpForm((current) => ({ ...current, email: event.target.value }))} /></Form.Item>
          <Form.Item label="Message"><Input.TextArea rows={6} value={helpForm.message} onChange={(event) => setHelpForm((current) => ({ ...current, message: event.target.value }))} /></Form.Item>
          <Button type="primary" onClick={() => setFeedback("Help request sent successfully.")}>Send to Email Support</Button>
          {feedback ? <Alert className="mt-4" type="success" message={feedback} /> : null}
        </Form>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      {feedback ? <Alert type="success" message={feedback} /> : null}
      <Collapse
        items={[
          { key: "profile", label: "Edit Profile", children: <Button onClick={() => { requestProfileEdit(); navigate("/app/profile"); }}>Open profile editor</Button> },
          { key: "password", label: "Change Password", children: <Button onClick={() => setView("password")}>Open password form</Button> },
          { key: "theme", label: preferences.darkMode ? "Light Mode" : "Dark Mode", children: <Button onClick={toggleDarkMode}>Toggle Theme</Button> },
          { key: "help", label: "Help Centre", children: <Button onClick={() => setView("help")}>Open help centre</Button> },
        ]}
      />
      <Button danger onClick={() => { logout(); navigate("/auth-entry"); }}>
        Logout
      </Button>
    </div>
  );
}

export function AboutPage() {
  const { navigate } = usePortalNavigation();

  return (
    <div className="space-y-6">
      <PageHero backOnly onBack={() => navigate(-1)} />
      <SectionCard title="What's included">
        <Paragraph>
          This portal now reflects the mobile app's information architecture: dashboard-first navigation, career discovery, student profile details, notifications, subscriptions, settings, psychometric flows, mentor booking, scholarships, institutes, entrance exams, study abroad, and quizzes.
        </Paragraph>
        <Paragraph>
          The experience is adapted as a professional responsive website for desktop and tablet while keeping the same client-side flows, sample data, and premium gating logic from the mobile app.
        </Paragraph>
      </SectionCard>
    </div>
  );
}
