import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/login';
import RegisterPage from './pages/signUp';
import DashboardPage from './pages/DashboardPage';
import ManajemenLowongan from './pages/ManajemenLowongan';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import LandingPage from './pages/LandingPage';
import CompanyPublicPage from './pages/companyPublic';
import SignUpCandidate from './pages/signUpCandidate';
import LoginCandidate from './pages/loginCandidate';
import ForgotPasswordCandidate from './pages/forgotPasswordCandidate';
import ResetPasswordCandidate from './pages/resetPasswordCandidate';
import ActivateAccount from './pages/activateAccount';
import LoginStaff from './pages/loginStaff';

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page as default root */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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

        {/* Monitoring Lowongan (protected) */}
        <Route path="/c/:slug" element={<CompanyPublicPage />} />
        <Route path="/c/:slug/register" element={<SignUpCandidate />} />
        <Route path="/c/:slug/login" element={<LoginCandidate />} />
        <Route path="/c/:slug/forgot-password" element={<ForgotPasswordCandidate />} />
        <Route path="/c/:slug/reset-password" element={<ResetPasswordCandidate />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/c/:slug/staff/login" element={<LoginStaff />} />
        
        <Route
          path="/lowongan"
          element={
            <PrivateRoute>
              <ManajemenLowongan />
            </PrivateRoute>
          }
        />

        {/* Legacy /profile redirect */}
        <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}