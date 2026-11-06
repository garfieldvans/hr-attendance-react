import { useCallback, useEffect, useState } from 'react';
import { FiCheck, FiCheckCircle, FiClock, FiLogOut, FiRefreshCw, FiSend } from 'react-icons/fi';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PhotoCapture } from '../components/PhotoCapture';
import { formatFullDate, formatShortDate, formatTime, todayValue } from '../lib/datetime';
import { getMyAttendances, submitAttendance, submitCheckOut } from '../services/attendance-service';
import { getErrorMessage } from '../services/http';
import type { Attendance } from '../types';

export const AttendancePage = () => {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [formError, setFormError] = useState('');
  const [checkOutError, setCheckOutError] = useState('');
  const [notice, setNotice] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    try {
      setHistory(await getMyAttendances());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const today = todayValue();
  const todayAttendance = history.find((item) => item.attendanceDate === today) ?? null;

  const handleSubmit = async () => {
    setFormError('');
    setNotice('');

    if (!photo) {
      setFormError('Foto bukti kerja wajib diisi.');
      return;
    }

    setSubmitting(true);

    try {
      await submitAttendance({ photo, notes });
      setPhoto(null);
      setNotes('');
      setNotice('Absensi hari ini berhasil dikirim.');
      await loadHistory();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutError('');
    setNotice('');
    setCheckingOut(true);

    try {
      await submitCheckOut();
      setNotice('Absen pulang tercatat.');
      await loadHistory();
    } catch (error) {
      setCheckOutError(getErrorMessage(error));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Absensi</h1>
        <p className="mt-1 text-sm text-slate-500">
          {formatFullDate(today)} · tanggal dan jam tercatat otomatis oleh server.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {todayAttendance ? (
          <Card
            title="Absensi hari ini"
            description={
              todayAttendance.checkOutAt
                ? 'Absensi hari ini sudah lengkap'
                : 'Kamu sudah absen masuk, absen pulang saat selesai bekerja'
            }
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <img
                src={todayAttendance.photoUrl}
                alt="Foto bukti absensi hari ini"
                className="h-32 w-full rounded-xl object-cover sm:w-32"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="brand">{todayAttendance.workType}</Badge>
                  <Badge tone="success" icon={FiCheckCircle}>
                    Tercatat
                  </Badge>
                  {todayAttendance.checkOutAt ? (
                    <Badge tone="neutral" icon={FiCheck}>
                      Selesai
                    </Badge>
                  ) : (
                    <Badge tone="neutral" icon={FiClock}>
                      Belum absen pulang
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  Masuk pukul{' '}
                  <span className="font-semibold text-slate-900">
                    {formatTime(todayAttendance.checkInAt)}
                  </span>
                </p>
                {todayAttendance.checkOutAt && (
                  <p className="text-sm text-slate-600">
                    Pulang pukul{' '}
                    <span className="font-semibold text-slate-900">
                      {formatTime(todayAttendance.checkOutAt)}
                    </span>
                  </p>
                )}
                {todayAttendance.notes && (
                  <p className="text-sm text-slate-500">{todayAttendance.notes}</p>
                )}

                {!todayAttendance.checkOutAt && (
                  <div className="pt-1">
                    {checkOutError && (
                      <p className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                        {checkOutError}
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={checkingOut}
                      onClick={() => void handleCheckOut()}
                    >
                      <FiLogOut className="size-4" aria-hidden="true" />
                      Absen pulang
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Kirim absensi" description="Satu kali absen masuk per hari">
            <div className="space-y-5">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">WFH · kerja dari rumah</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Sertakan foto sebagai bukti kamu sedang bekerja dari rumah.
                </p>
              </div>

              <div>
                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-700">
                  Catatan
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  maxLength={255}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Contoh: mengerjakan modul laporan"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{notes.length}/255</p>
              </div>

              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">Foto bukti kerja</p>
                <PhotoCapture file={photo} onChange={setPhoto} />
              </div>

              {formError && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{formError}</p>
              )}

              <Button className="w-full" loading={submitting} onClick={() => void handleSubmit()}>
                <FiSend className="size-4" aria-hidden="true" />
                Kirim absensi
              </Button>
            </div>
          </Card>
        )}

        <Card
          title="Riwayat absensi"
          description={loading ? 'Memuat data...' : `${history.length} absensi tercatat`}
          padded={false}
        >
          {notice && (
            <p className="mx-5 mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          {loadError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm text-rose-600">{loadError}</p>
              <Button
                variant="secondary"
                size="sm"
                iconOnly
                onClick={() => void loadHistory()}
                aria-label="Coba lagi"
                title="Coba lagi"
              >
                <FiRefreshCw className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : loading ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 px-5 py-4">
                  <div className="size-12 animate-pulse rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">
              Belum ada absensi. Kirim absensi pertamamu lewat formulir di samping.
            </p>
          ) : (
            <ul className="max-h-[520px] divide-y divide-slate-100 overflow-y-auto">
              {history.map((item) => (
                <li key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <a href={item.photoUrl} target="_blank" rel="noreferrer" className="shrink-0">
                    <img
                      src={item.photoUrl}
                      alt={`Foto absensi ${formatShortDate(item.attendanceDate)}`}
                      className="size-12 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {formatShortDate(item.attendanceDate)}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      Masuk {formatTime(item.checkInAt)}
                      {item.checkOutAt
                        ? ` · Pulang ${formatTime(item.checkOutAt)}`
                        : ' · Belum absen pulang'}
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </div>
                  <Badge tone="brand">{item.workType}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
