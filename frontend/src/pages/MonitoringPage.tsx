import { useCallback, useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiRefreshCw, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { formatFullDate, formatShortDate, formatTime, todayValue } from '../lib/datetime';
import { getAttendances } from '../services/attendance-service';
import { getErrorMessage } from '../services/http';
import type { MonitoredAttendance, PaginationMeta } from '../types';

const pageSize = 10;

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50';

export const MonitoringPage = () => {
  const [from, setFrom] = useState(todayValue);
  const [to, setTo] = useState(todayValue);
  const [keyword, setKeyword] = useState('');
  const [rows, setRows] = useState<MonitoredAttendance[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState<MonitoredAttendance | null>(null);

  const rangeInvalid = Boolean(from && to && from > to);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const result = await getAttendances({
        from: from || undefined,
        to: to || undefined,
        q: keyword.trim() || undefined,
        page,
        limit: pageSize,
      });
      setRows(result.items);
      setMeta(result.meta);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [from, keyword, page, to]);

  useEffect(() => {
    if (rangeInvalid) {
      return;
    }

    const timer = setTimeout(() => void load(), 300);

    return () => clearTimeout(timer);
  }, [load, rangeInvalid]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(null);
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [active]);

  const errorMessage = rangeInvalid
    ? 'Tanggal awal tidak boleh melebihi tanggal akhir.'
    : error;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Monitoring absensi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau kehadiran karyawan beserta foto bukti kerja. Data bersifat baca saja.
        </p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="from" className="block text-sm font-medium text-slate-700">
              Dari tanggal
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="to" className="block text-sm font-medium text-slate-700">
              Sampai tanggal
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="keyword" className="block text-sm font-medium text-slate-700">
              Cari karyawan
            </label>
            <input
              id="keyword"
              type="search"
              value={keyword}
              placeholder="Nama, kode, atau email"
              onChange={(event) => {
                setKeyword(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      <Card
        title="Data kehadiran"
        description={
          loading
            ? 'Memuat data...'
            : from && to && from === to
              ? `${formatFullDate(from)} · ${meta.total} absensi`
              : `${meta.total} absensi ditemukan`
        }
        padded={false}
      >
        {errorMessage ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-rose-600">{errorMessage}</p>
            {!rangeInvalid && (
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                onClick={() => void load()}
                aria-label="Coba lagi"
                title="Coba lagi"
              >
                <FiRefreshCw className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Foto</th>
                  <th className="px-5 py-3 font-medium">Karyawan</th>
                  <th className="px-5 py-3 font-medium">Tanggal</th>
                  <th className="px-5 py-3 font-medium">Masuk</th>
                  <th className="px-5 py-3 font-medium">Pulang</th>
                  <th className="px-5 py-3 font-medium">Tipe</th>
                  <th className="px-5 py-3 font-medium">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 7 }).map((__, cell) => (
                          <td key={cell} className="px-5 py-4">
                            <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => setActive(row)}
                            className="block rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-100"
                            aria-label={`Lihat foto absensi ${row.employee?.name ?? ''}`}
                          >
                            <img
                              src={row.photoUrl}
                              alt={`Foto absensi ${row.employee?.name ?? ''}`}
                              className="size-12 rounded-lg object-cover ring-1 ring-slate-200 transition hover:opacity-80"
                            />
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          {row.employee ? (
                            <Link
                              to={`/karyawan/${row.employee.id}`}
                              className="font-medium text-slate-900 transition hover:text-indigo-700 hover:underline"
                            >
                              {row.employee.name}
                            </Link>
                          ) : (
                            <p className="font-medium text-slate-900">-</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {[row.employee?.employeeCode, row.employee?.position]
                              .filter(Boolean)
                              .join(' · ') || '-'}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {formatShortDate(row.attendanceDate)}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {formatTime(row.checkInAt)}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {row.checkOutAt ? (
                            formatTime(row.checkOutAt)
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <FiClock className="size-3.5" aria-hidden="true" />
                              Belum absen pulang
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone="brand">{row.workType}</Badge>
                        </td>
                        <td className="max-w-[220px] px-5 py-3 text-slate-600">
                          <p className="truncate">{row.notes ?? '-'}</p>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!loading && rows.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                Belum ada absensi pada rentang tanggal ini.
              </div>
            )}
          </div>
        )}

        {!loading && !errorMessage && meta.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-500">
              Menampilkan {(meta.page - 1) * meta.limit + 1}–
              {(meta.page - 1) * meta.limit + rows.length} dari {meta.total} absensi
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                aria-label="Halaman sebelumnya"
                title="Halaman sebelumnya"
                disabled={meta.page <= 1}
                onClick={() => setPage(meta.page - 1)}
              >
                <FiChevronLeft className="size-4" aria-hidden="true" />
              </Button>
              <span className="px-1 text-xs text-slate-500">
                Halaman {meta.page} dari {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                aria-label="Halaman berikutnya"
                title="Halaman berikutnya"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage(meta.page + 1)}
              >
                <FiChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {active && (
        <div
          role="presentation"
          onClick={() => setActive(null)}
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Foto bukti absensi"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <img
              src={active.photoUrl}
              alt={`Foto absensi ${active.employee?.name ?? ''}`}
              className="max-h-[70vh] w-full bg-slate-100 object-contain"
            />
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {active.employee?.name ?? 'Karyawan'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatFullDate(active.attendanceDate)} · masuk {formatTime(active.checkInAt)} ·
                  pulang{' '}
                  {active.checkOutAt ? formatTime(active.checkOutAt) : 'belum absen pulang'} ·{' '}
                  {active.workType}
                </p>
                {active.notes && <p className="mt-1 text-xs text-slate-500">{active.notes}</p>}
              </div>
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                onClick={() => setActive(null)}
                aria-label="Tutup"
                title="Tutup"
              >
                <FiX className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
