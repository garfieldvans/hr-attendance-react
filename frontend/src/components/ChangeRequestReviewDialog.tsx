import { useEffect, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { formatFullDate, formatTime } from '../lib/datetime';
import { reviewChangeRequest } from '../services/change-request-service';
import { getErrorMessage } from '../services/http';
import type { ChangeRequest, ChangeRequestStatus } from '../types';
import { Button } from './Button';

interface ChangeRequestReviewDialogProps {
  request: ChangeRequest;
  onClose: () => void;
  onReviewed: (message: string) => void;
}

export const ChangeRequestReviewDialog = ({
  request,
  onClose,
  onReviewed,
}: ChangeRequestReviewDialogProps) => {
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState<ChangeRequestStatus | null>(null);
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

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    setError('');
    setReviewing(status);

    try {
      await reviewChangeRequest(request.id, { status, reviewNote });
      onReviewed(
        status === 'APPROVED'
          ? `Koreksi ${request.employee?.name ?? 'karyawan'} disetujui.`
          : `Koreksi ${request.employee?.name ?? 'karyawan'} ditolak.`,
      );
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setReviewing(null);
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
        aria-label="Tinjau permintaan koreksi"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Tinjau permintaan koreksi</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {request.employee?.name ?? 'Karyawan'} ·{' '}
              {request.employee?.employeeCode ?? '-'}
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

        <div className="space-y-4 px-5 py-5">
          <dl className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Tanggal absensi</dt>
              <dd className="font-medium text-slate-900">
                {formatFullDate(request.attendance.attendanceDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Jam tercatat</dt>
              <dd className="font-medium text-slate-900">
                Masuk {formatTime(request.attendance.checkInAt)}
                {request.attendance.checkOutAt
                  ? ` · Pulang ${formatTime(request.attendance.checkOutAt)}`
                  : ' · Belum absen pulang'}
              </dd>
            </div>
            {request.attendance.notes && (
              <div className="col-span-2">
                <dt className="text-xs text-slate-500">Catatan absensi</dt>
                <dd className="text-slate-700">{request.attendance.notes}</dd>
              </div>
            )}
          </dl>

          <div>
            <p className="text-xs text-slate-500">Alasan dari karyawan</p>
            <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {request.reason}
            </p>
          </div>

          <div>
            <label htmlFor="review-note" className="mb-2 block text-sm font-medium text-slate-700">
              Catatan HRD
            </label>
            <textarea
              id="review-note"
              rows={2}
              maxLength={255}
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              placeholder="Opsional, misalnya alasan penolakan"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <p className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-slate-600">
            Setelah disetujui, karyawan bisa memperbaiki jam masuk, jam pulang, catatan, dan foto
            absensi tersebut satu kali.
          </p>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <Button
            variant="danger"
            size="sm"
            loading={reviewing === 'REJECTED'}
            disabled={reviewing === 'APPROVED'}
            onClick={() => void handleReview('REJECTED')}
          >
            <FiX className="size-4" aria-hidden="true" />
            Tolak
          </Button>
          <Button
            size="sm"
            loading={reviewing === 'APPROVED'}
            disabled={reviewing === 'REJECTED'}
            onClick={() => void handleReview('APPROVED')}
          >
            <FiCheck className="size-4" aria-hidden="true" />
            Setujui
          </Button>
        </footer>
      </div>
    </div>
  );
};
