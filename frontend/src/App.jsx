import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';

// Auth
import LoginPage         from './pages/Auth/Login';
import RegisterPage      from './pages/Auth/SignUp';
import ForgotPassword    from './pages/Auth/ForgotPassword';
import ResetPassword     from './pages/Auth/ResetPassword';
import ActivateAccount   from './pages/Auth/ActivateAccount';
import Onboarding from "./components/OnboardingModal";

// Candidate
import LoginCandidate           from './pages/Candidate/LoginCandidate';
import ForgotPasswordCandidate  from './pages/Candidate/ForgotPasswordCandidate';
import ResetPasswordCandidate   from './pages/Candidate/ResetPasswordCandidate';
import CandidateDashboard       from './pages/Candidate/CandidateDashboard';
import LeaderDashboard          from './pages/Candidate/LeaderDashboard';
import LeaderTeamManagement     from './pages/Candidate/LeaderTeamManagement';
import MemberDashboard          from './pages/Candidate/MemberDashboard';
import SubmissionForm           from './pages/Candidate/SubmissionForm';
import ProfileSettings          from './pages/Candidate/ProfileSettings';
import CertificateCandidate     from './pages/Candidate/CertificateCandidate';
import ProgramsPage             from './pages/Candidate/ProgramsCandidate';
import JoinTeamPage             from './pages/Candidate/JoinTeamPage';

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
import PreviewOnboarding from './pages/Main/PreviewOnboarding';

// Super Admin
import SuperAdminPages from './pages/SuperAdmin/SuperAdminPages';

// HR
import DashboardHR  from './pages/HR/DashboardHR';
import SelectionHR  from './pages/HR/SelectionHR';
import ActiveInternHR from './pages/HR/ActiveInternHR';
import GenerateLOA  from './pages/HR/GenerateLOA';
import PayrollHR    from './pages/HR/PayrollHR';
import AssignMentor from './pages/HR/AssignMentor';
import CandidateHR from './pages/hr/CandidateHR';

// Mentor
import DashboardMentor    from './pages/Mentor/DashboardMentor';
import AssignTasksMentor  from './pages/Mentor/AssignTasksMentor';
import InputScoreMentor   from './pages/Mentor/InputScoreMentor';
import CertificateMentor  from './pages/Mentor/CertificateMentor';

// Helper
const Private = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

const CandidateRegisterRedirect = () => {
    const { idCompany } = useParams();
    const [searchParams] = useSearchParams();
    const vacancyId = searchParams.get('vacancy_id');
    const positionId = searchParams.get('position_id');

    if (vacancyId && positionId) {
        return <Navigate to={`/c/${idCompany}/apply/${vacancyId}/${positionId}`} replace />;
    }

    return <Navigate to={`/c/${idCompany}/login`} replace />;
};

/** Redirect ke mentor dashboard jika role === 'mentor', selain itu tampilkan DashboardPage */
const DashboardRouter = () => {
    const { user, company } = useAuthStore();
    const storedUserType = localStorage.getItem('user_type');
    const hasCandidateProfile = !!localStorage.getItem('candidate_profile');
    const role = user?.role || user?.user_type || storedUserType || company?.role || (hasCandidateProfile ? 'candidate' : null);

    if (!role || role === 'new') return <Navigate to="/onboarding" replace />;
    
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
                <Route path="/c/:idCompany"                   element={<LandingPage />} />
                <Route path="/c/:idCompany/register"          element={<CandidateRegisterRedirect />} />
                <Route path="/c/:idCompany/login"             element={<LoginCandidate />} />
                <Route path="/c/:idCompany/forgot-password"   element={<ForgotPasswordCandidate />} />
                <Route path="/c/:idCompany/reset-password"    element={<ResetPasswordCandidate />} />
                <Route path="/c/:idCompany/staff/login"       element={<LoginStaff />} />
                <Route path="/c/:idCompany/staff/forgot-password"   element={<ForgotPasswordStaff />} />
                <Route path="/c/:idCompany/staff/reset-password"    element={<ResetPasswordStaff />} />
                <Route path="/onboarding" element={<PreviewOnboarding />} />

                {/* Team Invitation - Public */}
                <Route path="/join-team/:token" element={<JoinTeamPage />} />
                <Route path="/join/:token" element={<JoinTeamPage />} />

                {/* Candidate — Private */}
                <Route path="/candidate/dashboard"                   element={<Private><CandidateDashboard /></Private>} />
                <Route path="/c/:idCompany/dashboard"                     element={<Private><CandidateDashboard /></Private>} />
                <Route path="/c/:idCompany/leader/dashboard"              element={<Private><LeaderDashboard /></Private>} />
                <Route path="/c/:idCompany/leader/team"                   element={<Private><LeaderTeamManagement /></Private>} />
                <Route path="/c/:idCompany/leader/tasks"                  element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:idCompany/member/dashboard"              element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:idCompany/member/tasks"                  element={<Private><MemberDashboard /></Private>} />
                <Route path="/c/:idCompany/programs"                      element={<Private><ProgramsPage /></Private>} />
                <Route path="/c/:idCompany/certificates"                  element={<Private><CertificateCandidate /></Private>} />
                <Route path="/c/:idCompany/profile"                       element={<Private><ProfileSettings /></Private>} />
                <Route path="/c/:idCompany/apply/:vacancyId/:positionId"  element={<Private><SubmissionForm /></Private>} />
                <Route path="/candidate/programs"   element={<Private><ProgramsPage /></Private>} /> 

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
                <Route path="/hr/selection"     element={<Private><SelectionHR /></Private>} />
                <Route path="/hr/generate-loa"  element={<Private><GenerateLOA /></Private>} />
                <Route path="/hr/payroll"       element={<Private><PayrollHR /></Private>} />
                <Route path="/hr/assign-mentor" element={<Private><AssignMentor /></Private>} />
                <Route path="/hr/active-intern" element={<Private><ActiveInternHR /></Private>} />
                <Route path="/hr/candidates" element={<CandidateHR />} />
                <Route path="/hr/active-intern" element={<ActiveInternHR />} />

                {/* Mentor — Private */}
                <Route path="/mentor/dashboard"     element={<Private><DashboardMentor /></Private>} />
                <Route path="/mentor/assign-tasks"   element={<Private><AssignTasksMentor /></Private>} />
                <Route path="/mentor/input-score"    element={<Private><InputScoreMentor /></Private>} />
                <Route path="/mentor/certificates"   element={<Private><CertificateMentor /></Private>} />

            </Routes>
        </BrowserRouter>
    );
}