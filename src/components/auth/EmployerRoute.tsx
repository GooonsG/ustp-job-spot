
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { useUserRole } from '@/hooks/useUserRole';

interface EmployerRouteProps {
  children: ReactNode;
}

const EmployerRoute = ({ children }: EmployerRouteProps) => {
  const { user, loading } = useAuth();
  const { isEmployer, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isEmployer) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default EmployerRoute;
