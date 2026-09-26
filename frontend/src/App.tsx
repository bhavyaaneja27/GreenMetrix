// App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

// Application Pages
import { Dashboard } from './pages/Dashboard';
import { CityMap } from './pages/CityMap';
import { Factories } from './pages/Factories';
import { FactoryDetails } from './pages/FactoryDetails';
import { EnergyAnalytics } from './pages/EnergyAnalytics';
import { CO2Analytics } from './pages/CO2Analytics';
import { Anomalies } from './pages/Anomalies';
import { DigitalTwin } from './pages/DigitalTwin';
import { AICopilot } from './pages/AICopilot';
import { ActionPlanner } from './pages/ActionPlanner';
import { SustainabilityScore } from './pages/SustainabilityScore';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<CityMap />} />
              <Route path="/factories" element={<Factories />} />
              <Route path="/factories/:id" element={<FactoryDetails />} />
              <Route path="/energy-analytics" element={<EnergyAnalytics />} />
              <Route path="/co2-analytics" element={<CO2Analytics />} />
              <Route path="/anomalies" element={<Anomalies />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/copilot" element={<AICopilot />} />
              <Route path="/action-planner" element={<ActionPlanner />} />
              <Route path="/score" element={<SustainabilityScore />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
