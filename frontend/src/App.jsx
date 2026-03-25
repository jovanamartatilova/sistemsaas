import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
// Auth pages
import LoginPage from './pages/login';
import RegisterPage from './pages/signUp';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
// Candidate / Applicant
import RegisterApplicant from './pages/RegisterApplicant';
import LoginApplicant from './pages/LoginApplicant';
import ApplicantPortal from './pages/ApplicantPortal';
// Company public
import CompanyPublicPage from './pages/companyPublic';
import SignUpCandidate from './pages/signUpCandidate';
import LoginCandidate from './pages/loginCandidate';
import ForgotPasswordCandidate from './pages/forgotPasswordCandidate';
import ResetPasswordCandidate from './pages/resetPasswordCandidate';
// Staff
import ActivateAccount from './pages/activateAccount';
import LoginStaff from './pages/loginStaff';
// Main pages
import DashboardPage from './pages/DashboardPage';
import ManajemenLowongan from './pages/ManajemenLowongan';
import ManajemenProgram from './pages/ManajemenProgram';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';

export default function App() {
    const { isAuthenticated, company } = useAuthStore();
    const isApplicant = company?.role === "applicant";
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page as default root */}
                <Route path="/" element={isAuthenticated ? <Navigate to={isApplicant ? "/applicant/portal" : "/dashboard"} replace /> : <LandingPage />} />
                {/* General Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Applicant */}
                <Route path="/register-applicant" element={<RegisterApplicant />} />
                <Route path="/applicant/login" element={<LoginApplicant />} />
                  
                {/* Company Public */}
                <Route path="/c/:slug" element={<CompanyPublicPage />} />
                <Route path="/c/:slug/register" element={<SignUpCandidate />} />
                <Route path="/c/:slug/login" element={<LoginCandidate />} />
                <Route path="/c/:slug/forgot-password" element={<ForgotPasswordCandidate />} />
                <Route path="/c/:slug/reset-password" element={<ResetPasswordCandidate />} />
                <Route path="/c/:slug/staff/login" element={<LoginStaff />} />
                
                {/* Activation */}
                <Route path="/activate" element={<ActivateAccount />} />
                
                {/* Home tambahan */}
                <Route path="/home" element={<HomePage />} />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                 
                <Route
                    path="/program"
                    element={
                        <PrivateRoute>
                            <ManajemenProgram />
                        </PrivateRoute>
                    }
                />
               
                <Route
                    path="/lowongan"
                    element={
                        <PrivateRoute>
                            <ManajemenLowongan />
                        </PrivateRoute>
                    }
                />
                {/* Applicant Portal (protected) */}
                <Route
                    path="/applicant/portal"
                    element={
                        <PrivateRoute>
                            <ApplicantPortal />
                        </PrivateRoute>
                    }
                />
                {/* Legacy /profile redirect */}
                <Route path="/profile" element={<Navigate to={isApplicant ? "/applicant/portal" : "/dashboard"} replace />} />
            </Routes>
        </BrowserRouter>
    );
}