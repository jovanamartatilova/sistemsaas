import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/login';
import RegisterPage from './pages/signUp';
import RegisterApplicant from './pages/RegisterApplicant';
import DashboardPage from './pages/DashboardPage';
import ManajemenLowongan from './pages/ManajemenLowongan';
import ManajemenProgram from './pages/ManajemenProgram';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import LandingPage from './pages/LandingPage';
import ApplicantPortal from './pages/ApplicantPortal';
import LoginApplicant from './pages/LoginApplicant';

export default function App() {
    const { isAuthenticated, company } = useAuthStore();
    const isApplicant = company?.role === "applicant";
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing page as default root */}
                <Route path="/" element={isAuthenticated ? <Navigate to={isApplicant ? "/applicant/portal" : "/dashboard"} replace /> : <LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/register-applicant" element={<RegisterApplicant />} />
                <Route path="/applicant/login" element={<LoginApplicant />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Dashboard (protected) */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                {/* Redirect root ke login atau profile */}
                <Route path="/" element={<Navigate to={isAuthenticated ? (isApplicant ? "/applicant/portal" : "/dashboard") : "/login"} replace />} />
                <Route
                    path="/program"
                    element={
                        <PrivateRoute>
                            <ManajemenProgram />
                        </PrivateRoute>
                    }
                />
                {/* Monitoring Lowongan (protected) */}
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