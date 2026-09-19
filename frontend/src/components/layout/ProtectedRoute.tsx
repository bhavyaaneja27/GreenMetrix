import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Leaf } from "lucide-react";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040d0c] flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse">
          <Leaf className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-emerald-400">
          GreenMetriX Decarbonizing...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
