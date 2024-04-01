import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Public pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Dashboard
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));

// Jobs
const JobListPage = lazy(() => import('./pages/jobs/JobListPage'));
const JobCreatePage = lazy(() => import('./pages/jobs/JobCreatePage'));
const JobDetailPage = lazy(() => import('./pages/jobs/JobDetailPage'));

// Candidates
const CandidateListPage = lazy(() => import('./pages/candidates/CandidateListPage'));
const CandidateRegistrationPage = lazy(() => import('./pages/candidates/CandidateRegistrationPage'));
const CandidateDetailPage = lazy(() => import('./pages/candidates/CandidateDetailPage'));

// Interviews
const InterviewListPage = lazy(() => import('./pages/interviews/InterviewListPage'));
const InterviewRoomPage = lazy(() => import('./pages/interviews/InterviewRoomPage'));
const InterviewSchedulePage = lazy(() => import('./pages/interviews/InterviewSchedulePage'));

// Evaluations
const EvaluationDetailPage = lazy(() => import('./pages/evaluations/EvaluationDetailPage'));

// Reports
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

// Settings
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const DomainManagementPage = lazy(() => import('./pages/settings/DomainManagementPage'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage'));

// Pricing (public)
const PricingPage = lazy(() => import('./pages/pricing/PricingPage'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/candidates/register" element={<CandidateRegistrationPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Protected routes with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Jobs */}
            <Route path="/jobs" element={<JobListPage />} />
            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <JobCreatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/:id" element={<JobDetailPage />} />

            {/* Candidates */}
            <Route path="/candidates" element={<CandidateListPage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />

            {/* Interviews */}
            <Route path="/interviews" element={<InterviewListPage />} />
            <Route
              path="/interviews/schedule"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager', 'interviewer']}>
                  <InterviewSchedulePage />
                </ProtectedRoute>
              }
            />
            <Route path="/interviews/:id" element={<InterviewRoomPage />} />

            {/* Evaluations */}
            <Route path="/evaluations/:id" element={<EvaluationDetailPage />} />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/settings/domains"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <DomainManagementPage />
                </ProtectedRoute>
              }
            />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
