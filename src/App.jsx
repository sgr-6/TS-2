import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import ReportsPage from './pages/ReportsPage';
import InsightsPage from './pages/InsightsPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import FirstTimeSetupPage from './pages/FirstTimeSetupPage';
import SeederPage from './pages/SeederPage';

function PrivateRoute({ children }) {
  const { user, userProfile, isAdmin, isHOD } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (userProfile && !userProfile.firstTimeSetupComplete && !isAdmin && !isHOD) {
    return <FirstTimeSetupPage />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const { user, isAdmin, isHOD } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            {(isAdmin || isHOD) ? (
              <AdminPage />
            ) : (
              <Layout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/students" element={<StudentsPage />} />
                  <Route path="/attendance" element={<AttendancePage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/insights" element={<InsightsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* SEEDER (Hidden Admin Route) */}
          <Route path="/seed-section-c" element={<SeederPage />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            )}
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
