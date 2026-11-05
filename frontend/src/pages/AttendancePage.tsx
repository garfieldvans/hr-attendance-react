import { useCallback, useEffect, useState } from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { PhotoCapture } from '../components/PhotoCapture';
import { formatFullDate, formatShortDate, formatTime, todayValue } from '../lib/datetime';
import { getMyAttendances, submitAttendance } from '../services/attendance-service';
import { getErrorMessage } from '../services/http';
import type { Attendance, WorkType } from '../types';

const workTypes: { value: WorkType; label: string; description: string }[] = [
  { value: 'WFH', label: 'WFH', description: 'Kerja dari rumah' },
  { value: 'WFO', label: 'WFO', description: 'Kerja dari kantor' },
];

export const AttendancePage = () => {
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [workType, setWorkType] = useState<WorkType>('WFH');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
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
      await submitAttendance({ photo, workType, notes });
      setPhoto(null);
      setNotes('');
      setWorkType('WFH');
      setNotice('Absensi hari ini berhasil dikirim.');
      await loadHistory();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
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
          <Card title="Absensi hari ini" description="Kamu sudah absen, tidak perlu absen ulang">
            <div className="flex flex-col gap-4 sm:flex-row">
              <img
                src={todayAttendance.photoUrl}
                alt="Foto bukti absensi hari ini"
                className="h-32 w-full rounded-xl object-cover sm:w-32"
              />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge tone={todayAttendance.workType === 'WFH' ? 'brand' : 'neutral'}>
                    {todayAttendance.workType}
                  </Badge>
                  <Badge tone="success">Tercatat</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Masuk pukul{' '}
                  <span className="font-semibold text-slate-900">
                    {formatTime(todayAttendance.checkInAt)}
                  </span>
                </p>
                {todayAttendance.notes && (
                  <p className="text-sm text-slate-500">{todayAttendance.notes}</p>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Kirim absensi" description="Satu kali per hari, tanpa check-out">
            <div className="space-y-5">
              <div>
                <p className="mb-2 block text-sm font-medium text-slate-700">Tipe kerja</p>
                <div className="grid grid-cols-2 gap-2">
                  {workTypes.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setWorkType(option.value)}
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        workType === option.value
                          ? 'border-indigo-400 bg-indigo-50 ring-2 ring-indigo-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-sm font-semibold text-slate-900">
                        {option.label}
                      </span>
                      <span className="block text-xs text-slate-500">{option.description}</span>
                    </button>
                  ))}
                </div>
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
              <Button variant="secondary" size="sm" onClick={() => void loadHistory()}>
                Coba lagi
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
                      {item.notes ? ` · ${item.notes}` : ''}
                    </p>
                  </div>
                  <Badge tone={item.workType === 'WFH' ? 'brand' : 'neutral'}>{item.workType}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};
