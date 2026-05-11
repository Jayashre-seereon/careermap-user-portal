import { useState } from "react";
import { Button, Card, Col, Result, Row, Space } from "antd";
import { quizCatalog, sampleQuizQuestions } from "../../../data/careermapData";
import { PageHero, Text, SectionCard } from "../../../components/ui";
import { usePortalNavigation } from "../../portal/components/portalPageShared";

export default function QuizPage() {
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
