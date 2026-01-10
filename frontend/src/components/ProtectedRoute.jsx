import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

 if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
 if (allowedRole && role !== allowedRole) return <Navigate to="/login" />; 

 return children;
}; 


