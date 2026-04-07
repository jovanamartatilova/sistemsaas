import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
// Auth pages
import LoginPage from './pages/Login';
import RegisterPage from './pages/signUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ForgotPasswordCandidate from './pages/ForgotPasswordCandidate';
import ResetPasswordCandidate from './pages/resetPasswordCandidate';
// Candidate (company public)
import CompanyPublicPage from './pages/companyPublic';
import SignUpCandidate from './pages/SignUpCandidate';
import LoginCandidate from './pages/LoginCandidate';
import CandidateDashboard from './pages/candidateDashboard';
import SubmissionForm from './pages/SubmissionForm';
import ProfileSettings from './pages/ProfileSettings';
import CertificateCandidate from './pages/CertificateCandidate';
import ProgramsPage from './pages/ProgramsCandidate';
// Staff
import ActivateAccount from './pages/ActivateAccount';
// Main pages
import DashboardPage from './pages/DashboardPage';
import ProgramManagement from './pages/ProgramManagement';
import PositionsManagement from './pages/PositionsManagement';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import UserManagement from './pages/UserManagement';
import SettingsAdmin from './pages/SettingsAdmin';
// Super Admin
import SuperAdminPages from "./pages/SuperAdminPages";
// HR
import DashboardHR from "./pages/HR/DashboardHR";
import KandidateHR from "./pages/HR/KandidateHR";
import ScreeningHR from "./pages/HR/ScreeningHR";
import WawancaraHR from "./pages/HR/WawancaraHR";
import GenerateLOA from "./pages/HR/GenerateLOA";
import PayrollHR from './pages/HR/PayrollHR';
import AssignMentor from './pages/HR/AssignMentor';
// Mentor
import CertificateMentor from './pages/Mentor/CertificateMentor';
import EvaluationMentor from './pages/Mentor/EvaluationMentor';
import CompetenciesMentor from './pages/Mentor/CompetenciesMentor';
import DashboardMentor from './pages/Mentor/DashboardMentor';
import InputScoreMentor from './pages/Mentor/InputScoreMentor';
import InternsMentor from './pages/Mentor/InternsMentor';
import ScoreRecapMentor from './pages/Mentor/ScoreRecapMentor';

export default function App() {
    const { token, isAuthenticated, company } = useAuthStore();
    const isApplicant = company?.role === "applicant";

    // Component untuk handle dashboard routing berdasarkan role
    const DashboardRouter = () => {
        const { company } = useAuthStore();
        
        // Jika user adalah mentor, redirect ke mentor dashboard
        if (company?.role === 'mentor') {
            return <Navigate to="/mentor/dashboard" replace />;
        }
        
        return <DashboardPage />;
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page as default root */}
                <Route path="/" element={<LandingPage />} />
                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />


                {/* Company Public */}
                <Route path="/c/:slug" element={<CompanyPublicPage />} />
                <Route path="/c/:slug/register" element={<SignUpCandidate />} />
                <Route path="/c/:slug/login" element={<LoginCandidate />} />
                <Route path="/c/:slug/staff/login" element={<Navigate to="/login" replace />} />


                {/* Candidate Dashboard & Apply */}
                <Route
                    path="/candidate/dashboard"
                    element={
                        <PrivateRoute>
                            <CandidateDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/c/:slug/dashboard"
                    element={
                        <PrivateRoute>
                            <CandidateDashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/c/:slug/programs"
                    element={
                        <PrivateRoute>
                            <ProgramsPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/c/:slug/certificates"
                    element={
                        <PrivateRoute>
                            <CertificateCandidate />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/c/:slug/profile"
                    element={
                        <PrivateRoute>
                            <ProfileSettings />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/c/:slug/apply/:vacancyId/:positionId"
                    element={
                        <PrivateRoute>
                            <SubmissionForm />
                        </PrivateRoute>
                    }
                />
                <Route path="/forgot-password-candidate" element={<ForgotPasswordCandidate />} />
                <Route path="/c/:slug/forgot-password" element={<ForgotPasswordCandidate />} />
                <Route path="/c/:slug/reset-password" element={<ResetPasswordCandidate />} />

                {/* Activation */}
                <Route path="/activate" element={<ActivateAccount />} />

                {/* Home tambahan */}
                <Route path="/home" element={<HomePage />} />
                {/* Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardRouter />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/positions"
                    element={
                        <PrivateRoute>
                            <PositionsManagement />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/programs"
                    element={
                        <PrivateRoute>
                            <ProgramManagement />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/users"
                    element={
                        <PrivateRoute>
                            <UserManagement />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <PrivateRoute>
                            <SettingsAdmin />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/c/:slug/profile"
                    element={
                        <PrivateRoute>
                            <ProfileSettings />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/c/:slug/certificates"
                    element={
                        <PrivateRoute>
                            <CertificateCandidate />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/c/:slug/programs"
                    element={
                        <PrivateRoute>
                            <ProgramsPage />
                        </PrivateRoute>
                    }
                />

                <Route path="/superadmin/*" element={<SuperAdminPages />} />

                {/* HR ROUTES */}
                <Route path="/hr/dashboard" element={<PrivateRoute><DashboardHR /></PrivateRoute>} />
                <Route path="/hr/kandidate" element={<PrivateRoute><KandidateHR /></PrivateRoute>} />
                <Route path="/hr/screening" element={<PrivateRoute><ScreeningHR /></PrivateRoute>} />
                <Route path="/hr/wawancara" element={<PrivateRoute><WawancaraHR /></PrivateRoute>} />
                <Route path="/hr/generate-loa" element={<PrivateRoute><GenerateLOA /></PrivateRoute>} />
                <Route path="/hr/payroll" element={<PrivateRoute><PayrollHR /></PrivateRoute>} />
                <Route path="/hr/assign-mentor" element={<PrivateRoute><AssignMentor /></PrivateRoute>} />

                {/* MENTOR ROUTES*/}
                <Route path="/mentor/dashboard" element={<PrivateRoute><DashboardMentor /></PrivateRoute>} />
                <Route path="/mentor/interns" element={<PrivateRoute><InternsMentor /></PrivateRoute>} />
                <Route path="/mentor/input-score" element={<PrivateRoute><InputScoreMentor /></PrivateRoute>} />
                <Route path="/mentor/score-recap" element={<PrivateRoute><ScoreRecapMentor /></PrivateRoute>} />
                <Route path="/mentor/competencies" element={<PrivateRoute><CompetenciesMentor /></PrivateRoute>} />
                <Route path="/mentor/evaluation" element={<PrivateRoute><EvaluationMentor /></PrivateRoute>} />
                <Route path="/mentor/certificates" element={<PrivateRoute><CertificateMentor /></PrivateRoute>} />

            </Routes>
        </BrowserRouter>
    );
}

