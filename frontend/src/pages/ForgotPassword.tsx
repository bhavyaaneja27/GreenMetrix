import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, ArrowLeft, CheckCircle } from "lucide-react";
import { ParticlesCanvas } from "../components/common/ParticlesCanvas";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
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
                Password Recovery
              </p>
            </div>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Reset link dispatched</h3>
              <p className="text-xs text-slate-300 mb-6">
                If an account exists for {email}, a recovery link with secure token has been sent.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password</h1>
              <p className="text-xs text-slate-300 mb-6">
                Enter your authorized email to receive a password reset token.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#04110e]/90 border border-emerald-500/30 text-sm text-white focus:outline-none focus:border-emerald-400 font-mono"
                    placeholder="demo@greenmetrix.ai"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:brightness-105 transition-all"
                >
                  Send Recovery Link
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-emerald-500/15 text-center text-xs text-slate-400">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
