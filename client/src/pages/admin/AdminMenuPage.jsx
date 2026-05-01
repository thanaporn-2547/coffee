import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, UtensilsCrossed, ToggleLeft, ToggleRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency } from '../../utils/formatCurrency';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().optional(),
  isAvailable: z.boolean().optional(),
});

const AdminMenuPage = () => {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [editTarget, setEditTarget] = useState(null);
  const [filterCat, setFilterCat] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['admin-menu', filterCat],
    queryFn: () => api.get('/menu', { params: { categoryId: filterCat || undefined, limit: 100 } }).then(r => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset({ name: '', categoryId: '', description: '', price: '', imageUrl: '', sortOrder: 0, isAvailable: true });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    reset({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || '',
      price: parseFloat(item.price),
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder,
      isAvailable: item.isAvailable,
    });
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, imageUrl: data.imageUrl || undefined };
      return editTarget
        ? api.put(`/menu/${editTarget.id}`, payload)
        : api.post('/menu', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success(editTarget ? 'Menu item updated' : 'Menu item created');
      setModalOpen(false);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error saving menu item'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/menu/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-menu'] });
      toast.success('Menu item deleted');
      setDeleteDialog({ open: false, id: null });
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => api.put(`/menu/${id}`, { isAvailable }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-menu'] }),
    onError: () => toast.error('Failed to update availability'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Menu Items</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your restaurant menu</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-colors">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!filterCat ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setFilterCat(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterCat === cat.id ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : menuData?.items?.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No menu items" description="Add your first menu item" />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Item</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Price</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-600">Available</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {menuData?.items?.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : '🍽️'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                      {item.category?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleMutation.mutate({ id: item.id, isAvailable: !item.isAvailable })}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${item.isAvailable ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {item.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {item.isAvailable ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(item)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteDialog({ open: true, id: item.id })}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Menu Item' : 'Add Menu Item'} size="lg">
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input {...register('name')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('categoryId')} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿) *</label>
              <input {...register('price')} type="number" step="0.01"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea {...register('description')} rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input {...register('imageUrl')} type="url" placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input {...register('sortOrder')} type="number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
            </div>
            {editTarget && (
              <div className="col-span-2 flex items-center gap-3">
                <input {...register('isAvailable')} type="checkbox" id="isAvailable" className="w-4 h-4 accent-amber-500" />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">Available for order</label>
              </div>
            )}
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
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default AdminMenuPage;