import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AITutorDrawer } from './components/common/AITutorDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';

// Student Pages
import { StudentLoginPage } from './pages/student/StudentLoginPage';
import { StudentRegisterPage } from './pages/student/StudentRegisterPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { StudentUnitsPage } from './pages/student/StudentUnitsPage';
import { StudentUnitDetailPage } from './pages/student/StudentUnitDetailPage';
import { StudentWeekLearningPage } from './pages/student/StudentWeekLearningPage';
import { StudentLabAreaPage } from './pages/student/StudentLabAreaPage';
import { StudentLabResultsPage } from './pages/student/StudentLabResultsPage';
import { StudentRevisionDashboardPage } from './pages/student/StudentRevisionDashboardPage';
import { StudentLabAnalyticsPage } from './pages/student/StudentLabAnalyticsPage';
import { StudentFinalTestPage } from './pages/student/StudentFinalTestPage';
import { StudentLeaderboardPage } from './pages/student/StudentLeaderboardPage';
import { StudentPublicLabsPage } from './pages/student/StudentPublicLabsPage';
import { StudentHistoricalSemestersPage } from './pages/student/StudentHistoricalSemestersPage';

// Lecturer Pages
import { LecturerLoginPage } from './pages/lecturer/LecturerLoginPage';
import { LecturerRegisterPage } from './pages/lecturer/LecturerRegisterPage';
import { LecturerDashboardPage } from './pages/lecturer/LecturerDashboardPage';
import { LecturerUnitsPage } from './pages/lecturer/LecturerUnitsPage';
import { LecturerWeekManagerPage } from './pages/lecturer/LecturerWeekManagerPage';
import { LecturerAssessmentBuilderPage } from './pages/lecturer/LecturerAssessmentBuilderPage';
import { LecturerAnalyticsPage } from './pages/lecturer/LecturerAnalyticsPage';
import { LecturerRevisionPackPage } from './pages/lecturer/LecturerRevisionPackPage';
import { LecturerFinalExamApprovalsPage } from './pages/lecturer/LecturerFinalExamApprovalsPage';
import { LecturerExamReadinessBuilderPage } from './pages/lecturer/LecturerExamReadinessBuilderPage';

// Admin / Mini SOC Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminSOCDashboardPage } from './pages/admin/AdminSOCDashboardPage';
import { AdminSOCEventsPage } from './pages/admin/AdminSOCEventsPage';
import { AdminSOCAuditTrailPage } from './pages/admin/AdminSOCAuditTrailPage';

// Shared Auth Pages
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ allowedRole: 'student' | 'lecturer' | 'admin' }> = ({ allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!user) {
    if (allowedRole === 'lecturer') return <Navigate to="/lecturer/login" replace />;
    if (allowedRole === 'admin') return <Navigate to="/admin/login" replace />;
    return <Navigate to="/student/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === 'lecturer') return <Navigate to="/lecturer/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/soc" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${allowedRole === 'admin' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      {allowedRole === 'student' && <AITutorDrawer />}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Portal Landing Gateway */}
          <Route path="/" element={<LandingPage />} />

          {/* Student Auth & Portal */}
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/student/register" element={<StudentRegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/labs" element={<StudentUnitDetailPage />} />
            <Route path="/student/units" element={<StudentUnitsPage />} />
            <Route path="/student/units/:unitId" element={<StudentUnitDetailPage />} />
            <Route path="/student/units/:unitId/weeks/:weekNumber" element={<StudentWeekLearningPage />} />
            <Route path="/student/weeks/:weekId" element={<StudentWeekLearningPage />} />
            <Route path="/student/units/:unitId/lab" element={<StudentLabAreaPage />} />
            <Route path="/student/lab/:assessmentId" element={<StudentLabAreaPage />} />
            <Route path="/student/units/:unitId/lab/results" element={<StudentLabResultsPage />} />
            <Route path="/student/results/:attemptId" element={<StudentLabResultsPage />} />
            <Route path="/student/revision" element={<StudentRevisionDashboardPage />} />
            <Route path="/student/revision/:unitId" element={<StudentRevisionDashboardPage />} />
            <Route path="/student/analytics" element={<StudentLabAnalyticsPage />} />
            <Route path="/student/lab-analytics" element={<StudentLabAnalyticsPage />} />
            <Route path="/student/final-test" element={<StudentFinalTestPage />} />
            <Route path="/student/units/:unitId/final-test" element={<StudentFinalTestPage />} />
            <Route path="/student/final-test/:unitId" element={<StudentFinalTestPage />} />
            <Route path="/student/leaderboard" element={<StudentLeaderboardPage />} />
            <Route path="/student/public-labs" element={<StudentPublicLabsPage />} />
            <Route path="/student/history" element={<StudentHistoricalSemestersPage />} />
          </Route>

          {/* Lecturer Auth & Portal */}
          <Route path="/lecturer/login" element={<LecturerLoginPage />} />
          <Route path="/lecturer/register" element={<LecturerRegisterPage />} />
          <Route element={<ProtectedRoute allowedRole="lecturer" />}>
            <Route path="/lecturer/dashboard" element={<LecturerDashboardPage />} />
            <Route path="/lecturer/units" element={<LecturerUnitsPage />} />
            <Route path="/lecturer/units/:unitId/weeks" element={<LecturerWeekManagerPage />} />
            <Route path="/lecturer/units/:unitId/builder" element={<LecturerAssessmentBuilderPage />} />
            <Route path="/lecturer/units/:unitId/exam-readiness-builder" element={<LecturerExamReadinessBuilderPage />} />
            <Route path="/lecturer/units/:unitId/readiness-builder" element={<LecturerExamReadinessBuilderPage />} />
            <Route path="/lecturer/units/:unitId/analytics" element={<LecturerAnalyticsPage />} />
            <Route path="/lecturer/units/:unitId/revision" element={<LecturerRevisionPackPage />} />
            <Route path="/lecturer/units/:unitId/approvals" element={<LecturerFinalExamApprovalsPage />} />
          </Route>

          {/* Admin / Mini SOC Auth & Portal */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin/soc" element={<AdminSOCDashboardPage />} />
            <Route path="/admin/soc/events" element={<AdminSOCEventsPage />} />
            <Route path="/admin/soc/audit" element={<AdminSOCAuditTrailPage />} />
          </Route>

          {/* Catch-all redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
