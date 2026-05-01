import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Table2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const schema = z.object({
  tableNumber: z.coerce.number().int().positive('Table number must be positive'),
  capacity: z.coerce.number().int().min(1).max(20),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  isActive: z.boolean().optional(),
});

const AdminTablesPage = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editTarget, setEditTarget] = useState(null);

  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['admin-tables'],
    queryFn: () => api.get('/tables').then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ tableNumber: '', capacity: 4, location: '', description: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditTarget(t);
    reset({ tableNumber: t.tableNumber, capacity: t.capacity, location: t.location || '', description: t.description || '', status: t.status, isActive: t.isActive });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editTarget ? api.put(`/tables/${editTarget.id}`, data) : api.post('/tables', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tables'] });
      toast.success(editTarget ? 'Table updated' : 'Table created');
      setModalOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tables/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-tables'] });
      toast.success('Table deleted');
      setDeleteDialog({ open: false, id: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const statusColor = { available: 'border-green-200 bg-green-50', occupied: 'border-red-200 bg-red-50', reserved: 'border-blue-200 bg-blue-50', maintenance: 'border-gray-200 bg-gray-50' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tables</h1>
          <p className="text-gray-500 text-sm mt-1">Manage restaurant tables</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors">
          <Plus size={18} /> Add Table
        </button>
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : tables.length === 0 ? (
        <EmptyState icon={Table2} title="No tables yet" description="Add your first table" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map(t => (
            <div key={t.id} className={`rounded-2xl p-4 border-2 ${statusColor[t.status]} relative`}>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Table2 size={20} className="text-gray-600" />
                </div>
                <Badge status={t.status} />
              </div>
              <p className="font-bold text-gray-800 text-lg">T{t.tableNumber}</p>
              <p className="text-xs text-gray-500">{t.capacity} seats</p>
              {t.location && <p className="text-xs text-gray-400 mt-0.5">{t.location}</p>}
              <div className="flex gap-1 mt-3">
                <button onClick={() => openEdit(t)}
                  className="flex-1 py-1.5 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-medium border border-gray-200 transition-colors flex items-center justify-center gap-1">
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => setDeleteDialog({ open: true, id: t.id })}
                  className="px-2 py-1.5 bg-white hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Table' : 'Add Table'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Table Number *</label>
              <input {...register('tableNumber')} type="number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.tableNumber && <p className="text-red-500 text-xs mt-1">{errors.tableNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input {...register('capacity')} type="number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input {...register('location')} placeholder="e.g. Indoor, Outdoor, Private Room"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
          {editTarget && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select {...register('status')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saveMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id)}
        isLoading={deleteMutation.isPending}
        title="Delete Table"
        message="Are you sure you want to delete this table?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminTablesPage;