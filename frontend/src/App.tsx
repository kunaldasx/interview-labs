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
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

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
const CandidatePipelinePage = lazy(() => import('./pages/candidates/CandidatePipelinePage'));

// Interviews
const InterviewListPage = lazy(() => import('./pages/interviews/InterviewListPage'));
const InterviewRoomPage = lazy(() => import('./pages/interviews/InterviewRoomPage'));
const InterviewSchedulePage = lazy(() => import('./pages/interviews/InterviewSchedulePage'));
const InterviewDetailPage = lazy(() => import('./pages/interviews/InterviewDetailPage'));

// Evaluations
const EvaluationDetailPage = lazy(() => import('./pages/evaluations/EvaluationDetailPage'));

// Offer Letters
const OfferLettersPage = lazy(() => import('./pages/offer-letters/OfferLettersPage'));
const OfferLetterFormPage = lazy(() => import('./pages/offer-letters/OfferLetterFormPage'));
const OfferLetterDetailPage = lazy(() => import('./pages/offer-letters/OfferLetterDetailPage'));

// Reports
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));

// Users
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'));

// Settings
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const DomainManagementPage = lazy(() => import('./pages/settings/DomainManagementPage'));
const NotificationsPage = lazy(() => import('./pages/settings/NotificationsPage'));

// Pricing (public)
const PricingPage = lazy(() => import('./pages/pricing/PricingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/checkout/CheckoutSuccessPage'));

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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

          {/* Protected routes with AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager', 'interviewer']}>
                <DashboardPage />
              </ProtectedRoute>
            } />

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
            <Route
              path="/candidates/register"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <CandidateRegistrationPage />
                </ProtectedRoute>
              }
            />
            <Route path="/candidates" element={<CandidateListPage />} />
            <Route
              path="/candidates/pipeline"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <CandidatePipelinePage />
                </ProtectedRoute>
              }
            />
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
            <Route path="/interviews/:id" element={<InterviewDetailPage />} />
            <Route path="/interviews/:id/room" element={<InterviewRoomPage />} />

            {/* Users */}
            <Route path="/users" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                <UserManagementPage />
              </ProtectedRoute>
            } />

            {/* Evaluations */}
            <Route path="/evaluations/:id" element={<EvaluationDetailPage />} />

            {/* Offer Letters */}
            <Route path="/offer-letters" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                <OfferLettersPage />
              </ProtectedRoute>
            } />
            <Route path="/offer-letters/new" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                <OfferLetterFormPage />
              </ProtectedRoute>
            } />
            <Route path="/offer-letters/:id" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                <OfferLetterDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/offer-letters/:id/edit" element={
              <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                <OfferLetterFormPage />
              </ProtectedRoute>
            } />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['super_admin', 'hr_manager']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />

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
