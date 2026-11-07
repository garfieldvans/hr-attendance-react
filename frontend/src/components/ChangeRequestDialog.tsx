import { useEffect, useState, type FormEvent } from 'react';
import { FiSend, FiX } from 'react-icons/fi';
import { formatFullDate, formatTime } from '../lib/datetime';
import { createChangeRequest } from '../services/change-request-service';
import { getErrorMessage } from '../services/http';
import type { Attendance } from '../types';
import { Button } from './Button';

interface ChangeRequestDialogProps {
  attendance: Attendance;
  onClose: () => void;
  onCreated: (message: string) => void;
}

export const ChangeRequestDialog = ({
  attendance,
  onClose,
  onCreated,
}: ChangeRequestDialogProps) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (reason.trim().length < 5) {
      setError('Alasan minimal 5 karakter.');
      return;
    }

    setSaving(true);

    try {
      await createChangeRequest({ attendanceId: attendance.id, reason: reason.trim() });
      onCreated('Permintaan koreksi terkirim, tunggu persetujuan HRD.');
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 py-10"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ajukan koreksi absensi"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Ajukan koreksi absensi</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatFullDate(attendance.attendanceDate)} · masuk {formatTime(attendance.checkInAt)}
              {attendance.checkOutAt
                ? ` · pulang ${formatTime(attendance.checkOutAt)}`
                : ' · belum absen pulang'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={onClose}
            aria-label="Tutup formulir"
            title="Tutup"
          >
            <FiX className="size-4" aria-hidden="true" />
          </Button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="space-y-3 px-5 py-5">
            <p className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-slate-600">
              Absensi hari sebelumnya hanya bisa diubah setelah HRD menyetujui permintaan ini.
              Setelah disetujui, jam masuk, jam pulang, catatan, dan foto bisa kamu perbaiki.
            </p>

            <div>
              <label
                htmlFor="change-reason"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Alasan koreksi
              </label>
              <textarea
                id="change-reason"
                rows={4}
                maxLength={255}
                value={reason}
                required
                autoFocus
                onChange={(event) => setReason(event.target.value)}
                placeholder="Contoh: salah input jam masuk, seharusnya 08.00 bukan 09.00"
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{reason.length}/255</p>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            )}
          </div>

          <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button size="sm" type="submit" loading={saving}>
              <FiSend className="size-4" aria-hidden="true" />
              Kirim permintaan
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};
