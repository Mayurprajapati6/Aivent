import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, Star, ArrowRight } from "lucide-react";
import heroImage from "../assets/hero.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section with Animation */}
      <section className="pb-12 sm:pb-16 md:pb-20 relative overflow-hidden pt-4 sm:pt-6 md:pt-8">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 items-center relative z-10 animate-fade-in">
          {/* Left content */}
          <div className="text-center sm:text-left space-y-6">
            <div className="mb-6 animate-fade-in-up">
              <span className="text-purple-400 font-light tracking-wide text-sm uppercase">
                Welcome to Aivent
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-[0.95] tracking-tight animate-fade-in-up delay-100">
              Discover &<br />
              create amazing
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
                events.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 md:mb-12 max-w-lg font-light animate-fade-in-up delay-200">
              Whether you're hosting or attending, Aivent makes every event
              memorable. Join our community today and experience event management like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-300">
              <Link to="/explore" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto cursor-pointer rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/50"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link to="/sign-up" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto cursor-pointer rounded-xl border-2 border-purple-500/50 text-purple-300 font-semibold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg hover:bg-purple-500/10 transition-all duration-300"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Right - Phone Mockup with Animation */}
          <div className="relative block animate-fade-in delay-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <img
              src={heroImage}
              alt="Aivent App"
              width={700}
              height={700}
              className="w-full h-auto relative z-10 transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Choose Your Plan
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Start free and upgrade when you're ready to unlock premium features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Free Plan</h3>
                  <div className="text-3xl">🎉</div>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₹0</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Create up to 3 events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Basic event page</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Basic tickets & QR codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Attendee management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">Email notifications</span>
                  </li>
                  <li className="flex items-start gap-3"></li>
                  <li className="flex items-start gap-3"></li>
                  <li className="flex items-start gap-3"></li>
                  <li className="flex items-start gap-3"></li>
                  <li className="flex items-start gap-3"></li>

                  
                </ul>
                <Link to="/sign-up">
                  <Button className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl transition-all duration-300">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-orange-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-purple-900/50 to-orange-900/50 backdrop-blur-xl border-2 border-purple-500/50 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                  <Badge className="bg-gradient-to-r from-purple-600 to-orange-600 text-white border-0">
                    Popular
                  </Badge>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">₹999</span>
                  <span className="text-gray-300">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Unlimited events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Custom branding & banner</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Custom event link</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Priority listing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Featured placement</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white font-medium">Premium support</span>
                  </li>
                </ul>
                <Button className="w-full cursor-pointer bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/50">
                  Upgrade to Pro
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
