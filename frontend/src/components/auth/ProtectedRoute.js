
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
