import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth';
import { Button } from './Button';

const roleLabel = {
  HRD: 'HRD',
  EMPLOYEE: 'Karyawan',
};

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Beranda', end: true },
    { to: '/absensi', label: 'Absensi' },
    ...(user?.role === 'HRD'
      ? [
          { to: '/monitoring', label: 'Monitoring' },
          { to: '/karyawan', label: 'Karyawan' },
        ]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
                AW
              </span>
              <span className="text-sm font-semibold text-slate-800">Absensi WFH</span>
            </div>
            <nav className="hidden items-center gap-1 sm:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">
                {user ? roleLabel[user.role] : ''} · {user?.employeeCode}
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {user ? initials(user.name) : ''}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 sm:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
};
