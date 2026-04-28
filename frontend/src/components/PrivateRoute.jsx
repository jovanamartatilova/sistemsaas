import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Jika route adalah candidate route (/c/:idCompany/...), redirect ke candidate login
    if (location.pathname.startsWith('/c/')) {
      // Extract company id dari path: /c/:idCompany/...
      const companyMatch = location.pathname.match(/^\/c\/([^/]+)/);
      if (companyMatch) {
        const idCompany = companyMatch[1];
        return <Navigate to={`/c/${idCompany}/login`} replace />;
      }
    }
    // Default fallback untuk route lainnya
    return <Navigate to="/login" replace />;
  }

  return children;
}