import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();
  const hasToken = !!localStorage.getItem("auth_token");
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !hasToken) {
    if (location.pathname.startsWith('/c/')) {
      const companyMatch = location.pathname.match(/^\/c\/([^/]+)/);
      if (companyMatch) {
        const idCompany = companyMatch[1];
        return <Navigate to={`/c/${idCompany}/login`} replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
