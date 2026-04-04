/*
 * wraps routes that need authentication
 * redirects to login if nobody's logged in
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, admin, loading } = useAuth();

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  /* if we need an admin but there's no admin session, bounce to login */
  if (role === 'admin' && !admin) return <Navigate to="/login" />;

  /* if we need a user but there's no user session, bounce to login */
  if (role === 'user' && !user) return <Navigate to="/login" />;

  /* if no specific role required, just need someone logged in */
  if (!role && !user && !admin) return <Navigate to="/login" />;

  return children;
}
