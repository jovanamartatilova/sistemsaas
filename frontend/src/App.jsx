import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';

// Auth
import LoginPage         from './pages/Auth/Login';
import RegisterPage      from './pages/Auth/SignUp';
import ForgotPassword    from './pages/Auth/ForgotPassword';
import ResetPassword     from './pages/Auth/ResetPassword';
import ActivateAccount   from './pages/Auth/ActivateAccount';

// Candidate
import SignUpCandidate          from './pages/Candidate/SignUpCandidate';
import LoginCandidate           from './pages/Candidate/LoginCandidate';
import ForgotPasswordCandidate  from './pages/Candidate/ForgotPasswordCandidate';
import ResetPasswordCandidate   from './pages/Candidate/ResetPasswordCandidate';
import CompanyPublicPage        from './pages/Candidate/CompanyPublic';
import CandidateDashboard       from './pages/Candidate/CandidateDashboard';
import LeaderDashboard          from './pages/Candidate/LeaderDashboard';
import LeaderTeamManagement     from './pages/Candidate/LeaderTeamManagement';
import MemberDashboard          from './pages/Candidate/MemberDashboard';
import SubmissionForm           from './pages/Candidate/SubmissionForm';
import ProfileSettings          from './pages/Candidate/ProfileSettings';
import CertificateCandidate     from './pages/Candidate/CertificateCandidate';
import ProgramsPage             from './pages/Candidate/ProgramsCandidate';

// Admin
import DashboardPage        from './pages/Admin/DashboardPage';
import ProgramManagement    from './pages/Admin/ProgramManagement';
import PositionsManagement  from './pages/Admin/PositionsManagement';
import UserManagement       from './pages/Admin/UserManagement';
import SettingsAdmin        from './pages/Admin/SettingsAdmin';
import LoginStaff           from './pages/Admin/LoginStaff';
import ForgotPasswordStaff  from './pages/Admin/ForgotPasswordStaff';
import ResetPasswordStaff   from './pages/Admin/ResetPasswordStaff';

// Main
import LandingPage  from './pages/Main/LandingPage';
import ProfilePage  from './pages/Main/ProfilePage';

// Super Admin
import SuperAdminPages from './pages/SuperAdmin/SuperAdminPages';

// HR
import DashboardHR  from './pages/HR/DashboardHR';
import KandidateHR  from './pages/HR/KandidateHR';
import ScreeningHR  from './pages/HR/ScreeningHR';
import WawancaraHR  from './pages/HR/WawancaraHR';
import GenerateLOA  from './pages/HR/GenerateLOA';
import PayrollHR    from './pages/HR/PayrollHR';
import AssignMentor from './pages/HR/AssignMentor';

// Mentor
import DashboardMentor    from './pages/Mentor/DashboardMentor';
import InternsMentor      from './pages/Mentor/InternsMentor';
import AssignTasksMentor  from './pages/Mentor/AssignTasksMentor';
import InputScoreMentor   from './pages/Mentor/InputScoreMentor';
import ScoreRecapMentor   from './pages/Mentor/ScoreRecapMentor';
import CompetenciesMentor from './pages/Mentor/CompetenciesMentor';
import EvaluationMentor   from './pages/Mentor/EvaluationMentor';
import CertificateMentor  from './pages/Mentor/CertificateMentor';

// Helper
const Private = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

/** Redirect ke mentor dashboard jika role === 'mentor', selain itu tampilkan DashboardPage */
const DashboardRouter = () => {
    const { user, company } = useAuthStore();
    const role = user?.role || company?.role;
    
    if (role === 'mentor') return <Navigate to="/mentor/dashboard" replace />;
    if (role === 'hr') return <Navigate to="/hr/dashboard" replace />;
    
    return <DashboardPage />;
};

