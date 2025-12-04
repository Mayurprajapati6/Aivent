import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "sonner";
import Layout from "./Layouts/Layout";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import OnboardingModal from "./components/OnboardingModal";
import { useOnboarding } from "./hooks/useOnboarding";

// Pages
import LandingPage from "./Pages/LandingPage";
import ExplorePage from "./Pages/ExplorePage";
import EventDetailPage from "./Pages/EventDetailPage";
import CreateEventPage from "./Pages/CreateEventPage";
import MyEventsPage from "./Pages/MyEventPage";
import MyTicketsPage from "./Pages/MyTicketsPage";
import EventDashboardPage from "./Pages/EventDashboardPage";
import SignInPage from "./components/auth/SignIn";
import SignUpPage from "./components/auth/SignUp";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function AppContent() {
  const { showOnboarding, handleOnboardingComplete, handleOnboardingSkip } = useOnboarding();

  return (
    <Layout>
      <Header />
      <main className="relative min-h-screen container mx-auto pt-4">
            {/* Background glow effects */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
            </div>

            {/* Page content */}
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/:slug" element={<ExplorePage />} />
                <Route path="/events/:slug" element={<EventDetailPage />} />
                <Route path="/sign-in" element={<SignInPage />} />
                <Route path="/sign-up" element={<SignUpPage />} />
                
                <Route
                  path="/create-event"
                  element={
                    <ProtectedRoute>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-events"
                  element={
                    <ProtectedRoute>
                      <MyEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-events/:eventId"
                  element={
                    <ProtectedRoute>
                      <EventDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTicketsPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
      </main>
      <Footer />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <AppContent />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
