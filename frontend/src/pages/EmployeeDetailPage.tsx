import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import {
  formatFullDate,
  formatShortDate,
  formatTime,
  toDateInputValue,
  todayValue,
} from '../lib/datetime';
import { getAttendances } from '../services/attendance-service';
import { getErrorMessage } from '../services/http';
import { getUser } from '../services/user-service';
import type { MonitoredAttendance, User } from '../types';

const historyDays = 30;

const historyStart = () => {
  const date = new Date();
  date.setDate(date.getDate() - (historyDays - 1));
  return toDateInputValue(date);
};

const DetailItem = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
    <dd className="mt-1 text-sm text-slate-800">{value || '-'}</dd>
  </div>
);

export const EmployeeDetailPage = () => {
  const { id = '' } = useParams();
  const [employee, setEmployee] = useState<User | null>(null);
  const [history, setHistory] = useState<MonitoredAttendance[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const [user, attendance] = await Promise.all([
          getUser(id),
          getAttendances({
            userId: id,
            from: historyStart(),
            to: todayValue(),
            page: 1,
            limit: 5,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setEmployee(user);
        setHistory(attendance.items);
        setHistoryTotal(attendance.meta.total);
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/karyawan" className="text-sm text-slate-500 hover:text-slate-800">
          Kembali ke data karyawan
        </Link>
        <Card>
          <p className="text-sm text-slate-500">Memuat data karyawan...</p>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-6">
        <Link to="/karyawan" className="text-sm text-slate-500 hover:text-slate-800">
          Kembali ke data karyawan
        </Link>
        <Card>
          <p className="text-sm text-rose-600">{error || 'Karyawan tidak ditemukan'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/karyawan" className="text-sm text-slate-500 hover:text-slate-800">
          Kembali ke data karyawan
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{employee.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {[employee.employeeCode, employee.position ?? 'Tanpa jabatan'].join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="neutral">
              {employee.role === 'HRD' ? 'HRD' : 'Karyawan'}
            </Badge>
            <Badge tone={employee.isActive ? 'success' : 'danger'}>
              {employee.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Card title="Profil karyawan" description="Data master yang dipakai untuk login.">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <DetailItem label="Email" value={employee.email} />
              <DetailItem label="Nomor telepon" value={employee.phone} />
              <DetailItem label="Jabatan" value={employee.position} />
              <DetailItem label="Divisi" value={employee.department} />
              <DetailItem
                label="Tanggal masuk"
                value={employee.joinDate ? formatShortDate(employee.joinDate) : null}
              />
              <DetailItem label="Kode karyawan" value={employee.employeeCode} />
            </dl>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card
            title="Absensi terakhir"
            description={`${historyDays} hari terakhir · ${historyTotal} absensi`}
            padded={false}
          >
            <ul className="divide-y divide-slate-100">
              {history.map((item) => (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={item.photoUrl}
                    alt={`Foto absensi ${formatShortDate(item.attendanceDate)}`}
                    className="size-10 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {formatFullDate(item.attendanceDate)} · masuk {formatTime(item.checkInAt)}
                    </p>
                    <p className="truncate text-xs text-slate-500">{item.notes ?? 'Tanpa catatan'}</p>
                  </div>
                  <Badge tone="brand">{item.workType}</Badge>
                </li>
              ))}
              {!history.length && (
                <li className="px-5 py-12 text-center text-sm text-slate-500">
                  Belum ada absensi dalam {historyDays} hari terakhir.
                </li>
              )}
            </ul>

            {historyTotal > history.length && (
              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Menampilkan {history.length} absensi terbaru.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
