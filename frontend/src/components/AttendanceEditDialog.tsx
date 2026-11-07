import { useEffect, useState, type FormEvent } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { formatFullDate, toTimeInputValue } from '../lib/datetime';
import { updateMyAttendance } from '../services/attendance-service';
import { getErrorMessage } from '../services/http';
import type { Attendance } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { PhotoCapture } from './PhotoCapture';

interface AttendanceEditDialogProps {
  attendance: Attendance;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export const AttendanceEditDialog = ({
  attendance,
  onClose,
  onSaved,
}: AttendanceEditDialogProps) => {
  const [checkInTime, setCheckInTime] = useState(toTimeInputValue(attendance.checkInAt));
  const [checkOutTime, setCheckOutTime] = useState(
    attendance.checkOutAt ? toTimeInputValue(attendance.checkOutAt) : '',
  );
  const [notes, setNotes] = useState(attendance.notes ?? '');
  const [photo, setPhoto] = useState<File | null>(null);
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

    if (!checkInTime) {
      setError('Jam masuk wajib diisi.');
      return;
    }

    if (checkOutTime && checkOutTime <= checkInTime) {
      setError('Jam pulang harus setelah jam masuk.');
      return;
    }

    setSaving(true);

    try {
      await updateMyAttendance(attendance.id, {
        checkInTime,
        checkOutTime,
        notes,
        photo,
      });
      onSaved(`Absensi ${formatFullDate(attendance.attendanceDate)} berhasil diperbarui.`);
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
        aria-label="Ubah absensi"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Ubah absensi</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatFullDate(attendance.attendanceDate)} · jam, catatan, dan foto bisa diperbaiki.
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
          <div className="space-y-4 px-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Jam masuk"
                type="time"
                value={checkInTime}
                required
                onChange={(event) => setCheckInTime(event.target.value)}
              />
              <Input
                label="Jam pulang"
                type="time"
                value={checkOutTime}
                hint="Kosongkan bila belum absen pulang"
                onChange={(event) => setCheckOutTime(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="edit-notes" className="mb-2 block text-sm font-medium text-slate-700">
                Catatan
              </label>
              <textarea
                id="edit-notes"
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
              <PhotoCapture
                file={photo}
                onChange={setPhoto}
                existingPhotoUrl={attendance.photoUrl}
              />
              <p className="mt-1 text-xs text-slate-400">
                Biarkan foto saat ini bila tidak ingin menggantinya.
              </p>
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
              <FiCheck className="size-4" aria-hidden="true" />
              Simpan perubahan
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};
