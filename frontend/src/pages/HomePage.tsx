import { FiBriefcase, FiCheckCircle, FiSlash } from 'react-icons/fi';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { useAuth } from '../hooks/use-auth';

const formatDate = (value: string | null) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const details = [
    { label: 'Kode karyawan', value: user.employeeCode },
    { label: 'Email', value: user.email },
    { label: 'Jabatan', value: user.position ?? '-' },
    { label: 'Departemen', value: user.department ?? '-' },
    { label: 'Nomor telepon', value: user.phone ?? '-' },
    { label: 'Tanggal masuk', value: formatDate(user.joinDate) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Halo, {user.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan data kepegawaian kamu.{' '}
          {user.role === 'HRD'
            ? 'Pantau kehadiran tim lewat menu Monitoring.'
            : 'Kirim bukti kerja harian lewat menu Absensi.'}
        </p>
      </div>

      <Card title="Profil karyawan" description="Data ini dikelola oleh HRD">
        <div className="mb-6 flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-indigo-50 text-lg font-semibold text-indigo-700">
            {user.name
              .split(' ')
              .slice(0, 2)
              .map((part) => part[0])
              .join('')
              .toUpperCase()}
          </span>
          <div>
            <p className="font-medium text-slate-900">{user.name}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={user.role === 'HRD' ? 'brand' : 'neutral'} icon={FiBriefcase}>
                {user.role === 'HRD' ? 'HRD' : 'Karyawan'}
              </Badge>
              <Badge
                tone={user.isActive ? 'success' : 'danger'}
                icon={user.isActive ? FiCheckCircle : FiSlash}
              >
                {user.isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          </div>
        </div>

        <dl className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs text-slate-500">{detail.label}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
};
