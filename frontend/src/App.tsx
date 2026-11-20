import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import SkillGapPage from './pages/SkillGapPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ProjectsPage from './pages/ProjectsPage';
import PassportPage from './pages/PassportPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import CandidateExtraPage from './pages/CandidateExtraPage';
import './App.css';

// Login / Register pages removed — no auth required anymore.
// / → Candidate Dashboard  |  /employer → Employer Dashboard

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page kept for reference */}
          <Route path="/landing" element={<LandingPage />} />

          {/* Login & register redirect to candidate dashboard */}
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />

          {/* Root → Candidate Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* All dashboard routes — no auth check */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Candidate routes */}
            <Route path="/profile" element={<CandidateProfilePage />} />
            <Route path="/skills" element={<SkillGapPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/passport" element={<PassportPage />} />
            <Route path="/mentors" element={<CandidateExtraPage />} />
            <Route path="/fellowships" element={<CandidateExtraPage />} />
            <Route path="/references" element={<CandidateExtraPage />} />
            <Route path="/applications" element={<CandidateExtraPage />} />
            <Route path="/reports" element={<CandidateExtraPage />} />
            <Route path="/candidate-extra" element={<CandidateExtraPage />} />

            {/* Employer routes */}
            <Route path="/employer" element={<EmployerDashboardPage />} />
            <Route path="/employer/profile" element={<EmployerDashboardPage />} />
            <Route path="/employer/jobs" element={<EmployerDashboardPage />} />
            <Route path="/employer/candidates" element={<EmployerDashboardPage />} />
          </Route>

          {/* Catch-all → Candidate Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
