import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string; 
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};