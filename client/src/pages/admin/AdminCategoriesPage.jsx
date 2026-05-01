import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

const AdminCategoriesPage = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editTarget, setEditTarget] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', description: '', sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    reset({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editTarget
        ? api.put(`/categories/${editTarget.id}`, data)
        : api.post('/categories', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success(editTarget ? 'Category updated' : 'Category created');
      setModalOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error saving category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
      setDeleteDialog({ open: false, id: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error deleting category'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage food categories</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : categories.length === 0 ? (
        <EmptyState icon={BookOpen} title="No categories yet" description="Create your first menu category" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-3">
                  🍽️
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteDialog({ open: true, id: cat.id })}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
              <p className="text-xs text-gray-400 mt-2">Sort: {cat.sortOrder}</p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input {...register('name')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
            <input {...register('sortOrder')} type="number"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
          </div>
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
        title="Delete Category"
        message="Are you sure you want to delete this category? All menu items in this category may be affected."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminCategoriesPage;