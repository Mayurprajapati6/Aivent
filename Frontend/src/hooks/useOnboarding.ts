import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

const ATTENDEE_PAGES = ["/explore", "/events", "/my-tickets"];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    if (!user.hasCompletedOnboarding) {
      const requiresOnboarding = ATTENDEE_PAGES.some((page) =>
        location.pathname.startsWith(page)
      );

      if (requiresOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, location, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    window.location.reload();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    navigate("/");
  };

  return {
    showOnboarding,
    setShowOnboarding,
    handleOnboardingComplete,
    handleOnboardingSkip,
    needsOnboarding: user && !user.hasCompletedOnboarding,
  };
}

