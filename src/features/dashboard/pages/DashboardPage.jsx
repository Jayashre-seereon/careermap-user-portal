import { useMemo, useState } from "react";
import { personalityQuestions, personalityTypes } from "../../../data/careermapData";
import { useAppState } from "../../../state/AppStateContext";
import { usePortalNavigation } from "../../portal/components/portalPageShared";
import { DashboardHeroSection } from "../../portal/components/DashboardHeroSection";
import { ExploreModulesSection } from "../../portal/components/ExploreModulesSection";
import { PersonalityQuizQuestion, PersonalityQuizResults } from "../../portal/components/PersonalityQuizSections";

export default function DashboardPage() {
  const { isUnlocked, unreadNotificationsCount } = useAppState();
  const { navigate } = usePortalNavigation();
  const [showPersonality, setShowPersonality] = useState(false);
  const [personalityStep, setPersonalityStep] = useState(0);
  const [answers, setAnswers] = useState(Array(personalityQuestions.length).fill(null));
  const [complete, setComplete] = useState(false);

  const personalityResult = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
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

  function handleTestClick() {
    if (isUnlocked("psychometric-test")) {
      navigate("/app/psychometric-test");
      return;
    }

    setShowPersonality(true);
  }

  return (
    <div className="space-y-6">
      <DashboardHeroSection onTestClick={handleTestClick} />
      <ExploreModulesSection unreadNotificationsCount={unreadNotificationsCount} />
    </div>
  );
}
