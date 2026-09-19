import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ParticlesCanvas } from "../components/common/ParticlesCanvas";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("demo@greenmetrix.ai");
  const [password, setPassword] = useState("greenmetrix2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to initiate demo session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040d0c] relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Cursor Reactive Particles Background */}
      <ParticlesCanvas />

      {/* Ambient Atmospheric Emerald Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-700/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Login Card Matching Reference Image 3 */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-[#071d18]/90 backdrop-blur-2xl border border-emerald-500/30 p-8 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.18)] relative overflow-hidden group">
          {/* Subtle top edge glowing accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

          {/* Logo Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Leaf className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
                GreenMetriX
              </h2>
              <p className="text-[10px] text-emerald-400/90 font-semibold tracking-wider uppercase">
                AI-Powered Carbon Intelligence
              </p>
            </div>
          </div>

          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-400 mb-4 tracking-wide">
            <Leaf className="w-3.5 h-3.5 text-emerald-400 inline" />
            <span>SUSTAINABILITY INTELLIGENCE</span>
          </div>

          {/* Main Headings */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 leading-tight">
            Measure. Optimize.<br />
            <span className="text-emerald-400">Decarbonize.</span>
          </h1>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Turn production data into actionable carbon intelligence with AI-powered prediction and scenario analysis.
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all font-mono"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400/90 hover:text-emerald-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all pr-10 font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#04110e] border-emerald-500/40 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* Primary Submit Button Matching Reference Image 3 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? "Authenticating..." : "Enter GreenMetriX"}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Demo Notice Matching Reference Image 3 */}
          <div className="mt-5 text-center">
            <p className="text-[11px] text-emerald-400/80 font-medium">
              Demo credentials are pre-filled for your project presentation.
            </p>
            <button
              onClick={handleDemoClick}
              type="button"
              className="mt-2 text-xs text-emerald-300 underline underline-offset-2 hover:text-emerald-200 font-semibold"
            >
              Instant 1-Click Demo Login
            </button>
          </div>

          {/* Signup Footer */}
          <div className="mt-6 pt-5 border-t border-emerald-500/15 text-center text-xs text-slate-400">
            <span>Don't have an enterprise account? </span>
            <Link to="/signup" className="text-emerald-400 font-semibold hover:underline">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
