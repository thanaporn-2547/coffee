import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, ShieldCheck, ShieldOff, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatDate';
import useAuthStore from '../../store/authStore';

const AdminUsersPage = () => {
  const qc = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/users', { params: { search: search || undefined, limit: 50 } }).then(r => r.data.data),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.put(`/users/${id}/role`, { role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('Role updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted');
      setDeleteDialog({ open: false, id: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-64" />
        </div>
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : data?.items?.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.items?.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700 text-sm">
                        {u.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.fullName}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{formatDateTime(u.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      {u.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => roleMutation.mutate({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}
                            title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            {u.role === 'admin' ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                          </button>
                          <button onClick={() => setDeleteDialog({ open: true, id: u.id })}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        isLoading={deleteMutation.isPending}
        title="Delete User"
        message="Are you sure? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminUsersPage;