import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}