// App
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/"                          element={<LandingPage />} />
                <Route path="/login"                     element={<LoginPage />} />
                <Route path="/register"                  element={<RegisterPage />} />
                <Route path="/forgot-password"           element={<ForgotPassword />} />
                <Route path="/reset-password"            element={<ResetPassword />} />
                <Route path="/activate"                  element={<ActivateAccount />} />
                <Route path="/forgot-password-candidate" element={<ForgotPasswordCandidate />} />

                {/* Company — Public */}
                <Route path="/c/:slug"                   element={<CompanyPublicPage />} />
                <Route path="/c/:slug/register"          element={<SignUpCandidate />} />
                <Route path="/c/:slug/login"             element={<LoginCandidate />} />
                <Route path="/c/:slug/forgot-password"   element={<ForgotPasswordCandidate />} />
                <Route path="/c/:slug/reset-password"    element={<ResetPasswordCandidate />} />
                <Route path="/c/:slug/staff/login"       element={<LoginStaff />} />
                <Route path="/c/:slug/staff/forgot-password"   element={<ForgotPasswordStaff />} />
                <Route path="/c/:slug/staff/reset-password"    element={<ResetPasswordStaff />} />

                {/* Candidate — Private */}
                <Route path="/candidate/dashboard"                   element={<Private><CandidateDashboard /></Private>} />
                <Route path="/c/:slug/dashboard"                     element={<Private><CandidateDashboard /></Private>} />
                <Route path="/c/:slug/leader/dashboard"              element={<Private><LeaderDashboard /></Private>} />
                <Route path="/c/:slug/leader/team"                   element={<Private><LeaderTeamManagement /></Private>} />
                <Route path="/c/:slug/leader/tasks"                  element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:slug/member/dashboard"              element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:slug/member/tasks"                  element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:slug/programs"                      element={<Private><ProgramsPage /></Private>} />
                <Route path="/c/:slug/certificates"                  element={<Private><CertificateCandidate /></Private>} />
                <Route path="/c/:slug/profile"                       element={<Private><ProfileSettings /></Private>} />
                <Route path="/c/:slug/apply/:vacancyId/:positionId"  element={<Private><SubmissionForm /></Private>} />

                {/* Admin — Private */}
                <Route path="/dashboard"  element={<Private><DashboardRouter /></Private>} />
                <Route path="/positions"  element={<Private><PositionsManagement /></Private>} />
                <Route path="/programs"   element={<Private><ProgramManagement /></Private>} />
                <Route path="/users"      element={<Private><UserManagement /></Private>} />
                <Route path="/settings"   element={<Private><SettingsAdmin /></Private>} />
                <Route path="/profile"    element={<Private><ProfilePage /></Private>} />

                {/* Super Admin */}
                <Route path="/superadmin/*" element={<SuperAdminPages />} />

                {/* HR — Private */}
                <Route path="/hr/dashboard"     element={<Private><DashboardHR /></Private>} />
                <Route path="/hr/kandidate"     element={<Private><KandidateHR /></Private>} />
                <Route path="/hr/screening"     element={<Private><ScreeningHR /></Private>} />
                <Route path="/hr/wawancara"     element={<Private><WawancaraHR /></Private>} />
                <Route path="/hr/generate-loa"  element={<Private><GenerateLOA /></Private>} />
                <Route path="/hr/payroll"       element={<Private><PayrollHR /></Private>} />
                <Route path="/hr/assign-mentor" element={<Private><AssignMentor /></Private>} />

                {/* Mentor — Private */}
                <Route path="/mentor/dashboard"     element={<Private><DashboardMentor /></Private>} />
                <Route path="/mentor/interns"        element={<Private><InternsMentor /></Private>} />
                <Route path="/mentor/assign-tasks"   element={<Private><AssignTasksMentor /></Private>} />
                <Route path="/mentor/input-score"    element={<Private><InputScoreMentor /></Private>} />
                <Route path="/mentor/score-recap"    element={<Private><ScoreRecapMentor /></Private>} />
                <Route path="/mentor/competencies"   element={<Private><CompetenciesMentor /></Private>} />
                <Route path="/mentor/evaluation"     element={<Private><EvaluationMentor /></Private>} />
                <Route path="/mentor/certificates"   element={<Private><CertificateMentor /></Private>} />

            </Routes>
        </BrowserRouter>
    );
}