import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmployeeDialog } from '../components/EmployeeDialog';
import { getErrorMessage } from '../services/http';
import { deleteUser, getUsers } from '../services/user-service';
import type { User } from '../types';

export const EmployeesPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadUsers = useCallback(async (search: string) => {
    setLoading(true);
    setError('');

    try {
      setUsers(await getUsers({ role: 'EMPLOYEE', ...(search ? { q: search } : {}) }));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadUsers(keyword.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, loadUsers]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setDialogOpen(true);
  };

  const handleSaved = (message: string) => {
    setDialogOpen(false);
    setEditing(null);
    setActionError('');
    setNotice(message);
    void loadUsers(keyword.trim());
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Hapus karyawan ${user.name}? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }

    setActionError('');
    setNotice('');
    setDeletingId(user.id);

    try {
      await deleteUser(user.id);
      setNotice(`${user.name} berhasil dihapus.`);
      await loadUsers(keyword.trim());
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Data karyawan</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading ? 'Memuat data...' : `${users.length} karyawan ditemukan`}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <input
            type="search"
            aria-label="Cari karyawan"
            placeholder="Cari nama, kode, atau email"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 sm:w-72"
          />
          <Button size="sm" onClick={openCreate}>
            Tambah karyawan
          </Button>
        </div>
      </div>

      {notice && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      )}

      {actionError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{actionError}</p>
      )}

      <Card padded={false}>
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-rose-600">{error}</p>
            <Button variant="secondary" size="sm" onClick={() => void loadUsers(keyword.trim())}>
              Coba lagi
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Kode</th>
                  <th className="px-5 py-3 font-medium">Nama</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Departemen</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Aksi</th>
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
                  : users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium text-slate-600">{user.employeeCode}</td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/karyawan/${user.id}`}
                            className="font-medium text-slate-900 transition hover:text-indigo-700 hover:underline"
                          >
                            {user.name}
                          </Link>
                          <p className="text-xs text-slate-500">{user.position ?? '-'}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{user.email}</td>
                        <td className="px-5 py-4 text-slate-600">{user.department ?? '-'}</td>
                        <td className="px-5 py-4">
                          <Badge tone={user.role === 'HRD' ? 'brand' : 'neutral'}>
                            {user.role === 'HRD' ? 'HRD' : 'Karyawan'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={user.isActive ? 'success' : 'danger'}>
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                              Ubah
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={deletingId === user.id}
                              onClick={() => void handleDelete(user)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!loading && users.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                Tidak ada karyawan yang cocok dengan pencarian.
              </div>
            )}
          </div>
        )}
      </Card>

      {dialogOpen && (
        <EmployeeDialog
          employee={editing}
          onClose={() => setDialogOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};
