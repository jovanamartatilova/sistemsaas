import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/login';
import RegisterPage from './pages/signUp';
import ProfilePage from './pages/ProfilePage';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import CompanyPublicPage from './pages/companyPublic';
import SignUpCandidate from './pages/signUpCandidate';
import LoginCandidate from './pages/loginCandidate';
import ForgotPasswordCandidate from './pages/forgotPasswordCandidate';
import ResetPasswordCandidate from './pages/resetPasswordCandidate';
import ActivateAccount from './pages/activateAccount';
import LoginStaff from './pages/loginStaff';

export default function App() {
  const { token, isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/c/:slug" element={<CompanyPublicPage />} />
        <Route path="/c/:slug/register" element={<SignUpCandidate />} />
        <Route path="/c/:slug/login" element={<LoginCandidate />} />
        <Route path="/c/:slug/forgot-password" element={<ForgotPasswordCandidate />} />
        <Route path="/c/:slug/reset-password" element={<ResetPasswordCandidate />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/c/:slug/staff/login" element={<LoginStaff />} />
        
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Redirect root ke login atau profile */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/profile" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}