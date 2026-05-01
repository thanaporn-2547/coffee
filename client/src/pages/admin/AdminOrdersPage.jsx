import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { useSocketEvent } from '../../hooks/useSocket';

const STATUSES = ['', 'pending', 'preparing', 'served', 'completed', 'cancelled'];
const NEXT_STATUS = { pending: 'preparing', preparing: 'served', served: 'completed' };

const AdminOrdersPage = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => api.get('/orders', { params: { status: statusFilter || undefined, limit: 50 } }).then(r => r.data.data),
  });

  useSocketEvent('order:new', () => qc.invalidateQueries({ queryKey: ['admin-orders'] }));
  useSocketEvent('order:updated', () => qc.invalidateQueries({ queryKey: ['admin-orders'] }));

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-orders'] }); toast.success('Order status updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const statusColors = {
    preparing: 'bg-orange-500 hover:bg-orange-600',
    served: 'bg-purple-500 hover:bg-purple-600',
    completed: 'bg-green-500 hover:bg-green-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all customer orders</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-amber-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingSpinner className="py-20" size="lg" /> : data?.items?.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders found" />
      ) : (
        <div className="space-y-3">
          {data?.items?.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{order.user?.fullName}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-gray-800">{formatCurrency(order.totalPrice)}</span>
                  <Badge status={order.status} />
                  {NEXT_STATUS[order.status] && (
                    <button
                      onClick={() => statusMutation.mutate({ id: order.id, status: NEXT_STATUS[order.status] })}
                      disabled={statusMutation.isPending}
                      className={`px-3 py-1.5 ${statusColors[NEXT_STATUS[order.status]]} text-white rounded-lg text-xs font-medium transition-colors capitalize disabled:opacity-50`}>
                      Mark as {NEXT_STATUS[order.status]}
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      onClick={() => statusMutation.mutate({ id: order.id, status: 'cancelled' })}
                      disabled={statusMutation.isPending}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                      Cancel
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Order Items</p>
                  <div className="space-y-2">
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.menuItem?.name} × {item.quantity}</span>
                        <span className="font-medium text-gray-800">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <p className="text-xs text-gray-500 mt-3 bg-gray-50 rounded-lg px-3 py-2">
                      📝 {order.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;