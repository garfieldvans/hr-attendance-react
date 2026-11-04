import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import type { Role } from '../types';

interface ProtectedRouteProps {
  roles?: Role[];
  children?: ReactNode;
}

export const ProtectedRoute = ({ roles, children }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-800">Halaman ini khusus HRD</p>
          <p className="mt-1 text-sm text-slate-500">
            Akun kamu tidak punya akses ke menu monitoring karyawan.
          </p>
        </div>
      </div>
    );
  }

  return children ?? <Outlet />;
};
