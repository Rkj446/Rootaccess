import { Navigate } from 'react-router-dom';
import { authService, getDefaultRoute } from '../utils/auth';

export default function ProtectedRoute({ children, requiredRole }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return children;
}
