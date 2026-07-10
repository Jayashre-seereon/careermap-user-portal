import React,{useEffect} from "react";

export default function AssessmentPage() {
  useEffect(() => {
    localStorage.setItem(
      "API_BASE_URL",
      import.meta.env.VITE_API_BASE_URL
    );
  }, []);
  return (
    <div className="h-screen w-full bg-white">
      <iframe
       src="/assessment/phycometricfulltest.html"
        title="Psychometric Assessment"
        className="h-full w-full border-0"
      />
    </div>
  );
}