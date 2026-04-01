import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
// Auth pages
import LoginPage from './pages/login';
import RegisterPage from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
// Candidate (company public)
import CompanyPublicPage from './pages/companyPublic';
import SignUpCandidate from './pages/signUpCandidate';
import LoginCandidate from './pages/loginCandidate';
import CandidateDashboard from './pages/candidateDashboard';
import SubmissionForm from './pages/SubmissionForm';

// Staff
import ActivateAccount from './pages/activateAccount';
import LoginStaff from './pages/loginStaff';
// Main pages
import DashboardPage from './pages/DashboardPage';
import ProgramManagement from './pages/ProgramManagement';
import PositionsManagement from './pages/PositionsManagement';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
// Super Admin
import SuperAdminPages from "./pages/SuperAdminPages";

export default function App() {
    const { token, isAuthenticated, company } = useAuthStore();
    const isApplicant = company?.role === "applicant";

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
                <Route path="/c/:slug/staff/login" element={<LoginStaff />} />


                {/* Candidate Dashboard & Apply */}
                <Route
                    path="/c/:slug/dashboard"
                    element={
                        <PrivateRoute>
                            <CandidateDashboard />
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

                {/* Activation */}
                <Route path="/activate" element={<ActivateAccount />} />

                {/* Home tambahan */}
                <Route path="/home" element={<HomePage />} />
                {/* Protected */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
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
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <ProfilePage />
                        </PrivateRoute>
                    }
                />

                <Route path="/superadmin/*" element={<SuperAdminPages />} />


            </Routes>
        </BrowserRouter>
    );
}

