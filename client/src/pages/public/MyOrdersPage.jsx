import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateTime } from '../../utils/formatDate';
import { useSocketEvent } from '../../hooks/useSocket';

const MyOrdersPage = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const res = await api.get('/orders/mine');
      return res.data.data;
    },
  });

  useSocketEvent('order:updated', () => {
    qc.invalidateQueries({ queryKey: ['my-orders'] });
  });

  if (isLoading) return <LoadingSpinner className="py-40" size="lg" />;
  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-red-400">Failed to load orders.</p>
    </div>
  );

  const orders = data?.items ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('myOrders.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length > 0 ? `${orders.length} order${orders.length > 1 ? 's' : ''}` : ''}
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ShoppingBag}
          title={t('myOrders.empty')}
          description={t('myOrders.emptyDesc')}
          action={
            <Link to="/menu"
              className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors">
              {t('myOrders.browseMenu')}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.createdAt)}</p>
                  <p className="text-base font-bold text-amber-600 mt-1">{formatCurrency(order.totalPrice)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={order.status} />
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    {expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {t('myOrders.items')}
                  </p>
                  <div className="space-y-2">
                    {order.orderItems?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {item.menuItem?.imageUrl && (
                            <img src={item.menuItem.imageUrl} alt={item.menuItem.name}
                              className="w-8 h-8 rounded-lg object-cover" />
                          )}
                          <span className="text-gray-700">
                            {item.menuItem?.name} × {item.quantity}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-gray-800">
                    <span>{t('myOrders.total')}</span>
                    <span className="text-amber-600">{formatCurrency(order.totalPrice)}</span>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      📝 {order.notes}
                    </p>
                  )}
                  {order.reservation && (
                    <p className="text-xs text-blue-500 bg-blue-50 rounded-lg px-3 py-2">
                      🪑 {t('myOrders.linkedReservation')} — {order.reservation.timeSlot}
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

export default MyOrdersPage;