import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ParticlesCanvas } from "../components/common/ParticlesCanvas";

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040d0c] relative flex items-center justify-center p-4 overflow-hidden">
      <ParticlesCanvas />
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl bg-[#071d18]/90 backdrop-blur-2xl border border-emerald-500/30 p-8 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.18)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Leaf className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">GreenMetriX</h2>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                Enterprise Registration
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
          <p className="text-xs text-slate-300 mb-6">
            Join the smart manufacturing decarbonization network.
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="Rajnish Sharma"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="rajnish@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="••••••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white focus:outline-none focus:border-emerald-400"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? "Creating Account..." : "Register Facility Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-emerald-500/15 text-center text-xs text-slate-400">
            <span>Already have an account? </span>
            <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
