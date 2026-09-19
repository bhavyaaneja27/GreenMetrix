import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar/Sidebar";
import { Topbar } from "../topbar/Topbar";
import { CursorTrail } from "../common/CursorTrail";

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#040d0c] flex relative selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Persistent Cursor Spark & Glow Trail */}
      <CursorTrail />

      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
