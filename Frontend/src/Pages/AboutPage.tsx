import { Link } from "react-router-dom";
import { Sparkles, Users, Calendar, MapPin, Zap } from "lucide-react";
import heroImage from "../assets/hero.png"; // Optional: any hero image
import Footer from "@/components/layout/Footer";


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-6 sm:px-12 lg:px-24">
        {/* Animated background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute top-1/3 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000 pointer-events-none" />
        <div className="absolute bottom-10 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow delay-2000 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
              Welcome to Aivent
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 font-light">
              Aivent is your one-stop platform for discovering, creating, and managing events effortlessly.
              Whether you are an organizer or an attendee, we make every event experience memorable.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link to="/explore">
                <button className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-300">
                  Explore Events <Sparkles className="inline ml-2 w-5 h-5" />
                </button>
              </Link>
              <Link to="/sign-up">
                <button className="border-2 border-purple-500/50 px-6 py-4 rounded-xl text-purple-300 font-semibold hover:bg-purple-500/10 transition-all duration-300">
                  Sign Up Free
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="lg:w-1/2 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <img
              src={heroImage}
              alt="Aivent App"
              className="relative z-10 w-full max-w-md mx-auto rounded-[50px] shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
            What We Provide
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            Aivent offers a full suite of tools to make events simple, engaging, and successful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 text-center hover:scale-105 transform transition-all duration-300 shadow-lg">
            <Users className="w-10 h-10 mx-auto text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Community Engagement</h3>
            <p className="text-gray-300">
              Connect with attendees, share updates, and build a thriving event community.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 text-center hover:scale-105 transform transition-all duration-300 shadow-lg">
            <Calendar className="w-10 h-10 mx-auto text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Event Scheduling</h3>
            <p className="text-gray-300">
              Create and manage event schedules with ease. Never miss a moment or deadline.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 text-center hover:scale-105 transform transition-all duration-300 shadow-lg">
            <MapPin className="w-10 h-10 mx-auto text-pink-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Location Discovery</h3>
            <p className="text-gray-300">
              Find nearby events or explore what's happening across cities and categories.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 text-center hover:scale-105 transform transition-all duration-300 shadow-lg">
            <Zap className="w-10 h-10 mx-auto text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Ticketing</h3>
            <p className="text-gray-300">
              Manage tickets and registrations efficiently, with QR codes and attendee tracking.
            </p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 text-center hover:scale-105 transform transition-all duration-300 shadow-lg">
            <Sparkles className="w-10 h-10 mx-auto text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Enhanced Experience</h3>
            <p className="text-gray-300">
              Boost event engagement with notifications, analytics, and featured placements.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
