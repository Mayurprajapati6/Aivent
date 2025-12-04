import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    console.log("Login button clicked", { email, password: "***" });
    setLoading(true);

    try {
      console.log("Calling login function...");
      await login(email, password);
      console.log("Login successful, navigating to /explore");
      toast.success("Signed in successfully!");
      
      // Small delay to ensure state updates propagate
      setTimeout(() => {
        console.log("Navigating to /explore");
        navigate("/explore", { replace: true });
      }, 100);
    } 
    catch (error: any) {
      console.error("Login error details:", {
        error,
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      let errorMessage = "Failed to sign in. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      toast.error(errorMessage);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-4 sm:py-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-orange-500/30 rounded-2xl sm:rounded-3xl blur-2xl opacity-75"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-gray-300">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    value={email}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 text-white bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    value={password}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 text-white bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-gray-300">
                  Don't have an account?{' '}
                  <Link 
                    to="/sign-up" 
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

