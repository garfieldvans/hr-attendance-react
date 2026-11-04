import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/use-auth';
import { getErrorMessage } from '../services/http';

const demoAccounts = [
  { label: 'HRD', email: 'hrd@attendance.test', password: 'Password123!' },
  { label: 'Karyawan', email: 'budi@attendance.test', password: 'Password123!' },
];

export const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setSubmitting(false);
    }
  };

  const useDemoAccount = (account: (typeof demoAccounts)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-semibold">
            AW
          </span>
          <span className="text-sm font-semibold tracking-wide">Absensi WFH</span>
        </div>

        <div className="max-w-sm">
          <h1 className="text-3xl font-semibold leading-snug">
            Absen dari rumah, tetap tercatat rapi.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            Karyawan mengirim absensi lengkap dengan foto, HRD memantau kehadiran seluruh tim dari
            satu halaman.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            {['Satu absensi per hari', 'Foto sebagai bukti bekerja', 'Monitoring untuk HRD'].map(
              (item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-indigo-400" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <p className="text-xs text-slate-500">PT Nusantara Digital · 2026</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white">
              AW
            </span>
            <span className="text-sm font-semibold text-slate-800">Absensi WFH</span>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Masuk ke akun</h2>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan email kantor yang sudah terdaftar oleh HRD.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="nama@attendance.test"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-600">{error}</p>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              Masuk
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500">Akun demo</p>
            <div className="mt-3 flex gap-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => useDemoAccount(account)}
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
