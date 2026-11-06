import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '../services/http';
import { createUser, updateUser } from '../services/user-service';
import type { EmployeeInput, User } from '../types';
import { Button } from './Button';
import { Input } from './Input';

interface EmployeeDialogProps {
  employee: User | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export const EmployeeDialog = ({ employee, onClose, onSaved }: EmployeeDialogProps) => {
  const [values, setValues] = useState({
    employeeCode: employee?.employeeCode ?? '',
    name: employee?.name ?? '',
    email: employee?.email ?? '',
    password: '',
    position: employee?.position ?? '',
    department: employee?.department ?? '',
    phone: employee?.phone ?? '',
    joinDate: employee?.joinDate ?? '',
    isActive: employee?.isActive ?? true,
  });
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

  const setField = <Key extends keyof typeof values>(key: Key, value: (typeof values)[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!employee && values.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (employee && values.password && values.password.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    const payload: EmployeeInput = {
      employeeCode: values.employeeCode,
      name: values.name,
      email: values.email,
      role: 'EMPLOYEE',
      isActive: values.isActive,
      ...(values.position.trim() ? { position: values.position.trim() } : {}),
      ...(values.department.trim() ? { department: values.department.trim() } : {}),
      ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
      ...(values.joinDate ? { joinDate: values.joinDate } : {}),
      ...(values.password ? { password: values.password } : {}),
    };

    setSaving(true);

    try {
      if (employee) {
        await updateUser(employee.id, payload);
        onSaved(`Data ${payload.name} berhasil diperbarui.`);
      } else {
        await createUser(payload);
        onSaved(`Karyawan ${payload.name} berhasil ditambahkan.`);
      }
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
        aria-label={employee ? 'Ubah data karyawan' : 'Tambah karyawan'}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              {employee ? 'Ubah data karyawan' : 'Tambah karyawan'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {employee
                ? 'Perubahan langsung berlaku pada akun karyawan.'
                : 'Akun baru bisa langsung dipakai untuk login.'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Tutup formulir">
            Tutup
          </Button>
        </header>

        <form onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
            <Input
              label="Kode karyawan"
              value={values.employeeCode}
              maxLength={20}
              placeholder="EMP-004"
              required
              onChange={(event) => setField('employeeCode', event.target.value)}
            />
            <Input
              label="Nama lengkap"
              value={values.name}
              maxLength={100}
              placeholder="Nama karyawan"
              required
              onChange={(event) => setField('name', event.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={values.email}
              placeholder="nama@attendance.test"
              required
              onChange={(event) => setField('email', event.target.value)}
            />
            <Input
              label={employee ? 'Password baru' : 'Password'}
              type="password"
              value={values.password}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              required={!employee}
              hint={employee ? 'Kosongkan bila tidak ingin mengubah password' : undefined}
              onChange={(event) => setField('password', event.target.value)}
            />

            <Input
              label="Tanggal masuk"
              type="date"
              value={values.joinDate}
              onChange={(event) => setField('joinDate', event.target.value)}
            />

            <Input
              label="Jabatan"
              value={values.position}
              maxLength={100}
              placeholder="Backend Engineer"
              onChange={(event) => setField('position', event.target.value)}
            />
            <Input
              label="Divisi"
              value={values.department}
              maxLength={100}
              placeholder="Engineering"
              onChange={(event) => setField('department', event.target.value)}
            />

            <Input
              label="Nomor telepon"
              value={values.phone}
              maxLength={20}
              placeholder="0812xxxxxxx"
              onChange={(event) => setField('phone', event.target.value)}
            />

            <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(event) => setField('isActive', event.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">Akun aktif</span>
                <span className="block text-xs text-slate-500">
                  Karyawan nonaktif tidak bisa login.
                </span>
              </span>
            </label>
          </div>

          {error && (
            <p className="mx-5 mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <footer className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Batal
            </Button>
            <Button size="sm" type="submit" loading={saving}>
              {employee ? 'Simpan perubahan' : 'Tambah karyawan'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};
