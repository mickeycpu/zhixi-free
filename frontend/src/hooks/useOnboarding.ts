import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem('onboarding_done');
    if (!done) {
      setShowOnboarding(true);
    }
  }, []);

  const finish = () => {
    localStorage.setItem('onboarding_done', '1');
    setShowOnboarding(false);
  };

  const next = () => setCurrentStep((s) => s + 1);

  return { showOnboarding, currentStep, next, finish, setCurrentStep };
}
