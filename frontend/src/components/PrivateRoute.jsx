import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Jika route adalah candidate route (/c/:slug/...), redirect ke candidate login
    if (location.pathname.startsWith('/c/')) {
      // Extract slug dari path: /c/:slug/...
      const slugMatch = location.pathname.match(/^\/c\/([^/]+)/);
      if (slugMatch) {
        const slug = slugMatch[1];
        return <Navigate to={`/c/${slug}/login`} replace />;
      }
    }
    // Default fallback untuk route lainnya
    return <Navigate to="/login" replace />;
  }

  return children;
}