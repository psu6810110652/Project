import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);

    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp && decodedToken.exp < currentTime) {
      // Clear storage if expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    // Role-based access control directly from decoded token
    if (decodedToken.role !== allowedRole) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (error) {
    // Handle malformed tokens
    console.error('Invalid or malformed token', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};